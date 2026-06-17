class HomeController < ApplicationController
  def index
    # Redirect to Swagger API documentation
    redirect_to "/api-docs"
  end
end
