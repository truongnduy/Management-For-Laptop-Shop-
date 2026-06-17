class ProductSerializer
  attr_reader :product

  def initialize(product)
    @product = product
  end

  def as_json
    {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price.to_f,
      stock: product.stock,
      status: product.status,
      created_at: product.created_at,
      updated_at: product.updated_at
    }
  end

  def self.collection(products)
    products.map { |product| new(product).as_json }
  end
end