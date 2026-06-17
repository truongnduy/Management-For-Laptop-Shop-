module Api
  module Authen
    class CartsController < ApplicationController
      before_action :authenticate_request

      # GET api/authen/cart
      def show
        render_result CartService.get_cart(current_user.id)
      end

      # POST api/authen/cart/add
      def add_item
        render_result CartService.add_to_cart(current_user.id, params[:product_id], params[:quantity])
      end

      # PUT/PATCH api/authen/cart/items/:id
      def update_item
        render_result CartService.update_cart_item(current_user.id, params[:id], params[:quantity])
      end

      # DELETE api/authen/cart/items/:id
      def remove_item
        render_result CartService.remove_from_cart(current_user.id, params[:id])
      end

      private

      def render_result(result)
        if result[:success]
          render json: { success: true, cart: result[:data] }, status: result[:status]
        else
          render json: { success: false, errors: result[:error] }, status: result[:status]
        end
      end
    end
  end
end