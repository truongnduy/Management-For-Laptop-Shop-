# Repository pattern for User model
# Handles all database operations and queries
class UserRepository
  # Find user by ID
  def self.find(id)
    User.find(id)
  rescue ActiveRecord::RecordNotFound
    nil
  end

  # Find user by username
  def self.find_by_username(username)
    User.find_by(username: username)
  end

  # Find user by email
  def self.find_by_email(email)
    User.find_by(email: email)
  end

  # Get all users
  def self.all
    User.all
  end

  # Get users with pagination
  def self.paginate(page: 1, per_page: 10)
    User.offset((page - 1) * per_page).limit(per_page)
  end

  # Create new user
  def self.create(attributes)
    User.create(attributes)
  end

  # Update user
  def self.update(user, attributes)
    user.update(attributes)
    user
  end

  # Delete user
  def self.destroy(user)
    user.destroy
  end

  # Check if username exists
  def self.username_exists?(username)
    User.exists?(username: username)
  end

  # Check if email exists
  def self.email_exists?(email)
    User.exists?(email: email)
  end

  # Search users by keyword
  def self.search(keyword)
    User.where("username LIKE ? OR email LIKE ?", "%#{keyword}%", "%#{keyword}%")
  end

  # Count total users
  def self.count
    User.count
  end
end
