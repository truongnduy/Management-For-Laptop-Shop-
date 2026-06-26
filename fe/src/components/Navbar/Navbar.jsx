import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { getCartCount, clearCartState } = useCart();
  const navigate = useNavigate();

  console.log("Navbar current user:", user);

  const handleLogout = () => {
    logout();
    clearCartState();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          LAP<span>SHOP</span>
        </Link>
        <div className="nav-menu">
          <Link to="/" className="nav-link">Trang Chủ</Link>
          <Link to="/products" className="nav-link">Sản Phẩm</Link>
          {user && user.role === 'admin' && (
            <Link to="/admin" className="nav-link admin-nav-link" style={{ color: 'var(--accent)', fontWeight: 'bold' }}>Quản Trị</Link>
          )}
        </div>
        <div className="nav-actions">
          <Link to="/cart" className="cart-icon-btn">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            {getCartCount() > 0 && <span className="cart-badge">{getCartCount()}</span>}
          </Link>

          {user ? (
            <div className="user-section">
              <span className="welcome-txt">Xin chào, <strong>{user.username}</strong></span>
              <button onClick={handleLogout} className="logout-btn">Đăng xuất</button>
            </div>
          ) : (
            <Link to="/login" className="btn-glow btn-sm">Đăng Nhập</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
