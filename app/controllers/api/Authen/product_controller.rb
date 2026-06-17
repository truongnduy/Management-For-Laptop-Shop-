module Api
  module Authen
    class ProductsController < ApplicationController
      before_action :authenticate_request
      before_action :require_admin, only: [:create, :update, :destroy]

      # GET /api/authen/products
      def index
        page = params[:page] || 1
        per_page = params[:per_page] || 10

        result = ProductService.list_products(page: page.to_i, per_page: per_page.to_i)

        render json: {
          products: result[:data],
          meta: result[:meta]
        }, status: result[:status]
      end

      # GET /api/authen/products/:id
      def show
        result = ProductService.get_product(params[:id])

        if result[:success]
          render json: { product: result[:data] }, status: result[:status]
        else
          render json: { errors: result[:error] }, status: result[:status]
        end
      end

      # POST /api/authen/products
      def create
        result = ProductService.create_product(product_params)

        if result[:success]
          render json: { message: result[:message], product: result[:data] }, status: result[:status]
        else
          render json: { errors: result[:error] }, status: result[:status]
        end
      end

      # PUT/PATCH /api/authen/products/:id
      def update
        result = ProductService.update_product(params[:id], product_params)

        if result[:success]
          render json: { message: result[:message], product: result[:data] }, status: result[:status]
        else
          render json: { errors: result[:error] }, status: result[:status]
        end
      end

      # DELETE /api/authen/products/:id
      def destroy
        result = ProductService.delete_product(params[:id])

        if result[:success]
          render json: { message: result[:message] }, status: result[:status]
        else
          render json: { errors: result[:error] }, status: result[:status]
        end
      end

      private

      def product_params
        params.require(:product).permit(:name, :description, :price, :stock, :status)
      end
    end
  end
end