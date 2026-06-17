module Api
  module Authen
    class UsersController < ApplicationController
      before_action :authenticate_request

      # GET /api/authen/users
      def index
        page = params[:page] || 1
        per_page = params[:per_page] || 10

        result = UserService.list_users(page: page.to_i, per_page: per_page.to_i)

        render json: {
          users: result[:data],
          meta: result[:meta],
        }, status: result[:status]
      end

      # GET /api/authen/users/:id
      def show
        result = UserService.get_user(params[:id])

        if result[:success]
          render json: {
            user: result[:data],
          }, status: result[:status]
        else
          render json: {
            errors: result[:error],
          }, status: result[:status]
        end
      end

      # PUT/PATCH /api/authen/users/:id
      def update
        result = UserService.update_user(
          params[:id],
          user_params,
          current_user.id
        )

        if result[:success]
          render json: {
            message: result[:message],
            user: result[:data],
          }, status: result[:status]
        else
          render json: {
            errors: result[:error],
          }, status: result[:status]
        end
      end

      # DELETE /api/authen/users/:id
      def destroy
        result = UserService.delete_user(params[:id], current_user.id)

        if result[:success]
          render json: {
            message: result[:message],
          }, status: result[:status]
        else
          render json: {
            errors: result[:error],
          }, status: result[:status]
        end
      end

      # GET /api/authen/users/search
      def search
        keyword = params[:keyword] || ""
        result = UserService.search_users(keyword)

        render json: {
          users: result[:data],
          meta: result[:meta],
        }, status: result[:status]
      end

      private

      def user_params
        params.require(:user).permit(:username, :email, :password, :password_confirmation)
      end
    end
  end
end
