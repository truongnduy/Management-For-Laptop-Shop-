module Api
  module Authen
    class OrdersController < ApplicationController
      before_action :authenticate_request

      # GET /api/authen/orders
      def index
        orders = Order
          .includes(items: :product)
          .where(user_id: current_user.id)
          .order(created_at: :desc)

        render json: { success: true, orders: orders }, status: :ok
      end

      # POST /api/authen/orders/checkout
      def checkout
        result = OrderService.checkout(current_user.id, shipping_params)
        render_result result, data_key: :order
      end

      private

      def shipping_params
        params.require(:shipping).permit(:address, :city, :phone)
      end

      def render_result(result, data_key: :data)
        if result[:success]
          render json: { success: true, data_key => result[:data] }, status: result[:status]
        else
          render json: { success: false, errors: result[:error] }, status: result[:status]
        end
      end
    end
  end
end 