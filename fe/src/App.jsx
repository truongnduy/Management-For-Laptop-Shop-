import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Products from './pages/Products/Products';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import Cart from './pages/Cart/Cart';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';

import { NotificationProvider } from './context/NotificationContext';
import { ActionCableListener } from './context/ActionCableContext';

function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <CartProvider>
          <ActionCableListener />
          <Router>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </Router>
        </CartProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;
