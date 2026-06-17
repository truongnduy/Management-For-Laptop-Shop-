# Hướng dẫn Phát triển Nghiệp vụ E-Commerce Nâng Cao

Tài liệu này cung cấp các bước thực hiện, lệnh tạo DB (Migration), và code mẫu (Models, Services) cho 6 tính năng nâng cao của dự án LapShop. Bạn có thể tự mình code theo các bước dưới đây.

---

## 1. Phân quyền Admin (RBAC)

**Mục tiêu:** Chỉ Admin mới được quản lý Product (thêm/sửa/xóa). Customer chỉ được xem và mua.

### 1.1. Migration
Thêm cột `role` vào bảng `users`:
```bash
rails generate migration AddRoleToUsers role:string
```
Trong file migration vừa sinh ra:
```ruby
class AddRoleToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :role, :string, default: "customer"
  end
end
```

### 1.2. Model
Chỉnh sửa `app/models/user.rb` để định nghĩa Enum:
```ruby
class User < ApplicationRecord
  # Các code cũ giữ nguyên...
  enum :role, { customer: "customer", admin: "admin" }

  def admin?
    role == "admin"
  end
end
```

### 1.3. Áp dụng vào Controller
Trong `app/controllers/application_controller.rb`, thêm hàm chặn:
```ruby
  def require_admin
    unless current_user&.admin?
      render json: { success: false, error: "Access Denied: Admins only" }, status: :forbidden
    end
  end
```
Trong `ProductsController`, áp dụng chặn:
```ruby
class Api::Authen::ProductsController < ApplicationController
  before_action :require_admin, only: [:create, :update, :destroy]
  # Các action khác giữ nguyên
end
```

---

## 2. Categories & Brands (Danh mục & Thương hiệu)

**Mục tiêu:** Tách Brand và Category ra bảng riêng để dễ quản lý và lọc.

### 2.1. Migration
```bash
rails generate model Category name:string description:text
rails generate model Brand name:string
rails generate migration AddCategoryAndBrandToProducts category:references brand:references
```
*(Chạy `rails db:migrate` sau khi tạo)*

### 2.2. Models
Trong `app/models/category.rb` và `app/models/brand.rb`:
```ruby
class Category < ApplicationRecord
  has_many :products
end

class Brand < ApplicationRecord
  has_many :products
end
```
Cập nhật `app/models/product.rb`:
```ruby
class Product < ApplicationRecord
  belongs_to :category, optional: true
  belongs_to :brand, optional: true
end
```

---

## 3. Reviews & Ratings (Đánh giá sản phẩm)

**Mục tiêu:** Khách hàng đánh giá sao và bình luận sau khi nhận hàng.

### 3.1. Migration
```bash
rails generate model Review user:references product:references rating:integer comment:text
```

### 3.2. Model
Trong `app/models/review.rb`:
```ruby
class Review < ApplicationRecord
  belongs_to :user
  belongs_to :product

  validates :rating, presence: true, inclusion: { in: 1..5 }
  validates :comment, length: { maximum: 500 }
end
```

### 3.3. Service Logic (Kiểm tra điều kiện Review)
Chỉ được review nếu đã từng mua và đơn hàng đã giao (`delivered`).
Trong `app/services/review_service.rb`:
```ruby
class ReviewService
  class << self
    def create_review(user_id, product_id, rating, comment)
      # Kiểm tra xem user đã mua sản phẩm này và nhận hàng chưa
      has_bought = OrderItem.joins(:order)
                            .where(orders: { user_id: user_id, status: 'delivered' })
                            .where(product_id: product_id)
                            .exists?

      return { success: false, error: "Bạn chưa mua sản phẩm này" } unless has_bought

      review = Review.create(user_id: user_id, product_id: product_id, rating: rating, comment: comment)
      { success: true, data: review }
    end
  end
end
```

---

## 4. Coupons (Mã giảm giá)

**Mục tiêu:** Áp dụng mã giảm giá khi thanh toán.

### 4.1. Migration
```bash
rails generate model Coupon code:string discount_percent:decimal max_discount_amount:decimal expiry_date:datetime
rails generate migration AddCouponToOrders coupon:references discount_amount:decimal
```
*(Chạy `rails db:migrate`)*

