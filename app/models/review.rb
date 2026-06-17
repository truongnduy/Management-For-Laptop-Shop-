class Review < ApplicationRecord
  belongs_to :user
  belongs_to :product

  validates :rating, presence: true, inclusion: { in: 1..5 }
  validates :comment, length: { maximum: 500 }
end
