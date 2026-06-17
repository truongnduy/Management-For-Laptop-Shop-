require "swagger_helper"

RSpec.describe "Api::Authen::Users", type: :request do
  path "/api/authen/users" do
    get "List all users" do
      tags "Users"
      produces "application/json"
      security [bearerAuth: []]
      description "Get list of all users with pagination"

      parameter name: :page, in: :query, type: :integer, required: false, description: "Page number (default: 1)"
      parameter name: :per_page, in: :query, type: :integer, required: false, description: "Items per page (default: 10)"

      response "200", "users retrieved successfully" do
        schema type: :object,
          properties: {
            users: {
              type: :array,
              items: { "$ref" => "#/components/schemas/User" },
            },
            meta: {
              type: :object,
              properties: {
                page: { type: :integer, example: 1 },
                per_page: { type: :integer, example: 10 },
                total: { type: :integer, example: 50 },
                total_pages: { type: :integer, example: 5 },
              },
            },
          }

        run_test!
      end

      response "401", "unauthorized" do
        schema "$ref" => "#/components/schemas/Error"

        run_test!
      end
    end
  end

  path "/api/authen/users/search" do
    get "Search users" do
      tags "Users"
      produces "application/json"
      security [bearerAuth: []]
      description "Search users by username or email"

      parameter name: :keyword, in: :query, type: :string, required: false, description: "Search keyword"

      response "200", "search results retrieved" do
        schema type: :object,
          properties: {
            users: {
              type: :array,
              items: { "$ref" => "#/components/schemas/User" },
            },
            meta: {
              type: :object,
              properties: {
                count: { type: :integer, example: 5 },
              },
            },
          }

        run_test!
      end
    end
  end

  path "/api/authen/users/{id}" do
    parameter name: :id, in: :path, type: :integer, description: "User ID"

    get "Get user by ID" do
      tags "Users"
      produces "application/json"
      security [bearerAuth: []]
      description "Get detailed information of a specific user"

      response "200", "user found" do
        schema type: :object,
          properties: {
            user: { "$ref" => "#/components/schemas/User" },
          }

        run_test!
      end

      response "404", "user not found" do
        schema "$ref" => "#/components/schemas/Error"

        run_test!
      end

      response "401", "unauthorized" do
        schema "$ref" => "#/components/schemas/Error"

        run_test!
      end
    end

    put "Update user" do
      tags "Users"
      consumes "application/json"
      produces "application/json"
      security [bearerAuth: []]
      description "Update user information (only own account)"

      parameter name: :user, in: :body, schema: {
        "$ref" => "#/components/schemas/UserInput",
      }

      response "200", "user updated successfully" do
        schema type: :object,
          properties: {
            message: { type: :string, example: "User updated successfully" },
            user: { "$ref" => "#/components/schemas/User" },
          }

        run_test!
      end

      response "403", "forbidden - can only update own account" do
        schema "$ref" => "#/components/schemas/Error"

        run_test!
      end

      response "422", "validation errors" do
        schema "$ref" => "#/components/schemas/Error"

        run_test!
      end

      response "401", "unauthorized" do
        schema "$ref" => "#/components/schemas/Error"

        run_test!
      end
    end

    patch "Update user (partial)" do
      tags "Users"
      consumes "application/json"
      produces "application/json"
      security [bearerAuth: []]
      description "Partially update user information (only own account)"

      parameter name: :user, in: :body, schema: {
        type: :object,
        properties: {
          user: {
            type: :object,
            properties: {
              username: { type: :string, example: "newusername" },
              email: { type: :string, format: :email, example: "newemail@example.com" },
            },
          },
        },
      }

      response "200", "user updated successfully" do
        schema type: :object,
          properties: {
            message: { type: :string, example: "User updated successfully" },
            user: { "$ref" => "#/components/schemas/User" },
          }

        run_test!
      end

      response "403", "forbidden" do
        schema "$ref" => "#/components/schemas/Error"

        run_test!
      end
    end

    delete "Delete user" do
      tags "Users"
      security [bearerAuth: []]
      description "Delete user account (only own account)"

      response "200", "user deleted successfully" do
        schema type: :object,
          properties: {
            message: { type: :string, example: "User deleted successfully" },
          }

        run_test!
      end

      response "403", "forbidden - can only delete own account" do
        schema "$ref" => "#/components/schemas/Error"

        run_test!
      end

      response "404", "user not found" do
        schema "$ref" => "#/components/schemas/Error"

        run_test!
      end

      response "401", "unauthorized" do
        schema "$ref" => "#/components/schemas/Error"

        run_test!
      end
    end
  end
end
