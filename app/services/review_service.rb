class ReviewService
  class << self
    def create_review(user_id, product_id, rating, comment)
      # Kiểm tra xem user đã mua sản phẩm này và nhận hàng chưa
      has_bought = OrderItem.joins(:order)
                            .where(orders: { user_id: user_id, status: 'delivered' })
                            .where(product_id: product_id)
                            .exists?

      return { success: false, error: "Bạn chưa mua sản phẩm này" } unless has_bought

      review = Review.create(user_id: user_id, product_id: product_id, rating: rating, comment: comment)
      { success: true, data: review }
    end
  end
end