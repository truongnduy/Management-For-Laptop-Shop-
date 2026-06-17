class OrderService
  ORDER_INCLUDES = { order_items: :product }.freeze

  class << self
    def checkout(user_id, shipping_params)
      # Bước 1: Lấy cart, eager load items + product
      cart = Cart.includes(cart_items: :product).find_by(user_id: user_id)

      return error("Cart not found", :not_found) if cart.nil?
      return error("Cart is empty", :unprocessable_entity) if cart.cart_items.empty?

      # Bước 2: Tìm và validate coupon (trước transaction để tránh rollback không cần thiết)
      coupon = nil
      if shipping_params[:coupon_code].present?
        coupon = Coupon.find_by(code: shipping_params[:coupon_code])
        return error("Mã giảm giá không tồn tại", :unprocessable_entity) if coupon.nil?
        return error("Mã giảm giá đã hết hạn", :unprocessable_entity) unless coupon.valid_to_use?
      end

      # Bước 3: Tính toán giá trước transaction
      subtotal = cart.cart_items.sum { |item| item.quantity * item.product.price }
      discount_amount = coupon ? coupon.calculate_discount(subtotal) : 0
      final_total = subtotal - discount_amount

      order = nil

      # Bước 4: Transaction — đảm bảo toàn vẹn dữ liệu
      ActiveRecord::Base.transaction do
        full_address = [shipping_params[:address], shipping_params[:city]]
                         .compact
                         .reject(&:empty?)
                         .join(', ')

        order = Order.create!(
          user_id:          user_id,
          status:           :pending,
          shipping_address: full_address,
          phone_number:     shipping_params[:phone],
          total_price:      final_total,
          coupon_id:        coupon&.id,
          discount_amount:  discount_amount
        )

        cart.cart_items.each do |item|
          product = item.product

          if product.stock < item.quantity
            raise ActiveRecord::Rollback,
                  "Not enough stock for \"#{product.name}\" " \
                  "(requested: #{item.quantity}, available: #{product.stock})"
          end

          product.decrement!(:stock, item.quantity)

          order.order_items.create!(
            product:           product,
            quantity:          item.quantity,
            price_at_purchase: product.price
          )
        end

        cart.cart_items.destroy_all
      end

      if order&.persisted?
        success(order.reload)
      else
        error("Checkout failed", :unprocessable_entity)
      end

    rescue ActiveRecord::Rollback => e
      error(e.message, :unprocessable_entity)
    rescue ActiveRecord::RecordInvalid => e
      error(e.message, :unprocessable_entity)
    rescue ActiveRecord::RecordNotFound => e
      error(e.message, :not_found)
    end

    private

    def success(data)
      { success: true, data: data, status: :ok }
    end

    def error(message, status = :bad_request)
      { success: false, error: message, status: status }
    end
  end
end