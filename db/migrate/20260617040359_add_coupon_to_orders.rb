class AddCouponToOrders < ActiveRecord::Migration[8.1]
  def change
    add_reference :orders, :coupon, null: false, foreign_key: true
    add_column :orders, :discount_amount, :decimal
  end
end
