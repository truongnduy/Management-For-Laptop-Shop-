class Product < ApplicationRecord
  validates :name, presence: true, length: { maximum: 255 }
  validates :price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :stock, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :status, presence: true, inclusion: { in: %w[active inactive] }
  belongs_to :category, optional: true
  belongs_to :brand, optional: true    
end