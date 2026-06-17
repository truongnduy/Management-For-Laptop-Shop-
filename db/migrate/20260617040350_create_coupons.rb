class CreateCoupons < ActiveRecord::Migration[8.1]
  def change
    create_table :coupons do |t|
      t.string :code
      t.decimal :discount_percent
      t.decimal :max_discount_amount
      t.datetime :expiry_date

      t.timestamps
    end
  end
end
