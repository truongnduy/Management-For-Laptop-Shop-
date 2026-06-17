require 'swagger_helper'

RSpec.describe 'Api::Authen::Carts', type: :request do
  path '/api/authen/cart' do
    get 'Get current user cart' do
      tags 'Cart'
      produces 'application/json'
      security [bearerAuth: []]
      
      response '200', 'cart retrieved' do
        schema type: :object,
          properties: {
            success: { type: :boolean },
            cart: { type: :object }
          }
        run_test!
      end
    end
  end

  path '/api/authen/cart/add' do
    post 'Add item to cart' do
      tags 'Cart'
      consumes 'application/json'
      produces 'application/json'
      security [bearerAuth: []]

      parameter name: :payload, in: :body, schema: {
        type: :object,
        properties: {
          product_id: { type: :integer },
          quantity: { type: :integer }
        },
        required: ['product_id', 'quantity']
      }

      response '200', 'item added' do
        run_test!
      end
    end
  end

  path '/api/authen/cart/update/{id}' do
    put 'Update cart item quantity' do
      tags 'Cart'
      consumes 'application/json'
      produces 'application/json'
      security [bearerAuth: []]

      parameter name: :id, in: :path, type: :integer, description: 'CartItem ID'
      parameter name: :payload, in: :body, schema: {
        type: :object,
        properties: {
          quantity: { type: :integer }
        },
        required: ['quantity']
      }

      response '200', 'item updated' do
        run_test!
      end
    end
  end

  path '/api/authen/cart/remove/{id}' do
    delete 'Remove item from cart' do
      tags 'Cart'
      produces 'application/json'
      security [bearerAuth: []]

      parameter name: :id, in: :path, type: :integer, description: 'CartItem ID'

      response '200', 'item removed' do
        run_test!
      end
    end
  end
end
