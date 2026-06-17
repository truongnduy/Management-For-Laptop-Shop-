class ProductRepository
  def self.find(id)
    Product.find(id)
  end

  def self.all
    Product.all
  end
  
  def self.paginate(page: 1, per_page: 10)
    Product.offset((page - 1) * per_page).limit(per_page)
  end

  def self.create(attributes)
    Product.create(attributes)
  end

  def self.update(product, attributes)
    product.update(attributes)
    product
  end

  def self.destroy(product)
    product.destroy 
  end

  def self.count
    Product.count 
  end

  def self.search(keyword)
    Product.where("name LIKE ? OR description LIKE ?", "%#{keyword}%", "%#{keyword}%")
  end
end
