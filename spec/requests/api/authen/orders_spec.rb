require 'swagger_helper'

RSpec.describe 'Api::Authen::Orders', type: :request do
  path '/api/authen/orders' do
    get 'Get order history' do
      tags 'Orders'
      produces 'application/json'
      security [bearerAuth: []]

      response '200', 'orders retrieved' do
        run_test!
      end
    end
  end

  path '/api/authen/orders/checkout' do
    post 'Checkout current cart' do
      tags 'Orders'
      consumes 'application/json'
      produces 'application/json'
      security [bearerAuth: []]

      parameter name: :payload, in: :body, schema: {
        type: :object,
        properties: {
          shipping: {
            type: :object,
            properties: {
              address: { type: :string },
              city: { type: :string },
              phone: { type: :string }
            },
            required: ['address', 'phone']
          }
        },
        required: ['shipping']
      }

      response '200', 'checkout successful' do
        run_test!
      end
      response '422', 'checkout failed (empty cart, insufficient stock)' do
        run_test!
      end
    end
  end
end
