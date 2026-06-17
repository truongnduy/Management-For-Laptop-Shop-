class CartService
  CART_INCLUDES = { cart_items: :product }.freeze

  class << self
    def get_cart(user_id)
      cart = find_or_create_cart(user_id)
      success(cart)
    rescue ActiveRecord::RecordInvalid => e
      error(e.message, :unprocessable_entity)
    end

    def add_to_cart(user_id, product_id, quantity)
      return error("Quantity must be greater than 0", :unprocessable_entity) if quantity.to_i <= 0

      cart    = find_or_create_cart(user_id)
      product = Product.find_by(id: product_id)
      return error("Product not found", :not_found) if product.nil?

      # Kiểm tra stock
      current_qty = cart.cart_items.find { |i| i.product_id == product_id.to_i }&.quantity || 0
      return error("Not enough stock", :unprocessable_entity) if product.stock < current_qty + quantity.to_i

      item = cart.cart_items.find { |i| i.product_id == product_id.to_i }
      if item
        item.increment!(:quantity, quantity.to_i)
      else
        cart.cart_items.create!(product: product, quantity: quantity.to_i)
      end

      success(cart.reload)
    rescue ActiveRecord::RecordInvalid => e
      error(e.message, :unprocessable_entity)
    end

    def update_cart_item(cart_item_id, quantity)
      return error("Quantity must be greater than 0", :unprocessable_entity) if quantity.to_i <= 0

      item = CartItem.includes(:product).find_by(id: cart_item_id)
      return error("Cart item not found", :not_found) if item.nil?

      # Kiểm tra stock trước khi update
      return error("Not enough stock", :unprocessable_entity) if item.product.stock < quantity.to_i

      item.update!(quantity: quantity.to_i)
      success(item.cart.reload)
    rescue ActiveRecord::RecordInvalid => e
      error(e.message, :unprocessable_entity)
    end

    def remove_from_cart(cart_item_id)
      item = CartItem.find_by(id: cart_item_id)
      return error("Cart item not found", :not_found) if item.nil?

      cart = item.cart
      item.destroy!
      success(cart.reload)
    end

    private

    def find_or_create_cart(user_id)
      Cart.includes(CART_INCLUDES).find_or_create_by!(user_id: user_id)
    end

    def success(data)
      { success: true, data: data, status: :ok }
    end

    def error(message, status = :bad_request)
      { success: false, error: message, status: status }
    end
  end
end