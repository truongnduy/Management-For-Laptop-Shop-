# frozen_string_literal: true

require "rails_helper"

RSpec.configure do |config|
  # Specify a root folder where Swagger JSON files are generated
  config.openapi_root = Rails.root.join("swagger").to_s

  # Define one or more Swagger documents and provide global metadata for each one
  config.openapi_specs = {
    "v1/swagger.json" => {
      openapi: "3.0.1",
      info: {
        title: "LapShop API V1",
        version: "v1",
        description: "API documentation for LapShop application - Auto-generated from RSpec specs",
        contact: {
          name: "LapShop Support",
          email: "support@lapshop.com",
        },
      },
      paths: {},
      servers: [
        {
          url: "http://localhost:3000",
          description: "Development server",
        },
        {
          url: "https://api.lapshop.com",
          description: "Production server",
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: :http,
            scheme: :bearer,
            bearerFormat: "JWT",
            description: "Enter JWT token in format: Bearer {token}",
          },
        },
        schemas: {
          User: {
            type: :object,
            properties: {
              id: { type: :integer, example: 1 },
              username: { type: :string, example: "admin" },
              email: { type: :string, format: :email, example: "admin@example.com" },
              created_at: { type: :string, format: "date-time" },
              updated_at: { type: :string, format: "date-time" },
            },
            required: [:id, :username, :email],
          },
          UserInput: {
            type: :object,
            properties: {
              user: {
                type: :object,
                properties: {
                  username: { type: :string, example: "newuser" },
                  email: { type: :string, format: :email, example: "user@example.com" },
                  password: { type: :string, format: :password, example: "password123" },
                  password_confirmation: { type: :string, format: :password, example: "password123" },
                },
              },
            },
          },
          LoginInput: {
            type: :object,
            properties: {
              username: { type: :string, example: "admin" },
              password: { type: :string, format: :password, example: "123456" },
            },
            required: [:username, :password],
          },
          LoginResponse: {
            type: :object,
            properties: {
              message: { type: :string, example: "Login successfully" },
              token: { type: :string, example: "eyJhbGciOiJIUzI1NiJ9..." },
              user: { "$ref" => "#/components/schemas/User" },
            },
          },
          Error: {
            type: :object,
            properties: {
              errors: {
                oneOf: [
                  { type: :string },
                  { type: :array, items: { type: :string } },
                ],
              },
            },
          },
        },
      },
    },
  }

  # Specify the format of the output Swagger file
  config.openapi_format = :json
end
