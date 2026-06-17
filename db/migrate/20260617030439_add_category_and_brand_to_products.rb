class AddCategoryAndBrandToProducts < ActiveRecord::Migration[8.1]
  def change
    # Dọn dẹp các cột bị kẹt do migration trước đó bị crash
    remove_column :products, :category_id if column_exists?(:products, :category_id)
    remove_column :products, :brand_id if column_exists?(:products, :brand_id)

    # Thêm lại cột với null: true (vì đã có data cũ trong bảng products)
    add_reference :products, :category, null: true, foreign_key: true
    add_reference :products, :brand, null: true, foreign_key: true
  end
end
