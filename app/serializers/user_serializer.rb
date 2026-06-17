# DTO/Serializer for User model
class UserSerializer
  attr_reader :user

  def initialize(user)
    @user = user
  end

  # Public profile (không bao gồm sensitive data)
  def as_json
    {
      id: user.id,
      username: user.username,
      email: user.email,
      created_at: user.created_at,
      updated_at: user.updated_at,
    }
  end

  # Class method để serialize collection
  def self.collection(users)
    users.map { |user| new(user).as_json }
  end

  # Minimal profile (chỉ thông tin cơ bản)
  def minimal
    {
      id: user.id,
      username: user.username,
    }
  end

  # Detailed profile (bao gồm thêm metadata)
  def detailed
    as_json.merge(
      account_created: user.created_at.strftime("%B %d, %Y"),
      last_updated: user.updated_at.to_i,
    )
  end
end
