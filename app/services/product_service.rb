class ProductService
  class << self
    def get_product(id)
      product = ProductRepository.find(id)
      return { success: false, error: "Product not found", status: :not_found } unless product

      { success: true, data: ProductSerializer.new(product).as_json, status: :ok }
    end

    def list_products(page: 1, per_page: 10)
      products = ProductRepository.paginate(page: page, per_page: per_page)
      total = ProductRepository.count

      {
        success: true,
        data: ProductSerializer.collection(products),
        meta: {
          page: page,
          per_page: per_page,
          total: total,
          total_pages: (total.to_f / per_page).ceil
        },
        status: :ok
      }
    end

    def create_product(params)
      product = ProductRepository.create(params)
      if product.persisted?
        { success: true, message: "Product created successfully", data: ProductSerializer.new(product).as_json, status: :created }
      else
        { success: false, error: product.errors.full_messages, status: :unprocessable_entity }
      end
    end

    def update_product(id, params)
      product = ProductRepository.find(id)
      return { success: false, error: "Product not found", status: :not_found } unless product

      if ProductRepository.update(product, params)
        { success: true, message: "Product updated successfully", data: ProductSerializer.new(product).as_json, status: :ok }
      else
        { success: false, error: product.errors.full_messages, status: :unprocessable_entity }
      end
    end

    def delete_product(id)
      product = ProductRepository.find(id)
      return { success: false, error: "Product not found", status: :not_found } unless product

      ProductRepository.destroy(product)
      { success: true, message: "Product deleted successfully", status: :ok }
    end
  end
end