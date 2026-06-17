# Hướng Dẫn Hoàn Thiện Dự Án LapShop (Bán Laptop)

Chào bạn! Dưới đây là hướng dẫn chi tiết từng bước để tự hoàn thiện dự án **LapShop** (Ruby on Rails 8.1 API) theo đúng kiến trúc **Clean Architecture / Layered Architecture** (Controller -> Service -> Repository -> Model/Serializer) hiện tại.

Đặc thù đây là hệ thống API bán **Laptop**, nên model Product cần chứa các thông số kỹ thuật chuyên dụng, và hệ thống cần có thêm các module phục vụ e-commerce cơ bản như **Cart (Giỏ hàng)** và **Order (Đơn hàng)**.

---

## 🔍 1. Khảo sát cấu trúc hiện tại của dự án
Dự án được xây dựng với cấu trúc phân tầng rõ ràng:
- **Models**: Chứa các khai báo ActiveRecord và validation (`app/models/`).
- **Repositories**: Chuyên trách truy vấn Database, cô lập các thao tác ActiveRecord (`app/repositories/`).
- **Services**: Chứa logic nghiệp vụ (business logic) của hệ thống (`app/services/`).
- **Serializers (DTO)**: Định dạng dữ liệu JSON trả về cho API client (`app/serializers/`).
- **Controllers**: Điều phối request/response, gọi Service để xử lý (`app/controllers/`).

### 📌 Trạng thái hiện tại:
- **Đã hoàn thiện**: Luồng **Authentication & User Management** (Đăng ký, Đăng nhập JWT, Thông tin cá nhân, CRUD User).
- **Chưa hoàn thiện**: Luồng Quản lý sản phẩm, Giỏ hàng, và Đặt hàng.

---

## 💻 2. Hoàn thiện chức năng Product (Đặc thù cho Laptop)

### Bước 1: Tạo Database Migration & Model cho Product (Laptop)
Laptop cần có các thông số như CPU, RAM, Ổ cứng, Màn hình, Card đồ họa và Thương hiệu.

**Lệnh chạy:**
```bash
rails generate model Product name:string description:text price:decimal stock:integer status:string brand:string cpu:string ram:string storage:string screen:string gpu:string
```

**File Migration sẽ được tạo tại `db/migrate/xxxxxx_create_products.rb`:**
```ruby
class CreateProducts < ActiveRecord::Migration[8.1]
  def change
    create_table :products do |t|
      t.string :name, null: false
      t.text :description
      t.decimal :price, precision: 15, scale: 2, default: 0.0, null: false
      t.integer :stock, default: 0, null: false
      t.string :status, default: "active", null: false
      
      # Thông số Laptop
      t.string :brand
      t.string :cpu
      t.string :ram
      t.string :storage
      t.string :screen
      t.string :gpu

      t.timestamps
    end
    add_index :products, :name
    add_index :products, :brand
  end
end
```

**Khai báo Validation trong Model `app/models/product.rb`:**
```ruby
class Product < ApplicationRecord
  validates :name, presence: true, length: { maximum: 255 }
  validates :price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :stock, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :status, presence: true, inclusion: { in: %w[active inactive] }
end
```
*(Chạy lệnh `rails db:migrate` sau khi tạo)*

### Bước 2: Áp dụng kiến trúc Clean Architecture
Bạn tạo `ProductRepository`, `ProductSerializer`, `ProductService`, và `Api::Authen::ProductsController` theo pattern giống hệt như `UserService` hiện tại. 
**Chú ý:** Cập nhật `product_params` trong Controller và các hash trả về trong Serializer để bao gồm các trường mới như `brand`, `cpu`, `ram`, v.v.

*(Bạn có thể xoá file thừa `app/controllers/productController.rb` ở thư mục gốc đi vì nó không nằm trong đúng namespace của API).*

---

## 🛒 3. Triển khai Giỏ Hàng (Cart & Cart Items)

Để thiết kế API Giỏ hàng chuẩn REST, ta cần 2 bảng: `carts` (thuộc về user) và `cart_items` (chi tiết sản phẩm trong giỏ).

### Bước 1: Tạo Migration & Models
**Lệnh chạy:**
```bash
rails generate model Cart user:references
rails generate model CartItem cart:references product:references quantity:integer
rails db:migrate
```

**Khai báo Associations trong Models:**
```ruby
# app/models/user.rb
class User < ApplicationRecord
  has_one :cart, dependent: :destroy
  # ...
end

# app/models/cart.rb
class Cart < ApplicationRecord
  belongs_to :user
  has_many :cart_items, dependent: :destroy
  has_many :products, through: :cart_items
end

# app/models/cart_item.rb
class CartItem < ApplicationRecord
  belongs_to :cart
  belongs_to :product
  
  validates :quantity, presence: true, numericality: { only_integer: true, greater_than: 0 }
end
```

