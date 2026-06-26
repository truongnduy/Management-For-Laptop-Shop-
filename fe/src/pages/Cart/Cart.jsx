import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { api } from '../../services/api';
import './Cart.css';

export default function Cart() {
  const { cartItems, updateQuantity, removeItem, getCartTotal, clearCartState } = useCart();

  // Thông tin giao hàng
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const formatVND = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    setSubmitting(true);

    try {
      const res = await api.checkout(address, city, phone);
      if (res && res.success) {
        setOrderSuccess(true);
        clearCartState();
      } else {
        alert(res.errors || 'Thanh toán thất bại, vui lòng kiểm tra lại!');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối API!');
    } finally {
      setSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="cart-page msg-page">
        <div className="success-card glass-card">
          <h2>ĐẶT HÀNG THÀNH CÔNG!</h2>
          <p>Đơn hàng của bạn đã được lưu lại hệ thống. LapShop sẽ liên hệ giao hàng sớm nhất.</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-page msg-page">
        <div className="empty-card glass-card">
          <h2>🛒 Giỏ hàng trống</h2>
          <p>Bạn chưa thêm chiếc Laptop nào vào giỏ. Hãy quay lại trang sản phẩm nhé.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h2>GIỎ HÀNG CỦA BẠN</h2>

      <div className="cart-layout">
        {/* Bảng sản phẩm */}
        <div className="cart-items-section glass-card">
          {cartItems.map(item => (
            <div key={item.id} className="cart-item">
              <img src="/src/assets/hero.png" alt={item.product.name} className="cart-item-img" />
              <div className="cart-item-info">
                <h4>{item.product.name}</h4>
                <span className="cart-item-price">{formatVND(item.product.price)}</span>
              </div>
              <div className="cart-item-controls">
                <button onClick={() => updateQuantity(item.id, Math.max(item.quantity - 1, 1))}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
              </div>
              <button 
                onClick={() => removeItem(item.id)} 
                className="delete-btn" 
                title="Xóa khỏi giỏ hàng"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Form giao hàng & thanh toán */}
        <div className="checkout-section glass-card">
          <h3>Thông Tin Giao Hàng</h3>
          <form onSubmit={handleCheckout} className="checkout-form">
            <div className="form-group">
              <label>Số điện thoại</label>
              <input className="form-input" type="text" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="0987xxxxxx" />
            </div>
            <div className="form-group">
              <label>Thành phố</label>
              <input className="form-input" type="text" value={city} onChange={e => setCity(e.target.value)} required placeholder="Hà Nội, TP. HCM..." />
            </div>
            <div className="form-group">
              <label>Địa chỉ nhận hàng</label>
              <input className="form-input" type="text" value={address} onChange={e => setAddress(e.target.value)} required placeholder="Số nhà, đường, phường..." />
            </div>

            <div className="order-summary">
              <div className="summary-row">
                <span>Tổng giá trị hàng:</span>
                <span>{formatVND(getCartTotal())}</span>
              </div>
              <div className="summary-row">
                <span>Vận chuyển:</span>
                <span className="free-shipping">Miễn phí</span>
              </div>
              <hr />
              <div className="summary-row total-row">
                <span>Tổng thanh toán:</span>
                <span>{formatVND(getCartTotal())}</span>
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn-glow w-full mt-4">
              {submitting ? 'Đang thực hiện thanh toán...' : 'Xác Nhận Đặt Hàng'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
