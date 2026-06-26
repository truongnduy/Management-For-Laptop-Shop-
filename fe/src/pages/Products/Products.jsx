import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import ProductCard from '../../components/ProductCard/ProductCard';
import './Products.css';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Active filter state (applied)
  const [appliedFilters, setAppliedFilters] = useState({
    brands: [],
    priceMin: 0,
    priceMax: 5000,
    ram: [],
    storage: [],
    screen: []
  });

  // Temporary filter state (in drawer/sidebar before clicking "Apply")
  const [tempFilters, setTempFilters] = useState({
    brands: [],
    priceMin: 0,
    priceMax: 5000,
    ram: [],
    storage: [],
    screen: []
  });

  // Sort & View Layout
  const [sortBy, setSortBy] = useState('popular');
  const [isGridView, setIsGridView] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Mobile Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    setError(false);
    try {
      // Load enough items to perform high quality client-side filtering and sorting
      const res = await api.getProducts(1, 100);
      if (res && res.products) {
        setProducts(res.products);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Filter and sort products whenever state changes
  useEffect(() => {
    let result = [...products];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(prod => 
        prod.name.toLowerCase().includes(q) || 
        (prod.description && prod.description.toLowerCase().includes(q))
      );
    }

    // Brand filter
    if (appliedFilters.brands.length > 0) {
      result = result.filter(prod => 
        appliedFilters.brands.some(b => prod.name.toLowerCase().includes(b.toLowerCase()))
      );
    }

    // Price range filter
    result = result.filter(prod => 
      prod.price >= appliedFilters.priceMin && prod.price <= appliedFilters.priceMax
    );

    // RAM filter
    if (appliedFilters.ram.length > 0) {
      result = result.filter(prod => {
        const desc = (prod.description || '').toLowerCase();
        return appliedFilters.ram.some(r => desc.includes(r.toLowerCase()));
      });
    }

    // Storage filter
    if (appliedFilters.storage.length > 0) {
      result = result.filter(prod => {
        const desc = (prod.description || '').toLowerCase();
        return appliedFilters.storage.some(s => {
          if (s === '1TB SSD') return desc.includes('1tb');
          return desc.includes(s.toLowerCase());
        });
      });
    }

    // Screen size filter
    if (appliedFilters.screen.length > 0) {
      result = result.filter(prod => {
        const desc = (prod.description || '').toLowerCase();
        return appliedFilters.screen.some(s => desc.includes(s));
      });
    }

    // Sorting
    if (sortBy === 'newest') {
      result.sort((a, b) => b.id - a.id);
    } else if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } // 'popular' maintains initial database order

    setFilteredProducts(result);
    setCurrentPage(1); // Reset to first page on filter/sort change
  }, [products, searchQuery, appliedFilters, sortBy]);

  // Handle Multi-Checkbox changes in temp state
  const handleCheckboxChange = (category, value) => {
    setTempFilters(prev => {
      const list = prev[category];
      const newList = list.includes(value) 
        ? list.filter(item => item !== value)
        : [...list, value];
      return { ...prev, [category]: newList };
    });
  };

  // Explicit Filter Actions
  const applyFilters = () => {
    setAppliedFilters(tempFilters);
    setIsDrawerOpen(false);
  };

  const clearAllFilters = () => {
    const defaultFilters = {
      brands: [],
      priceMin: 0,
      priceMax: 5000,
      ram: [],
      storage: [],
      screen: []
    };
    setTempFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setSearchQuery('');
    setIsDrawerOpen(false);
  };

  // Client-side pagination calculations
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const formatVND = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Render Filter Form Content
  const renderFilterForm = () => (
    <div className="filter-form-content">
      {/* Brand Section */}
      <div className="filter-section">
        <h4>Thương hiệu</h4>
        <div className="checkbox-list">
          {['Dell', 'HP', 'Asus', 'Lenovo', 'Apple'].map(b => (
            <label key={b} className="checkbox-label">
              <input 
                type="checkbox" 
                checked={tempFilters.brands.includes(b)} 
                onChange={() => handleCheckboxChange('brands', b)}
              />
              <span>{b}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Section */}
      <div className="filter-section">
        <h4>Khoảng giá ($)</h4>
        <div className="price-inputs">
          <div className="price-input-group">
            <span className="price-input-symbol">$</span>
            <input 
              type="number" 
              className="form-input"
              value={tempFilters.priceMin}
              onChange={(e) => setTempFilters({ ...tempFilters, priceMin: Math.max(0, parseInt(e.target.value) || 0) })}
              placeholder="Min"
            />
          </div>
          <span className="price-separator">-</span>
          <div className="price-input-group">
            <span className="price-input-symbol">$</span>
            <input 
              type="number" 
              className="form-input"
              value={tempFilters.priceMax}
              onChange={(e) => setTempFilters({ ...tempFilters, priceMax: Math.max(0, parseInt(e.target.value) || 0) })}
              placeholder="Max"
            />
          </div>
        </div>
        <input 
          type="range" 
          min="0" 
          max="5000" 
          step="100"
          value={tempFilters.priceMax} 
          onChange={(e) => setTempFilters({ ...tempFilters, priceMax: parseInt(e.target.value) })}
          className="price-slider-range"
        />
      </div>

      {/* RAM Section */}
      <div className="filter-section">
        <h4>RAM</h4>
        <div className="checkbox-list">
          {['8GB', '16GB', '32GB', '64GB'].map(r => (
            <label key={r} className="checkbox-label">
              <input 
                type="checkbox" 
                checked={tempFilters.ram.includes(r)} 
                onChange={() => handleCheckboxChange('ram', r)}
              />
              <span>{r}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Storage Section */}
      <div className="filter-section">
        <h4>Ổ cứng (SSD)</h4>
        <div className="checkbox-list">
          {['256GB SSD', '512GB SSD', '1TB SSD'].map(s => (
            <label key={s} className="checkbox-label">
              <input 
                type="checkbox" 
                checked={tempFilters.storage.includes(s)} 
                onChange={() => handleCheckboxChange('storage', s)}
              />
              <span>{s}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Screen Size Section */}
      <div className="filter-section">
        <h4>Kích thước màn hình</h4>
        <div className="checkbox-list">
          {['13', '14', '15.6', '16', '17'].map(s => (
            <label key={s} className="checkbox-label">
              <input 
                type="checkbox" 
                checked={tempFilters.screen.includes(s)} 
                onChange={() => handleCheckboxChange('screen', s)}
              />
              <span>{s === '15.6' ? '15.6"' : `${s}"`}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="filter-actions-row">
        <button className="btn-glow flex-1" onClick={applyFilters}>Áp dụng</button>
        <button className="btn-secondary-link" onClick={clearAllFilters}>Xóa bộ lọc</button>
      </div>
    </div>
  );

  return (
    <div className="products-page max-w-7xl mx-auto px-4 md:px-8">
      {/* Top Search & Filter Bar (Mobile scroll friendly) */}
      <div className="filter-top-bar glass-card mb-6">
        <div className="search-bar-box">
          <svg className="search-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input 
            type="text" 
            placeholder="Tìm dòng máy (Dell XPS, MacBook Pro, ROG...)" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input search-input-field"
          />
        </div>

        {/* Mobile filter toggle */}
        <button className="mobile-filter-toggle-btn btn-secondary" onClick={() => setIsDrawerOpen(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
          </svg>
          <span>Bộ lọc</span>
        </button>

        {/* Desktop horizontal shortcuts */}
        <div className="filter-shortcuts">
          <button 
            className={`shortcut-chip ${appliedFilters.brands.includes('Apple') ? 'active' : ''}`}
            onClick={() => {
              const nextBrands = appliedFilters.brands.includes('Apple') ? [] : ['Apple'];
              setTempFilters({ ...tempFilters, brands: nextBrands });
              setAppliedFilters({ ...appliedFilters, brands: nextBrands });
            }}
          >
            Apple MacBook
          </button>
          <button 
            className={`shortcut-chip ${appliedFilters.brands.includes('Dell') ? 'active' : ''}`}
            onClick={() => {
              const nextBrands = appliedFilters.brands.includes('Dell') ? [] : ['Dell'];
              setTempFilters({ ...tempFilters, brands: nextBrands });
              setAppliedFilters({ ...appliedFilters, brands: nextBrands });
            }}
          >
            Dell XPS
          </button>
          <button 
            className={`shortcut-chip ${appliedFilters.brands.includes('Asus') ? 'active' : ''}`}
            onClick={() => {
              const nextBrands = appliedFilters.brands.includes('Asus') ? [] : ['Asus'];
              setTempFilters({ ...tempFilters, brands: nextBrands });
              setAppliedFilters({ ...appliedFilters, brands: nextBrands });
            }}
          >
            ASUS Gaming
          </button>
          <button 
            className={`shortcut-chip ${appliedFilters.ram.includes('32GB') ? 'active' : ''}`}
            onClick={() => {
              const nextRam = appliedFilters.ram.includes('32GB') ? [] : ['32GB'];
              setTempFilters({ ...tempFilters, ram: nextRam });
              setAppliedFilters({ ...appliedFilters, ram: nextRam });
            }}
          >
            RAM 32GB
          </button>
        </div>
      </div>

      <div className="products-layout-wrapper">
        {/* Left Sidebar (Desktop Only) */}
        <aside className="filter-sidebar glass-card">
          <div className="sidebar-header">
            <h3>Bộ lọc sản phẩm</h3>
            {(appliedFilters.brands.length > 0 || appliedFilters.ram.length > 0 || appliedFilters.storage.length > 0 || appliedFilters.screen.length > 0 || appliedFilters.priceMax < 5000 || searchQuery) && (
              <button className="clear-link" onClick={clearAllFilters}>Xóa tất cả</button>
            )}
          </div>
          {renderFilterForm()}
        </aside>

        {/* Right Section: Sort Bar + Grid */}
        <main className="products-main-content">
          {/* Sort bar above products */}
          <div className="sort-bar-container glass-card mb-6">
            <div className="results-count">
              Hiển thị <strong>{totalItems}</strong> laptop
            </div>
            
            <div className="sort-actions-group">
              {/* Items Per Page Selector */}
              <div className="items-per-page-selector">
                <span>Hiển thị:</span>
                <select 
                  value={itemsPerPage} 
                  onChange={(e) => { setItemsPerPage(parseInt(e.target.value)); setCurrentPage(1); }}
                  className="form-input py-1.5 px-2"
                >
                  <option value={12}>12 sản phẩm</option>
                  <option value={24}>24 sản phẩm</option>
                  <option value={48}>48 sản phẩm</option>
                </select>
              </div>

              {/* Sort Dropdown */}
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)} 
                className="form-input sort-select py-1.5 px-3"
              >
                <option value="popular">Nổi bật nhất</option>
                <option value="newest">Mới nhất</option>
                <option value="price-asc">Giá: Thấp đến Cao</option>
                <option value="price-desc">Giá: Cao đến Thấp</option>
              </select>

              {/* Grid/List View Toggle */}
              <div className="view-toggle-btns">
                <button 
                  className={`view-btn ${isGridView ? 'active' : ''}`} 
                  onClick={() => setIsGridView(true)}
                  title="Xem dạng lưới"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                  </svg>
                </button>
                <button 
                  className={`view-btn ${!isGridView ? 'active' : ''}`} 
                  onClick={() => setIsGridView(false)}
                  title="Xem dạng danh sách"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.007 8.25H3.75v-.008h.007V15Zm0 2.25H3.75v-.008h.007V17.25Z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Product Grid / List Section */}
          {loading ? (
            /* Loading State: Skeleton Grid */
            <div className={`products-grid ${isGridView ? 'grid-view' : 'list-view'}`}>
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="product-card skeleton-card glass-card">
                  <div className="skeleton-image loading-shimmer"></div>
                  <div className="skeleton-details">
                    <div className="skeleton-title loading-shimmer"></div>
                    <div className="skeleton-specs loading-shimmer"></div>
                    <div className="skeleton-price loading-shimmer"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            /* Error State */
            <div className="error-state glass-card p-12 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto text-red-500 mb-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              <h3>Lỗi kết nối dữ liệu</h3>
              <p className="body-text mb-6">Không thể tải thông tin sản phẩm từ hệ thống.</p>
              <button onClick={loadProducts} className="btn-glow">Thử lại</button>
            </div>
          ) : paginatedProducts.length === 0 ? (
            /* Empty State */
            <div className="empty-state-container glass-card p-12 text-center">
              <div className="empty-illustration mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-20 h-20 mx-auto text-slate-300">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.008 1.24l.885 1.77a2.25 2.25 0 0 0 2.007 1.24h1.98a2.25 2.25 0 0 0 2.007-1.24l.885-1.77a2.25 2.25 0 0 1 2.007-1.24h3.86m-18 0h18a2.25 2.25 0 0 1 2.25 2.25v4.5A2.25 2.25 0 0 1 18 22.5H6a2.25 2.25 0 0 1-2.25-2.25v-4.5m18-9-1.214-3.036A2.25 2.25 0 0 0 16.714 4.5H7.286a2.25 2.25 0 0 0-2.072 1.328L4 9.5" />
                </svg>
              </div>
              <h3 className="section-title mb-2">Không tìm thấy sản phẩm</h3>
              <p className="body-text mb-6">Không có dòng Laptop nào khớp với bộ lọc bạn đang chọn.</p>
              <button onClick={clearAllFilters} className="btn-glow">Xóa bộ lọc</button>
            </div>
          ) : (
            /* Products Output List */
            <>
              <div className={`products-grid ${isGridView ? 'grid-view' : 'list-view'}`}>
                {paginatedProducts.map(prod => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>

              {/* Number Pagination */}
              {totalPages > 1 && (
                <div className="pagination-bar glass-card mt-8">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} 
                    disabled={currentPage === 1}
                    className="page-control-btn"
                    title="Trang trước"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                  </button>

                  <div className="page-numbers">
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const pNum = idx + 1;
                      return (
                        <button
                          key={pNum}
                          onClick={() => setCurrentPage(pNum)}
                          className={`page-num-btn ${currentPage === pNum ? 'active' : ''}`}
                        >
                          {pNum}
                        </button>
                      );
                    })}
                  </div>

                  <button 
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} 
                    disabled={currentPage === totalPages}
                    className="page-control-btn"
                    title="Trang sau"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Slide-in Mobile Drawer Filter */}
      {isDrawerOpen && (
        <div className="drawer-overlay" onClick={() => setIsDrawerOpen(false)}>
          <div className="drawer-content glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h3>Bộ lọc nâng cao</h3>
              <button className="close-drawer-btn" onClick={() => setIsDrawerOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="drawer-body">
              {renderFilterForm()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
