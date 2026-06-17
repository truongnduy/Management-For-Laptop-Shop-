class Coupon < ApplicationRecord
  validates :code, presence: true,
                   uniqueness: true

  def valid_to_use?
    expiry_date > Time.current
  end

  def calculate_discount(total_cart_value)
    discount = total_cart_value * (discount_percent / 100.0)
    discount > max_discount_amount ? max_discount_amount : discount
  end
end
