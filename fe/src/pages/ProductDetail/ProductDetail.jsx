import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useCart } from '../../context/CartContext';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addItemToCart } = useCart();

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const res = await api.getProduct(id);
        if (res && res.product) {
          setProduct(res.product);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    const success = await addItemToCart(product.id, quantity);
    if (success) {
      alert(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
    }
  };

  const formatVND = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (loading) return <div className="detail-loading">Đang mở thông số kỹ thuật...</div>;
  if (!product) return <div className="detail-loading">Không tìm thấy sản phẩm!</div>;

  return (
    <div className="product-detail-page">
      <Link to="/products" className="back-link">← Quay lại danh sách</Link>

      <div className="detail-card glass-card">
        <div className="detail-image-box">
          <img src="/src/assets/laptop_hero.png" alt={product.name} />
        </div>

        <div className="detail-info-box">
          <h1 className="detail-name">{product.name}</h1>
          <span className="detail-price-tag">{formatVND(product.price)}</span>

          <div className="stock-info">
            Tình trạng: {product.stock > 0 ? (
              <span className="in-stock-label">Còn hàng ({product.stock} chiếc)</span>
            ) : (
              <span className="out-stock-label">Hết hàng</span>
            )}
          </div>

          <div className="description-box">
            <h3>Thông tin sản phẩm</h3>
            <p>{product.description || "Dòng laptop mang cấu hình vượt trội đáp ứng tốt mọi công việc đồ họa, chơi game bom tấn và các tác vụ tính toán chuyên sâu."}</p>
          </div>

          <div className="specifications-table">
            <h3>Thông số kỹ thuật</h3>
            <div className="spec-row"><span className="spec-label">Vi xử lý (CPU)</span><span>Intel Core i7/AMD Ryzen 7</span></div>
            <div className="spec-row"><span className="spec-label">Bộ nhớ RAM</span><span>16GB LPDDR5</span></div>
            <div className="spec-row"><span className="spec-label">Ổ cứng SSD</span><span>512GB NVMe PCIe</span></div>
            <div className="spec-row"><span className="spec-label">Card đồ họa</span><span>NVIDIA RTX 4060 8GB</span></div>
          </div>

          {product.stock > 0 && (
            <div className="cart-controls">
              <div className="qty-selector">
                <button onClick={() => setQuantity(q => Math.max(q - 1, 1))}>-</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(q + 1, product.stock))}>+</button>
              </div>

              <button onClick={handleAddToCart} className="btn-glow">
                Thêm Vào Giỏ Hàng
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
