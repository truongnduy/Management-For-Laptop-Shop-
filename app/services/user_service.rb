# Service layer for User business logic
# Handles all business operations related to users
class UserService
  class << self
    # Register a new user
    def create_user(params)
      if params[:password].blank? || params[:password].length < 6
        return { success: false, error: "Password must be at least 6 characters", status: :unprocessable_entity }
      end

      if params[:password] != params[:password_confirmation]
        return { success: false, error: "Password confirmation does not match", status: :unprocessable_entity }
      end

      if UserRepository.username_exists?(params[:username])
        return { success: false, error: "Username already taken", status: :unprocessable_entity }
      end

      if UserRepository.email_exists?(params[:email])
        return { success: false, error: "Email already taken", status: :unprocessable_entity }
      end

      user = UserRepository.create(params)
      
      if user.persisted?
        token = JsonWebToken.encode(user_id: user.id)
        { success: true, message: "User registered successfully", token: token, data: UserSerializer.new(user).as_json, status: :created }
      else
        { success: false, error: user.errors.full_messages, status: :unprocessable_entity }
      end
    end

    # Get user by ID with serialization
    def get_user(id)
      user = UserRepository.find(id)
      return { success: false, error: "User not found", status: :not_found } unless user

      {
        success: true,
        data: UserSerializer.new(user).as_json,
        status: :ok,
      }
    end

    # Update user with validation
    def update_user(id, params, current_user_id)
      user = UserRepository.find(id)
      return { success: false, error: "User not found", status: :not_found } unless user

      # Authorization check
      unless user.id == current_user_id
        return {
                 success: false,
                 error: "You are not authorized to perform this action",
                 status: :forbidden,
               }
      end

      # Password validation if provided
      if params[:password].present?
        if params[:password].length < 6
          return {
                   success: false,
                   error: "Password must be at least 6 characters",
                   status: :unprocessable_entity,
                 }
        end

        # Check password confirmation
        if params[:password] != params[:password_confirmation]
          return {
                   success: false,
                   error: "Password confirmation does not match",
                   status: :unprocessable_entity,
                 }
        end
      end

      # Check username uniqueness if changed
      if params[:username].present? && params[:username] != user.username
        if UserRepository.username_exists?(params[:username])
          return {
                   success: false,
                   error: "Username already taken",
                   status: :unprocessable_entity,
                 }
        end
      end

      # Check email uniqueness if changed
      if params[:email].present? && params[:email] != user.email
        if UserRepository.email_exists?(params[:email])
          return {
                   success: false,
                   error: "Email already taken",
                   status: :unprocessable_entity,
                 }
        end
      end

      # Update user
      if UserRepository.update(user, params)
        {
          success: true,
          message: "User updated successfully",
          data: UserSerializer.new(user).as_json,
          status: :ok,
        }
      else
        {
          success: false,
          error: user.errors.full_messages,
          status: :unprocessable_entity,
        }
      end
    end

    # Delete user with authorization
    def delete_user(id, current_user_id)
      user = UserRepository.find(id)
      return { success: false, error: "User not found", status: :not_found } unless user

      # Authorization check
      unless user.id == current_user_id
        return {
                 success: false,
                 error: "You are not authorized to perform this action",
                 status: :forbidden,
               }
      end

      UserRepository.destroy(user)
      {
        success: true,
        message: "User deleted successfully",
        status: :ok,
      }
    end

    # Authenticate user (login)
    def authenticate(username, password)
      user = UserRepository.find_by_username(username)

      unless user && user.authenticate(password)
        return {
                 success: false,
                 error: "Invalid username or password",
                 status: :unauthorized,
               }
      end

      token = JsonWebToken.encode(user_id: user.id)

      {
        success: true,
        message: "Login successfully",
        token: token,
        data: UserSerializer.new(user).as_json,
        status: :ok,
      }
    end

    # Get current user info
    def current_user_info(user)
      return { success: false, error: "Unauthorized", status: :unauthorized } unless user

      {
        success: true,
        data: UserSerializer.new(user).as_json,
        status: :ok,
      }
    end

    # List all users with pagination
    def list_users(page: 1, per_page: 10)
      users = UserRepository.paginate(page: page, per_page: per_page)
      total = UserRepository.count

      {
        success: true,
        data: UserSerializer.collection(users),
        meta: {
          page: page,
          per_page: per_page,
          total: total,
          total_pages: (total.to_f / per_page).ceil,
        },
        status: :ok,
      }
    end

    # Search users
    def search_users(keyword)
      users = UserRepository.search(keyword)

      {
        success: true,
        data: UserSerializer.collection(users),
        meta: {
          count: users.count,
        },
        status: :ok,
      }
    end
  end
end
