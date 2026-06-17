class Order < ApplicationRecord
  belongs_to :user
  has_many :order_items, dependent: :destroy

  validates :status, inclusion: { in: %w[pending processing shipped delivered cancelled] }
  validates :total_price, numericality: { greater_than_or_equal_to: 0 }
end
