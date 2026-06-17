require 'swagger_helper'

RSpec.describe 'Api::Authen::Products', type: :request do
  path '/api/authen/products' do
    get 'List all products' do
      tags 'Products'
      produces 'application/json'
      security [bearerAuth: []]
      description 'Get list of all products with pagination'

      parameter name: :page, in: :query, type: :integer, required: false
      parameter name: :per_page, in: :query, type: :integer, required: false

      response '200', 'products retrieved' do
        schema type: :object,
          properties: {
            products: { type: :array, items: { type: :object } },
            meta: { type: :object }
          }
        run_test!
      end
    end

    post 'Create a product' do
      tags 'Products'
      consumes 'application/json'
      produces 'application/json'
      security [bearerAuth: []]
      
      parameter name: :product, in: :body, schema: {
        type: :object,
        properties: {
          product: {
            type: :object,
            properties: {
              name: { type: :string },
              description: { type: :string },
              price: { type: :number },
              stock: { type: :integer },
              brand: { type: :string },
              cpu: { type: :string },
              ram: { type: :string },
              storage: { type: :string },
              screen: { type: :string },
              gpu: { type: :string },
              status: { type: :string, example: 'active' }
            }
          }
        }
      }

      response '201', 'product created' do
        run_test!
      end
      response '422', 'invalid request' do
        run_test!
      end
    end
  end

  path '/api/authen/products/{id}' do
    parameter name: :id, in: :path, type: :integer

    get 'Get product by ID' do
      tags 'Products'
      produces 'application/json'
      security [bearerAuth: []]
      response '200', 'product found' do
        run_test!
      end
      response '404', 'product not found' do
        run_test!
      end
    end

    put 'Update product' do
      tags 'Products'
      consumes 'application/json'
      produces 'application/json'
      security [bearerAuth: []]
      parameter name: :product, in: :body, schema: { type: :object }
      response '200', 'product updated' do
        run_test!
      end
    end

    delete 'Delete product' do
      tags 'Products'
      security [bearerAuth: []]
      response '200', 'product deleted' do
        run_test!
      end
    end
  end
end
