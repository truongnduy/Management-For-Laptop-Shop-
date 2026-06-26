import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Route protection - Admin check
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      alert('Bạn không có quyền truy cập trang quản trị!');
      navigate('/');
    }
  }, [user, navigate]);

  // UI state
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'products', 'orders'
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);

  // Backend Data State
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [usersCount, setUsersCount] = useState(0);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Filter & Search states
  const [prodSearch, setProdSearch] = useState('');
  const [prodBrand, setProdBrand] = useState('All');
  const [prodStatus, setProdStatus] = useState('All');
  const [selectedProdIds, setSelectedProdIds] = useState([]);

  // Order status filter tabs
  const [activeOrderTab, setActiveOrderTab] = useState('all');

  // Slide-over states
  const [prodSlideOverOpen, setProdSlideOverOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null means "Add Product"
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    status: 'active'
  });

  const [orderSlideOverOpen, setOrderSlideOverOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Confirm delete dialog state
  const [deleteConfirmProd, setDeleteConfirmProd] = useState(null);

  // Fetch data
  const fetchData = async () => {
    if (!user || user.role !== 'admin') return;

    setLoadingProducts(true);
    setLoadingOrders(true);

    try {
      // 1. Fetch all products (page 1, perPage 100 to get list)
      const prodRes = await api.getProducts(1, 100);
      if (prodRes && prodRes.products) {
        setProducts(prodRes.products);
      }

      // 2. Fetch all orders (since admin, controller returns all)
      const orderRes = await api.getOrders();
      if (orderRes && orderRes.orders) {
        setOrders(orderRes.orders);
      }

      // 3. Fetch users count
      const usersRes = await api.getUsers();
      if (usersRes && usersRes.users) {
        setUsersCount(usersRes.users.length);
      }
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
    } finally {
      setLoadingProducts(false);
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Handlers for Products
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({ name: '', description: '', price: '', stock: '', status: 'active' });
    setProdSlideOverOpen(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      description: prod.description || '',
      price: prod.price,
      stock: prod.stock,
      status: prod.status || 'active'
    });
    setProdSlideOverOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        // Update product
        const res = await api.updateProductData(editingProduct.id, productForm);
        if (res && res.product) {
          alert('Cập nhật sản phẩm thành công!');
          fetchData();
          setProdSlideOverOpen(false);
        } else {
          alert(res.errors || 'Cập nhật thất bại');
        }
      } else {
        // Create product
        const res = await api.createProduct(productForm);
        if (res && res.product) {
          alert('Thêm sản phẩm thành công!');
          fetchData();
          setProdSlideOverOpen(false);
        } else {
          alert(res.errors || 'Thêm thất bại');
        }
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối máy chủ');
    }
  };

  const handleDeleteProduct = async (prodId) => {
    try {
      const res = await api.deleteProduct(prodId);
      if (res && res.message) {
        alert('Xóa sản phẩm thành công!');
        fetchData();
        setDeleteConfirmProd(null);
      } else {
        alert(res.errors || 'Xóa thất bại');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối máy chủ');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProdIds.length === 0) return;
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedProdIds.length} sản phẩm đã chọn?`)) {
      try {
        for (const id of selectedProdIds) {
          await api.deleteProduct(id);
        }
        alert('Xóa hàng loạt thành công!');
        setSelectedProdIds([]);
        fetchData();
      } catch (err) {
        console.error(err);
        alert('Có lỗi xảy ra khi xóa hàng loạt');
      }
    }
  };

  // Handlers for Orders
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await api.updateOrder(orderId, newStatus);
      if (res && res.order) {
        alert('Cập nhật trạng thái đơn hàng thành công!');
        fetchData();
        // Update selected order detail if open
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(res.order);
        }
      } else {
        alert(res.errors || 'Cập nhật thất bại');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối máy chủ');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Filtered Products list
  const filteredProducts = products.filter(prod => {
    const matchSearch = prod.name.toLowerCase().includes(prodSearch.toLowerCase());
    const matchBrand = prodBrand === 'All' || prod.name.toLowerCase().includes(prodBrand.toLowerCase());
    const matchStatus = prodStatus === 'All' || (prodStatus === 'active' && prod.stock > 0) || (prodStatus === 'inactive' && prod.stock <= 0);
    return matchSearch && matchBrand && matchStatus;
  });

  // Filtered Orders list
  const filteredOrders = orders.filter(order => {
    if (activeOrderTab === 'all') return true;
    return (order.status || '').toLowerCase() === activeOrderTab.toLowerCase();
  });

  // Derived KPI computations
  const totalRevenue = orders.reduce((sum, order) => sum + (parseFloat(order.total_price) || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const totalStockCount = products.reduce((sum, p) => sum + (p.stock || 0), 0);

  const formatVND = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className={`admin-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* 1. SIDEBAR */}
      <aside className="admin-sidebar glass-card">
        <div className="sidebar-logo-box">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-blue-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.552 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
          <span className="logo-text">ADMIN<span>PANEL</span></span>
        </div>

        <div className="sidebar-nav-groups">
          {/* Group 1: Overview */}
          <div className="nav-group">
            <span className="group-label">Overview</span>
            <button 
              className={`nav-item-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
              </svg>
              <span>Bảng Tổng Quan</span>
            </button>
          </div>

          {/* Group 2: Catalog */}
          <div className="nav-group">
            <span className="group-label">Catalog</span>
            <button 
              className={`nav-item-btn ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => { setActiveTab('products'); setIsMobileMenuOpen(false); }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
              </svg>
              <span>Sản Phẩm</span>
            </button>
            <button className="nav-item-btn" disabled>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a1.125 1.125 0 0 0 1.591 0l4.318-4.318a1.125 1.125 0 0 0 0-1.591L9.581 3.659a2.25 2.25 0 0 0-1.591-.659V3Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
              </svg>
              <span>Danh Mục (Mock)</span>
            </button>
          </div>

          {/* Group 3: Sales */}
          <div className="nav-group">
            <span className="group-label">Sales</span>
            <button 
              className={`nav-item-btn ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => { setActiveTab('orders'); setIsMobileMenuOpen(false); }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5A3.375 3.375 0 0 0 10.125 2.25H3.75A1.125 1.125 0 0 0 2.625 3.375v17.25c0 .621.504 1.125 1.125 1.125h16.5a1.125 1.125 0 0 0 1.125-1.125v-2.25Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h6a3.75 3.75 0 0 1 3.75 3.75v6a3.75 3.75 0 0 1-3.75 3.75h-6A3.75 3.75 0 0 1 0 18.75v-6A3.75 3.75 0 0 1 3.75 9Z" />
              </svg>
              <span>Đơn Hàng</span>
            </button>
            <button className="nav-item-btn" disabled>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0 1 10.089 18a11.374 11.374 0 0 1-4.833-1.112v-.109m0-17.82c0-.774.624-1.434 1.4-1.41a40.79 40.79 0 0 1 6.8 0c.776.024 1.4.684 1.4 1.41v.12c0 .656-.126 1.283-.356 1.857M5.25 10.425a10.28 10.28 0 0 1 2.228-1.574M18.75 10.5h.008v.008h-.008V10.5Z" />
              </svg>
              <span>Khách Hàng</span>
            </button>
          </div>
        </div>

        {/* Sidebar collapse button at bottom */}
        <button 
          className="sidebar-collapse-toggle-btn"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          title={isSidebarCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d={isSidebarCollapsed ? "m8.25 4.5 7.5 7.5-7.5 7.5" : "M15.75 19.5 8.25 12l7.5-7.5"} />
          </svg>
          <span>Thu Gọn Menu</span>
        </button>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="admin-main-container">
        
        {/* 2. TOPBAR */}
        <header className="admin-topbar glass-card">
          <div className="topbar-left">
            {/* Hamburger button on mobile */}
            <button className="mobile-hamburger-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <h2 className="topbar-title">
              {activeTab === 'dashboard' && 'Bảng Điều Khiển Tổng Quan'}
              {activeTab === 'products' && 'Quản Lý Danh Sách Sản Phẩm'}
              {activeTab === 'orders' && 'Quản Lý Đơn Đặt Hàng'}
            </h2>
          </div>

          <div className="topbar-right">
            {/* Notification bell with count */}
            <div className="topbar-notifications" onClick={() => setNotificationCount(0)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
              </svg>
              {notificationCount > 0 && <span className="noti-badge">{notificationCount}</span>}
            </div>

            {/* Admin Avatar + Dropdown */}
            <div className="admin-avatar-menu">
              <div className="avatar-info-trigger" onClick={() => setShowAdminDropdown(!showAdminDropdown)}>
                <div className="avatar-circle">AD</div>
                <span className="admin-name">{user?.username || 'Administrator'}</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </div>

              {showAdminDropdown && (
                <div className="avatar-dropdown glass-card">
                  <button className="dropdown-item" onClick={() => alert('Profile management is mocked.')}>Tài Khoản</button>
                  <hr />
                  <button className="dropdown-item logout-txt" onClick={handleLogout}>Đăng Xuất</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* 3. TABS CONTAINER */}
        <div className="admin-tab-content-wrapper">
          
          {/* ============================== TAB: DASHBOARD ============================== */}
          {activeTab === 'dashboard' && (
            <div className="tab-pane-view">
              
              {/* KPI Cards Row (4 cards) */}
              <div className="kpi-cards-grid">
                
                {/* KPI 1: Doanh thu */}
                <div className="kpi-card glass-card">
                  <div className="kpi-icon-row">
                    <div className="kpi-icon bg-blue-100 text-blue-600">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                    </div>
                    <span className="trend-tag trend-up">+14.2% ↑</span>
                  </div>
                  <div className="kpi-data-box">
                    <span className="kpi-label">Tổng Doanh Thu</span>
                    <h3 className="kpi-val">{formatVND(totalRevenue)}</h3>
                  </div>
                </div>

                {/* KPI 2: Đơn hàng */}
                <div className="kpi-card glass-card">
                  <div className="kpi-icon-row">
                    <div className="kpi-icon bg-orange-100 text-orange-600">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                      </svg>
                    </div>
                    <span className="trend-tag trend-up">+8.5% ↑</span>
                  </div>
                  <div className="kpi-data-box">
                    <span className="kpi-label">Đơn Hàng Ghi Nhận</span>
                    <h3 className="kpi-val">{orders.length} đơn</h3>
                  </div>
                </div>

                {/* KPI 3: Khách hàng */}
                <div className="kpi-card glass-card">
                  <div className="kpi-icon-row">
                    <div className="kpi-icon bg-green-100 text-green-600">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                      </svg>
                    </div>
                    <span className="trend-tag trend-down">-2.1% ↓</span>
                  </div>
                  <div className="kpi-data-box">
                    <span className="kpi-label">Tổng Khách Hàng</span>
                    <h3 className="kpi-val">{usersCount} thành viên</h3>
                  </div>
                </div>

                {/* KPI 4: Tồn kho */}
                <div className="kpi-card glass-card">
                  <div className="kpi-icon-row">
                    <div className="kpi-icon bg-purple-100 text-purple-600">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                      </svg>
                    </div>
                    <span className="trend-tag text-slate-500 font-semibold">{pendingOrders} chờ xử lý</span>
                  </div>
                  <div className="kpi-data-box">
                    <span className="kpi-label">Tổng Sản Phẩm Tồn</span>
                    <h3 className="kpi-val">{totalStockCount} cái</h3>
                  </div>
                </div>

              </div>

              {/* Graphic Chart representation Row */}
              <div className="chart-row-grid">
                
                {/* Revenue Line Chart (Interactive SVG design) */}
                <div className="chart-box-card glass-card">
                  <h3 className="section-title">Doanh Thu 30 Ngày Gần Nhất</h3>
                  <div className="svg-chart-container">
                    {/* Render a premium interactive visual line graph in SVG */}
                    <svg viewBox="0 0 500 200" className="svg-line-chart">
                      {/* Grid Lines */}
                      <line x1="40" y1="20" x2="480" y2="20" stroke="#f1f5f9" />
                      <line x1="40" y1="60" x2="480" y2="60" stroke="#f1f5f9" />
                      <line x1="40" y1="100" x2="480" y2="100" stroke="#f1f5f9" />
                      <line x1="40" y1="140" x2="480" y2="140" stroke="#f1f5f9" />
                      <line x1="40" y1="170" x2="480" y2="170" stroke="#cbd5e1" strokeWidth="1.5" />

                      {/* Line graph route path */}
                      <path 
                        d="M40,160 Q80,120 120,135 T200,90 T280,110 T360,50 T440,65 T480,40" 
                        fill="none" 
                        stroke="#2563eb" 
                        strokeWidth="3" 
                      />
                      {/* Area fill */}
                      <path 
                        d="M40,160 Q80,120 120,135 T200,90 T280,110 T360,50 T440,65 T480,40 L480,170 L40,170 Z" 
                        fill="rgba(37, 99, 235, 0.08)" 
                      />

                      {/* Value nodes */}
                      <circle cx="200" cy="90" r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" className="chart-hover-node" />
                      <circle cx="360" cy="50" r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" className="chart-hover-node" />
                      <circle cx="480" cy="40" r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" className="chart-hover-node" />
                    </svg>
                    <div className="chart-legends">
                      <span>Tuần 1</span>
                      <span>Tuần 2</span>
                      <span>Tuần 3</span>
                      <span>Tuần 4</span>
                    </div>
                  </div>
                </div>

                {/* Donut Status Chart */}
                <div className="chart-box-card glass-card">
                  <h3 className="section-title">Phân Bổ Trạng Thái Đơn</h3>
                  <div className="svg-donut-container">
                    <svg width="160" height="160" viewBox="0 0 42 42" className="donut-graphic">
                      <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#f1f5f9" strokeWidth="4.2"></circle>
                      <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#2563eb" strokeWidth="4.2" strokeDasharray="60 40" strokeDashoffset="25"></circle>
                      <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#16a34a" strokeWidth="4.2" strokeDasharray="25 75" strokeDashoffset="85"></circle>
                      <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#f97316" strokeWidth="4.2" strokeDasharray="15 85" strokeDashoffset="110"></circle>
                    </svg>
                    <div className="donut-legends">
                      <div className="legend-row"><span className="legend-dot bg-blue-600"></span><span>Thành công (60%)</span></div>
                      <div className="legend-row"><span className="legend-dot bg-green-600"></span><span>Đang giao (25%)</span></div>
                      <div className="legend-row"><span className="legend-dot bg-orange-500"></span><span>Chờ xử lý (15%)</span></div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Recent Orders & Products list */}
              <div className="tables-row-grid">
                {/* Recent Orders table */}
                <div className="dashboard-table-card glass-card">
                  <h3 className="section-title mb-4">Đơn Hàng Gần Đây</h3>
                  <div className="responsive-table-box">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Mã đơn</th>
                          <th>Khách hàng</th>
                          <th>Tổng tiền</th>
                          <th>Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 5).map(o => (
                          <tr key={o.id}>
                            <td><strong>#{o.id}</strong></td>
                            <td>{o.user?.username || 'Khách vãng lai'}</td>
                            <td>{formatVND(o.total_price)}</td>
                            <td>
                              <span className={`status-badge-indicator badge-${o.status}`}>
                                {o.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {orders.length === 0 && (
                          <tr>
                            <td colSpan="4" className="text-center text-slate-400 py-6">Không có đơn hàng nào.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Top Products */}
                <div className="dashboard-table-card glass-card">
                  <h3 className="section-title mb-4">Sản Phẩm Tồn Kho Nhiều</h3>
                  <div className="responsive-table-box">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Laptop</th>
                          <th>Số lượng</th>
                          <th>Giá</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...products].sort((a, b) => b.stock - a.stock).slice(0, 5).map(p => (
                          <tr key={p.id}>
                            <td>
                              <div className="product-thumb-cell">
                                <img src="/src/assets/laptop_hero.png" alt={p.name} />
                                <span>{p.name}</span>
                              </div>
                            </td>
                            <td>{p.stock} chiếc</td>
                            <td>{formatVND(p.price)}</td>
                          </tr>
                        ))}
                        {products.length === 0 && (
                          <tr>
                            <td colSpan="3" className="text-center text-slate-400 py-6">Không có sản phẩm nào.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ============================== TAB: PRODUCTS ============================== */}
          {activeTab === 'products' && (
            <div className="tab-pane-view">
              
              {/* Product Page Filter Bar */}
              <div className="admin-filter-bar glass-card mb-6">
                <div className="search-bar-box flex-1">
                  <svg className="search-icon w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                  <input 
                    type="text" 
                    placeholder="Tìm sản phẩm quản trị..." 
                    value={prodSearch}
                    onChange={(e) => setProdSearch(e.target.value)}
                    className="form-input search-input-field"
                  />
                </div>

                <div className="filter-options-row">
                  {/* Brand select */}
                  <select 
                    value={prodBrand} 
                    onChange={(e) => setProdBrand(e.target.value)} 
                    className="form-input py-2 px-3"
                  >
                    <option value="All">Tất cả thương hiệu</option>
                    <option value="Dell">Dell</option>
                    <option value="HP">HP</option>
                    <option value="Asus">ASUS</option>
                    <option value="Lenovo">Lenovo</option>
                    <option value="Apple">Apple</option>
                  </select>

                  {/* Status select */}
                  <select 
                    value={prodStatus} 
                    onChange={(e) => setProdStatus(e.target.value)} 
                    className="form-input py-2 px-3"
                  >
                    <option value="All">Tất cả trạng thái</option>
                    <option value="active">Còn hàng (Active)</option>
                    <option value="inactive">Hết hàng (Inactive)</option>
                  </select>

                  {/* Add Product Button */}
                  <button className="btn-glow" onClick={handleOpenAddProduct}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <span>Thêm Mới</span>
                  </button>
                </div>
              </div>

              {/* Bulk actions banner */}
              {selectedProdIds.length > 0 && (
                <div className="bulk-actions-banner glass-card mb-6 animate-slide-in">
                  <span>Đang chọn <strong>{selectedProdIds.length}</strong> sản phẩm</span>
                  <button className="btn-glow bg-red-600 hover:bg-red-700" onClick={handleBulkDelete}>
                    Xóa các mục đã chọn
                  </button>
                </div>
              )}

              {/* Products Table */}
              <div className="admin-table-card glass-card">
                <div className="responsive-table-box">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th width="40">
                          <input 
                            type="checkbox" 
                            checked={filteredProducts.length > 0 && selectedProdIds.length === filteredProducts.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedProdIds(filteredProducts.map(p => p.id));
                              } else {
                                setSelectedProdIds([]);
                              }
                            }}
                            className="admin-checkbox"
                          />
                        </th>
                        <th>Hình ảnh</th>
                        <th>Tên sản phẩm</th>
                        <th>Giá bán</th>
                        <th>Tồn kho</th>
                        <th>Trạng thái</th>
                        <th width="120" className="text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingProducts ? (
                        <tr>
                          <td colSpan="7" className="text-center py-12">
                            <div className="admin-loading-spinner"></div>
                            <span className="text-slate-400 mt-2 block">Đang tải sản phẩm...</span>
                          </td>
                        </tr>
                      ) : filteredProducts.map(p => (
                        <tr key={p.id} className={selectedProdIds.includes(p.id) ? 'row-selected' : ''}>
                          <td>
                            <input 
                              type="checkbox" 
                              checked={selectedProdIds.includes(p.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedProdIds([...selectedProdIds, p.id]);
                                } else {
                                  setSelectedProdIds(selectedProdIds.filter(id => id !== p.id));
                                }
                              }}
                              className="admin-checkbox"
                            />
                          </td>
                          <td>
                            <img src="/src/assets/laptop_hero.png" alt={p.name} className="table-img-thumb" />
                          </td>
                          <td>
                            <div className="table-product-name-box">
                              <strong>{p.name}</strong>
                              <span className="desc-sub">{p.description ? p.description.slice(0, 50) + '...' : ''}</span>
                            </div>
                          </td>
                          <td>{formatVND(p.price)}</td>
                          <td>
                            <span className={p.stock <= 0 ? 'text-red-500 font-bold' : ''}>
                              {p.stock} chiếc
                            </span>
                          </td>
                          <td>
                            <span className={`status-badge-indicator ${p.stock > 0 ? 'badge-delivered' : 'badge-cancelled'}`}>
                              {p.stock > 0 ? 'Còn hàng' : 'Hết hàng'}
                            </span>
                          </td>
                          <td>
                            <div className="table-action-btns">
                              <button className="action-icon-btn edit-btn" onClick={() => handleOpenEditProduct(p)} title="Sửa">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                                </svg>
                              </button>
                              <button className="action-icon-btn delete-btn" onClick={() => setDeleteConfirmProd(p)} title="Xóa">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredProducts.length === 0 && !loadingProducts && (
                        <tr>
                          <td colSpan="7" className="text-center text-slate-400 py-12">Không tìm thấy sản phẩm nào.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ============================== TAB: ORDERS ============================== */}
          {activeTab === 'orders' && (
            <div className="tab-pane-view">
              
              {/* Order Status Tabs */}
              <div className="order-tabs-bar glass-card mb-6">
                {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                  <button 
                    key={status}
                    className={`order-tab-btn ${activeOrderTab === status ? 'active' : ''}`}
                    onClick={() => setActiveOrderTab(status)}
                  >
                    {status === 'all' && 'Tất cả'}
                    {status === 'pending' && 'Chờ xử lý'}
                    {status === 'processing' && 'Đang chuẩn bị'}
                    {status === 'shipped' && 'Đang giao'}
                    {status === 'delivered' && 'Đã giao'}
                    {status === 'cancelled' && 'Đã hủy'}
                  </button>
                ))}
              </div>

              {/* Orders Table */}
              <div className="admin-table-card glass-card">
                <div className="responsive-table-box">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Mã đơn</th>
                        <th>Khách hàng</th>
                        <th>Số lượng</th>
                        <th>Tổng tiền</th>
                        <th>Trạng thái</th>
                        <th>Ngày tạo</th>
                        <th width="120" className="text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingOrders ? (
                        <tr>
                          <td colSpan="7" className="text-center py-12">
                            <div className="admin-loading-spinner"></div>
                            <span className="text-slate-400 mt-2 block">Đang tải đơn hàng...</span>
                          </td>
                        </tr>
                      ) : filteredOrders.map(o => (
                        <tr key={o.id}>
                          <td><strong>#{o.id}</strong></td>
                          <td>
                            <div className="user-info-cell">
                              <div className="user-avatar-circle">{o.user?.username ? o.user.username.slice(0,2).toUpperCase() : 'KH'}</div>
                              <div className="user-details-text">
                                <strong>{o.user?.username || 'Khách vãng lai'}</strong>
                                <span className="email-sub">{o.user?.email || 'N/A'}</span>
                              </div>
                            </div>
                          </td>
                          <td>{o.order_items ? o.order_items.reduce((sum, item) => sum + item.quantity, 0) : 0} máy</td>
                          <td><strong>{formatVND(o.total_price)}</strong></td>
                          <td>
                            <span className={`status-badge-indicator badge-${o.status}`}>
                              {o.status === 'pending' && 'Chờ xử lý'}
                              {o.status === 'processing' && 'Đang chuẩn bị'}
                              {o.status === 'shipped' && 'Đang giao'}
                              {o.status === 'delivered' && 'Đã giao'}
                              {o.status === 'cancelled' && 'Đã hủy'}
                            </span>
                          </td>
                          <td>{new Date(o.created_at).toLocaleDateString('vi-VN')}</td>
                          <td>
                            <div className="table-action-btns">
                              <button className="btn-secondary py-1 px-3 text-xs" onClick={() => { setSelectedOrder(o); setOrderSlideOverOpen(true); }}>
                                Chi tiết
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredOrders.length === 0 && !loadingOrders && (
                        <tr>
                          <td colSpan="7" className="text-center text-slate-400 py-12">Không tìm thấy đơn hàng nào.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* 4. PRODUCT ADD/EDIT SLIDE-OVER */}
      {prodSlideOverOpen && (
        <div className="slide-over-overlay" onClick={() => setProdSlideOverOpen(false)}>
          <div className="slide-over-content glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="slide-over-header">
              <h3>{editingProduct ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</h3>
              <button className="close-slide-over-btn" onClick={() => setProdSlideOverOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="slide-over-body flex flex-col gap-4">
              <div className="form-group">
                <label>Tên Laptop</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  required
                  placeholder="Dell XPS 15 9530..."
                />
              </div>

              <div className="form-group">
                <label>Giá bán ($)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })}
                  required
                  placeholder="2499"
                />
              </div>

              <div className="form-group">
                <label>Số lượng tồn kho</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={productForm.stock}
                  onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) || 0 })}
                  required
                  placeholder="10"
                />
              </div>

              <div className="form-group">
                <label>Mô tả chi tiết</label>
                <textarea 
                  className="form-input" 
                  style={{ minHeight: '100px', resize: 'vertical' }}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Chip Core i9, RAM 32GB, 1TB SSD..."
                />
              </div>

              <div className="form-group">
                <label>Trạng thái kinh doanh</label>
                <select 
                  className="form-input"
                  value={productForm.status}
                  onChange={(e) => setProductForm({ ...productForm, status: e.target.value })}
                >
                  <option value="active">Đang kinh doanh (Active)</option>
                  <option value="inactive">Ngừng kinh doanh (Inactive)</option>
                </select>
              </div>

              <div className="slide-over-footer-actions mt-4">
                <button type="submit" className="btn-glow flex-1">Lưu Lại</button>
                <button type="button" className="btn-secondary" onClick={() => setProdSlideOverOpen(false)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. ORDER DETAIL SLIDE-OVER */}
      {orderSlideOverOpen && selectedOrder && (
        <div className="slide-over-overlay" onClick={() => setOrderSlideOverOpen(false)}>
          <div className="slide-over-content glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="slide-over-header">
              <h3>Chi Tiết Đơn Hàng #{selectedOrder.id}</h3>
              <button className="close-slide-over-btn" onClick={() => setOrderSlideOverOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="slide-over-body flex flex-col gap-6">
              
              {/* Order Meta Info */}
              <div className="order-meta-info-card">
                <div className="info-row-desc">
                  <span>Khách hàng:</span>
                  <strong>{selectedOrder.user?.username || 'N/A'}</strong>
                </div>
                <div className="info-row-desc">
                  <span>Số điện thoại:</span>
                  <strong>{selectedOrder.phone_number || 'N/A'}</strong>
                </div>
                <div className="info-row-desc">
                  <span>Địa chỉ giao:</span>
                  <strong>{selectedOrder.shipping_address || 'N/A'}</strong>
                </div>
                <div className="info-row-desc">
                  <span>Ngày mua:</span>
                  <strong>{new Date(selectedOrder.created_at).toLocaleString('vi-VN')}</strong>
                </div>
              </div>

              {/* Order Status timeline changes */}
              <div className="order-status-update-box">
                <h4>Trạng thái hiện tại: </h4>
                <select 
                  value={selectedOrder.status}
                  onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value)}
                  className="form-input mt-2"
                >
                  <option value="pending">Chờ xử lý (Pending)</option>
                  <option value="processing">Đang chuẩn bị (Processing)</option>
                  <option value="shipped">Đang giao (Shipped)</option>
                  <option value="delivered">Đã giao (Delivered)</option>
                  <option value="cancelled">Đã hủy (Cancelled)</option>
                </select>
              </div>

              {/* Items List */}
              <div className="order-items-list-box">
                <h4>Sản phẩm đã chọn:</h4>
                <div className="order-items-scroll-list">
                  {selectedOrder.order_items?.map(item => (
                    <div key={item.id} className="order-item-row-card">
                      <img src="/src/assets/laptop_hero.png" alt={item.product?.name} />
                      <div className="item-details-box">
                        <h5>{item.product?.name || 'Sản phẩm đã bị xóa'}</h5>
                        <span>{item.quantity} x {formatVND(item.price_at_purchase)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <hr className="my-4" />
                <div className="total-price-box flex justify-between items-center text-lg font-bold">
                  <span>Tổng thanh toán:</span>
                  <span className="text-blue-600">{formatVND(selectedOrder.total_price)}</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 6. CONFIRM DELETE DIALOG */}
      {deleteConfirmProd && (
        <div className="dialog-overlay" onClick={() => setDeleteConfirmProd(null)}>
          <div className="dialog-box glass-card" onClick={(e) => e.stopPropagation()}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-red-500 mx-auto mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <h3>Xác nhận xóa sản phẩm</h3>
            <p className="body-text mb-6">Bạn có chắc chắn muốn xóa sản phẩm <strong>{deleteConfirmProd.name}</strong>? Thao tác này không thể hoàn tác.</p>
            <div className="dialog-actions">
              <button className="btn-glow bg-red-600 hover:bg-red-700" onClick={() => handleDeleteProduct(deleteConfirmProd.id)}>Xóa ngay</button>
              <button className="btn-secondary" onClick={() => setDeleteConfirmProd(null)}>Hủy bỏ</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
