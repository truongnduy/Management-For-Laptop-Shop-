Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins "*"
    resource "/api-docs/*",
      headers: :any,
      methods: [:get, :options]

    resource "/api/*", 
    headers: :any,
    methods: [:get, :post, :put, :patch, :delete, :options, :head]
  end
end