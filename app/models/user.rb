class User < ApplicationRecord
  has_secure_password
  has_one :cart, dependent: :destroy
  
  validates :username, presence: true, uniqueness: true, length: { maximum: 255 }
  validates :email, presence: true, uniqueness: true, 
            format: { with: URI::MailTo::EMAIL_REGEXP, message: "must be a valid email address" },
            length: { maximum: 255 }
  validates :password, length: { minimum: 6 }, if: -> { new_record? || password.present? }

  enum :role, { customer: "customer",
                admin: "admin" }

  
  def admin? 
    role == "admin"
  end

  # Normalize email before save
  before_save :downcase_email

  private

  def downcase_email
    self.email = email.downcase if email.present?
  end
end