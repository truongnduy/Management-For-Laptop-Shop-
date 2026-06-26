import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import ProductCard from '../../components/ProductCard/ProductCard';
import './Home.css';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.getProducts(1, 4); // Lấy 4 sản phẩm đầu tiên
        if (res && res.products) {
          setFeatured(res.products);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="home-container">
      {/* Banner chào đón */}
      <section className="hero">
        <div className="hero-info">
          <h1 className="hero-title">
            MỞ KHÓA <br />
            <span className="text-gradient">HIỆU NĂNG TỐI ĐA</span>
          </h1>
          <p className="hero-text">
            Tìm kiếm những dòng Laptop thế hệ mới với bộ vi xử lý cực khủng. Hoàn hảo cho tác vụ Gaming, Lập trình và Đồ họa.
          </p>
          <Link to="/products" className="btn-glow">Mua Ngay</Link>
        </div>
        <div className="hero-graphic">
          <img src="/src/assets/laptop_hero.png" alt="Laptop Graphic" className="laptop-graphic-img" />
          <div className="glow-radial"></div>
        </div>
      </section>

      {/* Grid sản phẩm nổi bật */}
      <section className="featured">
        <div className="section-title-row">
          <h2>MÁY TÍNH NỔI BẬT</h2>
          <Link to="/products" className="link-all">Tất cả sản phẩm →</Link>
        </div>

        {loading ? (
          <div className="loader">Đang tải máy tính cấu hình mạnh...</div>
        ) : (
          <div className="featured-grid">
            {featured.map(prod => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
