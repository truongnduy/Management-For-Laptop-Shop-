require "swagger_helper"

RSpec.describe "Api::Authen::Sessions", type: :request do
  path "/api/authen/login" do
    post "User login" do
      tags "Authentication"
      consumes "application/json"
      produces "application/json"
      description "Authenticate user and return JWT token"

      parameter name: :credentials, in: :body, schema: {
        "$ref" => "#/components/schemas/LoginInput",
      }

      response "200", "login successful" do
        schema "$ref" => "#/components/schemas/LoginResponse"

        run_test! do |response|
          # Test sẽ chạy khi generate swagger
        end
      end

      response "401", "invalid credentials" do
        schema "$ref" => "#/components/schemas/Error"

        run_test!
      end
    end
  end

  path "/api/authen/register" do
    post "User register" do
      tags "Authentication"
      consumes "application/json"
      produces "application/json"
      description "Register a new user and return JWT token"

      parameter name: :credentials, in: :body, schema: {
        "$ref" => "#/components/schemas/UserInput",
      }

      response "201", "register successful" do
        schema "$ref" => "#/components/schemas/LoginResponse"

        run_test!
      end

      response "422", "validation errors" do
        schema "$ref" => "#/components/schemas/Error"

        run_test!
      end
    end
  end

  path "/api/authen/logout" do
    delete "User logout" do
      tags "Authentication"
      produces "application/json"
      security [bearerAuth: []]
      description "Logout current user (client should delete token)"

      response "200", "logout successful" do
        schema type: :object,
          properties: {
            message: { type: :string, example: "Logout successfully" },
          }

        run_test!
      end
    end
  end

  path "/api/authen/me" do
    get "Get current user information" do
      tags "Authentication"
      produces "application/json"
      security [bearerAuth: []]
      description "Get information of currently logged in user"

      response "200", "user information retrieved successfully" do
        schema type: :object,
          properties: {
            user: { "$ref" => "#/components/schemas/User" },
          }

        run_test!
      end

      response "401", "unauthorized" do
        schema "$ref" => "#/components/schemas/Error"

        run_test!
      end
    end
  end
end
