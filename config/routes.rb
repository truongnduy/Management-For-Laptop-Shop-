Rails.application.routes.draw do
  mount Rswag::Ui::Engine => "/api-docs"
  mount Rswag::Api::Engine => "/api-docs"
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  namespace :api do
    namespace :authen do
      post "login", to: "sessions#create"
      post "register", to: "sessions#register"
      delete "logout", to: "sessions#destroy"
      get "me", to: "sessions#show"

      # User management routes
      resources :users, only: [:index, :show, :update, :destroy] do
        collection do
          get "search", to: "users#search"
        end
      end

      # Products routes
      resources :products, only: [:index, :show, :create, :update, :destroy]

      # Orders routes
      resources :orders, only: [:index] do
        post "checkout", on: :collection
      end
    end
  end

  get "login", to: "sessions#new"
  post "login", to: "sessions#create"
  delete "logout", to: "sessions#destroy"
  get "me", to: "sessions#show"

  get "up" => "rails/health#show", as: :rails_health_check

  # Root path - redirect to Swagger API documentation
  root "home#index"

  namespace :api do
    namespace :authen do
      # Cart routes
      resource :cart, only: [:show] do
        post "add", on: :collection
        put "update/:id", on: :collection, to: "carts#update_item"
        delete "remove/:id", on: :collection, to: "carts#remove_item"
      end
    end
  end 

  # Catch-all route for unmatched API requests to return JSON instead of HTML
  match '/api/*path', to: 'application#route_not_found', via: :all
end