### 4.2. Model
Trong `app/models/coupon.rb`:
```ruby
class Coupon < ApplicationRecord
  validates :code, presence: true, uniqueness: true
  
  def valid_to_use?
    expiry_date > Time.current
  end
  
  def calculate_discount(total_cart_value)
    discount = total_cart_value * (discount_percent / 100.0)
    discount > max_discount_amount ? max_discount_amount : discount
  end
end
```

### 4.3. Tích hợp vào OrderService
Trong hàm `checkout` của `OrderService`:
```ruby
    # Tìm coupon nếu user có nhập
    coupon = Coupon.find_by(code: shipping_params[:coupon_code])
    if coupon && !coupon.valid_to_use?
      return error("Mã giảm giá đã hết hạn")
    end

    # Tính toán tổng tiền của giỏ hàng
    subtotal = cart.cart_items.sum { |item| item.quantity * item.product.price }
    
    discount_amount = 0
    discount_amount = coupon.calculate_discount(subtotal) if coupon

    final_total = subtotal - discount_amount

    # Khi tạo Order:
    order = Order.create!(
      user_id: user_id,
      status: :pending,
      total_price: final_total,
      coupon_id: coupon&.id,
      discount_amount: discount_amount,
      # ...
    )
```

---

## 5. Soft Delete & Inventory Logs (Quản lý kho an toàn)

**Mục tiêu:** Khi ngừng bán Laptop, không xóa khỏi DB mà ẩn đi để giữ lịch sử mua hàng. Lưu lại lịch sử nhập kho.

### 5.1. Soft Delete (Xóa mềm)
Sử dụng Gem `discard`:
```ruby
# Trong Gemfile
gem 'discard', '~> 3.0'
```
Chạy lệnh: `bundle install`
Tạo migration thêm cột:
```bash
rails generate migration AddDiscardedAtToProducts discarded_at:datetime:index
```
Trong `app/models/product.rb`:
```ruby
class Product < ApplicationRecord
  include Discard::Model
  
  # Lọc các sản phẩm chưa bị xóa mềm
  default_scope -> { kept }
end
```
Từ giờ, thay vì gọi `product.destroy`, bạn gọi `product.discard`.

### 5.2. Inventory Logs (Lịch sử nhập kho)
```bash
rails generate model InventoryLog product:references quantity_added:integer note:string
```
Mỗi khi nhập thêm hàng, admin không sửa thẳng số trong DB, mà dùng Service:
```ruby
class InventoryService
  class << self
    def add_stock(product_id, quantity, note)
      ActiveRecord::Base.transaction do
        product = Product.find(product_id)
        product.increment!(:stock, quantity)
        InventoryLog.create!(product: product, quantity_added: quantity, note: note)
      end
    end
  end
end
```

---

## 6. Wishlist (Sản phẩm yêu thích)

**Mục tiêu:** Cho khách hàng đánh dấu sản phẩm để mua sau.

### 6.1. Migration
```bash
rails generate model Wishlist user:references product:references
```
Đảm bảo unique user và product (một người không thể thích 1 máy 2 lần):
```ruby
# Trong migration vừa tạo, thêm:
add_index :wishlists, [:user_id, :product_id], unique: true
```

### 6.2. Model
Trong `app/models/wishlist.rb`:
```ruby
class Wishlist < ApplicationRecord
  belongs_to :user
  belongs_to :product
  
  validates :product_id, uniqueness: { scope: :user_id, message: "đã có trong danh sách yêu thích" }
end
```

### 6.3. Controller tham khảo
```ruby
class Api::Authen::WishlistsController < ApplicationController
  def toggle
    product_id = params[:product_id]
    wishlist_item = Wishlist.find_by(user_id: current_user.id, product_id: product_id)
    
    if wishlist_item
      wishlist_item.destroy
      render json: { success: true, message: "Đã bỏ yêu thích" }
    else
      Wishlist.create!(user_id: current_user.id, product_id: product_id)
      render json: { success: true, message: "Đã thêm vào yêu thích" }
    end
  end
end
```
