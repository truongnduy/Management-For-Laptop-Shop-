import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addItemToCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);

  const formatVND = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Generate mock original price and discount
  const originalPrice = Math.round(product.price * 1.18);
  const discountPercent = 15;

  // Extract specs from description or use defaults
  const getSpecs = () => {
    const desc = product.description || '';
    let cpu = 'Intel i7';
    if (desc.includes('M3')) cpu = 'Apple M3 Max';
    else if (desc.includes('i9')) cpu = 'Intel i9';
    else if (desc.includes('Ryzen 9')) cpu = 'AMD Ryzen 9';
    else if (desc.includes('Ultra 7')) cpu = 'Intel Ultra 7';

    let ram = '16GB';
    const ramMatch = desc.match(/(\d+GB)\s*RAM/i) || desc.match(/(\d+GB)/);
    if (ramMatch) ram = ramMatch[1];

    let ssd = '512GB SSD';
    const ssdMatch = desc.match(/(\d+(?:GB|TB)\s*SSD)/i) || desc.match(/(\d+TB)/);
    if (ssdMatch) ssd = ssdMatch[1].includes('SSD') ? ssdMatch[1] : `${ssdMatch[1]} SSD`;

    let screen = '15.6" FHD';
    if (desc.includes('16.2-inch')) screen = '16.2" XDR';
    else if (desc.includes('15.6-inch')) screen = '15.6" OLED';
    else if (desc.includes('14-inch')) screen = '14" QHD';
    else if (desc.includes('13.5-inch')) screen = '13.5" OLED';

    return `${cpu} / ${ram} / ${ssd} / ${screen}`;
  };

  // Badge mapping based on product ID
  const getBadge = () => {
    if (product.id % 3 === 0) return { text: 'Sale', type: 'sale' };
    if (product.id % 3 === 1) return { text: 'Hot', type: 'hot' };
    return { text: 'New', type: 'new' };
  };

  const badge = getBadge();
  const rating = (4.3 + (product.id % 7) * 0.1).toFixed(1);
  const reviewCount = 10 + (product.id % 5) * 8;

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  return (
    <>
      <div className="product-card glass-card flex flex-col h-full p-4 relative overflow-hidden transition-all duration-200 group">
        {/* Image & Hover Action Overlay */}
        <div className="image-container-wrapper relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-3">
          <Link to={`/products/${product.id}`} className="card-link-img block w-full h-full">
            <div className="image-container w-full h-full flex items-center justify-center p-4 bg-slate-50">
              <img src="/src/assets/laptop_hero.png" alt={product.name} className="prod-img max-w-[90%] max-h-[90%] object-contain transition-transform duration-300 group-hover:scale-106" />
            </div>
          </Link>

          {/* Badges top-left */}
          <div className="card-badges absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10 pointer-events-none">
            <span className={`badge-tag badge-${badge.type} text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider text-white`}>{badge.text}</span>
            {product.stock <= 0 && <span className="badge-tag bg-slate-500 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider text-white">Hết hàng</span>}
          </div>

          {/* Wishlist icon top-right */}
          <button 
            className={`wishlist-btn absolute top-2.5 right-2.5 bg-white border border-slate-200 text-slate-500 w-8.5 h-8.5 rounded-full flex items-center justify-center cursor-pointer shadow-sm hover:scale-110 active:scale-90 hover:text-red-500 hover:border-red-200 transition-all duration-200 ${isWishlisted ? 'text-red-500 border-red-200' : ''}`} 
            onClick={handleWishlist}
            title={isWishlisted ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill={isWishlisted ? "#ef4444" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke={isWishlisted ? "#ef4444" : "currentColor"} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
          </button>

          {/* Quick view button on hover */}
          <button 
            className="quick-view-overlay-btn absolute bottom-[-40px] left-1/2 translate-x-[-50%] bg-slate-900/85 text-white border-none px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow opacity-0 group-hover:bottom-3 group-hover:opacity-100 hover:bg-blue-600 hover:scale-105 transition-all duration-200 z-5"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowQuickView(true); }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
            <span>Xem nhanh</span>
          </button>
        </div>

        {/* Product Info */}
        <div className="prod-details flex flex-col gap-1.5 flex-grow mb-3">
          <Link to={`/products/${product.id}`} className="card-info-link no-underline">
            <h3 className="prod-name text-sm font-semibold text-slate-900 line-clamp-2 h-10 hover:text-blue-600 transition-colors" title={product.name}>{product.name}</h3>
          </Link>

          {/* Star rating + review count */}
          <div className="prod-rating-row flex items-center gap-1.5 text-xs">
            <div className="stars flex items-center gap-0.5 text-slate-900 font-semibold">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#f59e0b" className="w-4 h-4">
                <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
              </svg>
              <span>{rating}</span>
            </div>
            <span className="review-count text-slate-500">({reviewCount} đánh giá)</span>
          </div>

          {/* Short specs: 1 line */}
          <p className="prod-specs-line text-xs text-slate-500 truncate">{getSpecs()}</p>

          {/* Price row */}
          <div className="price-row flex items-center flex-wrap gap-1.5 mt-1">
            <span className="prod-price-sale text-base font-bold text-blue-600">{formatVND(product.price)}</span>
            <span className="prod-price-original text-xs text-slate-400 line-through">{formatVND(originalPrice)}</span>
            <span className="discount-tag text-xs font-bold text-orange-500">-{discountPercent}%</span>
          </div>
        </div>

        {/* Add to Cart button */}
        <div className="card-action-btn-row transition-all duration-200 lg:opacity-0 lg:translate-y-2 lg:pointer-events-none lg:h-0 lg:overflow-hidden lg:group-hover:opacity-100 lg:group-hover:translate-y-0 lg:group-hover:pointer-events-auto lg:group-hover:height-auto lg:group-hover:mt-2">
          <button 
            onClick={() => addItemToCart(product.id, 1)}
            className="btn-glow w-full flex items-center justify-center gap-1.5"
            disabled={product.stock <= 0}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            <span>{product.stock <= 0 ? 'Hết hàng' : 'Thêm vào giỏ'}</span>
          </button>
        </div>
      </div>

      {/* Quick View Modal */}
      {showQuickView && (
        <div className="quickview-overlay fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" onClick={() => setShowQuickView(false)}>
          <div className="quickview-modal glass-card bg-white rounded-2xl w-full max-w-[800px] shadow-2xl relative overflow-hidden p-6" onClick={(e) => e.stopPropagation()}>
            <button className="quickview-close-btn absolute top-4 right-4 bg-transparent border-none text-slate-500 cursor-pointer hover:text-slate-900 hover:scale-110 transition-all duration-200" onClick={() => setShowQuickView(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="quickview-grid grid grid-cols-1 sm:grid-cols-[1fr_1.2fr] gap-6 mt-4">
              <div className="quickview-image-box flex items-center justify-center rounded-xl p-8 aspect-[4/3] bg-slate-50">
                <img src="/src/assets/laptop_hero.png" alt={product.name} className="max-w-full max-h-[240px] object-contain" />
              </div>
              <div className="quickview-info-box flex flex-col">
                <div className="quickview-badge-row flex gap-2 mb-3">
                  <span className={`badge-tag badge-${badge.type} text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider text-white`}>{badge.text}</span>
                  {product.stock > 0 ? (
                    <span className="badge-tag bg-green-600 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider text-white">Sẵn hàng</span>
                  ) : (
                    <span className="badge-tag bg-slate-500 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider text-white">Hết hàng</span>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">{product.name}</h2>
                <div className="prod-rating-row flex items-center gap-1.5 text-xs mb-3">
                  <div className="stars flex items-center gap-0.5 text-slate-900 font-semibold">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#f59e0b" className="w-4 h-4">
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
                    </svg>
                    <span>{rating}</span>
                  </div>
                  <span className="review-count text-slate-500">({reviewCount} đánh giá)</span>
                </div>
                <div className="price-row flex items-center flex-wrap gap-2.5 my-4">
                  <span className="prod-price-sale text-2xl font-bold text-blue-600">{formatVND(product.price)}</span>
                  <span className="prod-price-original text-lg text-slate-400 line-through">{formatVND(originalPrice)}</span>
                  <span className="discount-tag text-sm font-bold text-orange-500">-{discountPercent}%</span>
                </div>
                <p className="body-text text-sm text-slate-500 leading-relaxed mb-4">{product.description || "Dòng laptop mang cấu hình vượt trội đáp ứng tốt mọi công việc đồ họa, chơi game bom tấn và các tác vụ tính toán chuyên sâu."}</p>
                <div className="quickview-specs mb-6 bg-slate-50 p-4 rounded-xl">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">Thông số chi tiết:</h4>
                  <p className="text-xs text-slate-500">{getSpecs()}</p>
                </div>
                <button 
                  onClick={() => { addItemToCart(product.id, 1); setShowQuickView(false); }}
                  className="btn-glow w-full py-3 flex items-center justify-center gap-1.5"
                  disabled={product.stock <= 0}
                >
                  Thêm Vào Giỏ Hàng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
