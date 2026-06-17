module Api
  module Authen
    class SessionsController < ApplicationController
      skip_before_action :authenticate_request, only: [:create, :register]

      # POST /api/authen/login
      def create
        result = UserService.authenticate(params[:username], params[:password])

        if result[:success]
          render json: {
            message: result[:message],
            token: result[:token],
            user: result[:data],
          }, status: result[:status]
        else
          render json: {
            errors: result[:error],
          }, status: result[:status]
        end
      end

      # POST /api/authen/register
      def register
        result = UserService.create_user(register_params)

        if result[:success]
          render json: {
            message: result[:message],
            token: result[:token],
            user: result[:data],
          }, status: result[:status]
        else
          render json: {
            errors: result[:error],
          }, status: result[:status]
        end
      end

      # DELETE /api/authen/logout
      def destroy
        # Logout với JWT thường được xử lý ở client (xóa token)
        # Có thể implement token blacklist nếu cần
        render json: {
          message: "Logout successfully",
        }, status: :ok
      end

      # GET /api/authen/me
      def show
        result = UserService.current_user_info(current_user)

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

      private

      def register_params
        params.require(:user).permit(:username, :email, :password, :password_confirmation)
      end
    end
  end
end