### Bước 2: Logic cho CartService
Bạn định nghĩa `CartService` với các hàm cơ bản:
1. **`get_cart(user_id)`**: Tìm cart của user (nếu chưa có thì tạo bằng `Cart.create`). Trả về chi tiết giỏ hàng kèm data của sản phẩm trong đó.
2. **`add_to_cart(user_id, product_id, quantity)`**:
   - Tìm hoặc tạo Cart cho user.
   - Kiểm tra `stock` của `Product` xem có đủ hàng không.
   - Tìm `CartItem` theo `product_id`. Nếu đã có thì cộng dồn `quantity`, nếu chưa có thì tạo mới.
3. **`update_cart_item(cart_item_id, quantity)`**: Sửa số lượng của 1 item cụ thể.
4. **`remove_from_cart(cart_item_id)`**: Xóa 1 item khỏi giỏ.

### Bước 3: API CartsController
Tạo `app/controllers/api/authen/carts_controller.rb`:
```ruby
module Api
  module Authen
    class CartsController < ApplicationController
      before_action :authenticate_request

      # GET /api/authen/cart
      def show; end

      # POST /api/authen/cart/add
      def add_item; end

      # PUT /api/authen/cart/items/:id
      def update_item; end

      # DELETE /api/authen/cart/items/:id
      def remove_item; end
    end
  end
end
```
*(Cập nhật `config/routes.rb` để route tới các hàm này)*

---

## 📦 4. Triển khai Đơn Hàng (Orders) & Thanh toán

Luồng mua hàng: User vào xem Giỏ hàng -> Gọi API Checkout -> Hệ thống tạo Order -> Xóa sạch Giỏ hàng.

### Bước 1: Tạo Migration & Models
**Lệnh chạy:**
```bash
rails generate model Order user:references total_price:decimal status:string shipping_address:text phone_number:string
rails generate model OrderItem order:references product:references quantity:integer price_at_purchase:decimal
rails db:migrate
```
*(Ghi chú: Phải lưu trường `price_at_purchase` ở `OrderItem` vì giá laptop có thể đổi trong tương lai, nhưng giá lịch sử trong đơn hàng đã chốt thì không được đổi).*

**Models:**
```ruby
# app/models/order.rb
class Order < ApplicationRecord
  belongs_to :user
  has_many :order_items, dependent: :destroy
  
  validates :status, inclusion: { in: %w[pending processing shipped delivered cancelled] }
  validates :total_price, numericality: { greater_than_or_equal_to: 0 }
end

# app/models/order_item.rb
class OrderItem < ApplicationRecord
  belongs_to :order
  belongs_to :product
end
```

### Bước 2: Logic cốt lõi cho OrderService (Checkout)
Phần phức tạp nhất là hàm `checkout(user_id, shipping_params)`:
1. Lấy `Cart` của user. Nếu giỏ rỗng -> báo lỗi.
2. Dùng Database Transaction (`ActiveRecord::Base.transaction do ... end`) để đảm bảo nếu có lỗi giữa chừng thì không bị sai dữ liệu:
   - Tạo `Order` mới (trạng thái `pending`).
   - Lặp qua từng `CartItem`:
     - Trừ đi `stock` của `Product` tương ứng. *(Nếu stock < quantity thì throw exception để rollback transaction và báo lỗi hết hàng cho User).*
     - Tạo `OrderItem` copy thông tin từ `CartItem` (lấy giá hiện hành của Product bỏ vào `price_at_purchase`).
   - Xóa toàn bộ `CartItem` trong `Cart` (làm trống giỏ).
3. Trả về thông tin Order đã chốt.

### Bước 3: API OrdersController
Tạo `app/controllers/api/authen/orders_controller.rb`:
```ruby
module Api
  module Authen
    class OrdersController < ApplicationController
      before_action :authenticate_request

      # GET /api/authen/orders (Lịch sử đơn hàng của user)
      def index; end

      # POST /api/authen/orders/checkout (Thanh toán giỏ hàng)
      def checkout; end
    end
  end
end
```

---

## 📝 5. Các lệnh hữu ích phục vụ quá trình phát triển & kiểm thử

### 1. Khởi chạy Server Development
```bash
bin/rails server
```
Truy cập **`http://localhost:3000/api-docs`** để xem Swagger UI.

### 2. Kiểm thử (Testing)
Chạy bộ test RSpec:
```bash
bundle exec rspec
```

### 3. Cập nhật Tài liệu API Swagger
Sau khi thêm API mới (Carts, Orders), bạn sinh tài liệu Swagger tự động bằng Rake task:
```bash
rake swagger:generate
# Hoặc chế độ tự động watch các thay đổi:
rake swagger:watch
```

---
> [!WARNING]
> **Lưu ý về Lỗi Logic JWT trong Code Hiện Tại:**
> Trong file `app/services/json_web_token.rb`, tại hàm `decode`:
> ```ruby
> def self.decode(token)
>   decode = JWT.decode(token, SECRET_KEY)[0]
>   HashWithIndifferentAccess.new(decoded) # Lỗi ở đây: định nghĩa biến là 'decode', nhưng gọi 'decoded'
> ...
> ```
> Khi chạy code thật, bạn cần sửa biến `decode = ...` thành `decoded = ...` ở dòng 11 để không bị lỗi `NameError`.
