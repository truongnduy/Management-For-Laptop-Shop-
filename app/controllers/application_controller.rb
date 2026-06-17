class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  # Changes to the importmap will invalidate the etag for HTML responses
  stale_when_importmap_changes

  skip_before_action :verify_authenticity_token
  
  before_action :authenticate_request, if: -> { request.path.start_with?('/api/') }, except: [:route_not_found]

  helper_method :current_user, :logged_in?

  # Global error handler for API requests to ensure JSON response instead of HTML
  rescue_from StandardError, with: :handle_api_error

  def route_not_found
    render json: { success: false, error: "API Route not found" }, status: :not_found
  end

  private

  def handle_api_error(exception)
    raise exception unless request.path.start_with?('/api/')
    
    # Log the full error to the console for debugging
    logger.error "[API ERROR] #{exception.class}: #{exception.message}"
    logger.error exception.backtrace.join("\n")

    render json: { success: false, error: "Internal Server Error: #{exception.message}" }, status: :internal_server_error
  end

  def authenticate_request
    header = request.headers["Authorization"]
    header = header.split(" ").last if header

    if header.blank?
      return render json: { success: false, error: "Missing Authorization token" }, status: :unauthorized
    end

    begin
      @decoded = JsonWebToken.decode(header)
      if @decoded && @decoded[:user_id]
        @current_user = User.find(@decoded[:user_id])
      else
        render json: { success: false, error: "Invalid token payload" }, status: :unauthorized
      end
    rescue ActiveRecord::RecordNotFound => e
      render json: { success: false, error: "User not found" }, status: :unauthorized
    rescue JWT::DecodeError => e
      render json: { success: false, error: "Invalid token" }, status: :unauthorized
    end
  end


  def require_admin 
    unless current_user&.admin?
      render json: { success: false, 
      error: "Access Denied: Admins only" }, 
      status: :forbidden
    end
  end

  def current_user
    @current_user
  end

  def logged_in?
    !!current_user
  end
end
