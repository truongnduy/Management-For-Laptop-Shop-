import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import './Login.css';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (isLogin) {
      try {
        const res = await api.login(username, password);
        if (res && res.token) {
          loginUser(res.user, res.token);
          if (res.user && res.user.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/');
          }
        } else {
          setErrorMsg(res.errors || 'Tên đăng nhập hoặc mật khẩu sai!');
        }
      } catch (err) {
        setErrorMsg('Lỗi kết nối máy chủ!');
      }
    } else {
      if (password !== confirmPassword) {
        setErrorMsg('Mật khẩu xác nhận không trùng khớp!');
        return;
      }
      try {
        const res = await api.register(username, email, password, confirmPassword);
        if (res && res.token) {
          loginUser(res.user, res.token);
          navigate('/');
        } else {
          setErrorMsg(Array.isArray(res.errors) ? res.errors.join(', ') : res.errors || 'Đăng ký thất bại!');
        }
      } catch (err) {
        setErrorMsg('Đăng ký xảy ra lỗi!');
      }
    }
  };

  return (
    <div className="login-page">
      <div className="login-card glass-card">
        <div className="tab-buttons">
          <button 
            className={`tab-btn ${isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(true); setErrorMsg(''); }}
          >
            Đăng Nhập
          </button>
          <button 
            className={`tab-btn ${!isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(false); setErrorMsg(''); }}
          >
            Đăng Ký
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Tên tài khoản (Username)</label>
            <input 
              className="form-input"
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              required 
              placeholder="Nhập tên tài khoản..."
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label>Địa chỉ Email</label>
              <input 
                className="form-input"
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                placeholder="example@gmail.com"
              />
            </div>
          )}

          <div className="form-group">
            <label>Mật khẩu</label>
            <input 
              className="form-input"
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              placeholder="Ít nhất 6 ký tự..."
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label>Nhập lại mật khẩu</label>
              <input 
                className="form-input"
                type="password" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                required 
                placeholder="Nhập giống mật khẩu trên..."
              />
            </div>
          )}

          {errorMsg && <div className="error-alert">{errorMsg}</div>}

          <button type="submit" className="btn-glow w-full mt-4">
            {isLogin ? 'Đăng Nhập' : 'Đăng Ký Tài Khoản'}
          </button>
        </form>
      </div>
    </div>
  );
}
