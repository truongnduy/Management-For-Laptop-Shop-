-- Tạm tắt kiểm tra khóa ngoại (Foreign Key) để bạn có thể insert dữ liệu trước khi tạo User
SET FOREIGN_KEY_CHECKS=0;

-- Dữ liệu mẫu cho bảng products (Laptops)
INSERT INTO `products` (`id`, `name`, `description`, `price`, `stock`, `status`, `created_at`, `updated_at`) VALUES
(1, 'MacBook Pro 16 M3 Max', 'Apple M3 Max chip, 36GB RAM, 1TB SSD, 16.2-inch Liquid Retina XDR display.', 3499.99, 10, 'active', NOW(), NOW()),
(2, 'Dell XPS 15 9530', 'Intel Core i9-13900H, 32GB RAM, 1TB SSD, NVIDIA RTX 4070, 15.6-inch OLED 3.5K.', 2499.00, 15, 'active', NOW(), NOW()),
(3, 'ASUS ROG Zephyrus G14', 'AMD Ryzen 9 7940HS, 16GB RAM, 512GB SSD, NVIDIA RTX 4060, 14-inch QHD+ 165Hz.', 1599.50, 8, 'active', NOW(), NOW()),
(4, 'Lenovo ThinkPad X1 Carbon Gen 11', 'Intel Core i7-1355U, 16GB RAM, 512GB SSD, 14-inch WUXGA.', 1899.00, 20, 'active', NOW(), NOW()),
(5, 'Razer Blade 16', 'Intel Core i9-14900HX, 32GB RAM, 2TB SSD, NVIDIA RTX 4090, 16-inch Dual Mode Mini-LED.', 4299.99, 5, 'active', NOW(), NOW()),
(6, 'Acer Swift 14', 'Intel Core Ultra 7 155H, 16GB RAM, 1TB SSD, 14-inch 2.8K OLED.', 1199.00, 25, 'active', NOW(), NOW()),
(7, 'HP Spectre x360 14', 'Intel Core i7-1355U, 16GB RAM, 1TB SSD, 13.5-inch WUXGA+ OLED Touch.', 1449.99, 12, 'active', NOW(), NOW());

-- Dữ liệu mẫu cho bảng carts (Giả định user_id 1 và 2 sẽ được bạn tạo sau)
INSERT INTO `carts` (`id`, `user_id`, `created_at`, `updated_at`) VALUES
(1, 1, NOW(), NOW()),
(2, 2, NOW(), NOW());

-- Dữ liệu mẫu cho bảng cart_items
INSERT INTO `cart_items` (`id`, `cart_id`, `product_id`, `quantity`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, NOW(), NOW()), -- User 1 có 1 MacBook Pro 16
(2, 1, 4, 2, NOW(), NOW()), -- User 1 có 2 Lenovo ThinkPad
(3, 2, 3, 1, NOW(), NOW()); -- User 2 có 1 ASUS ROG

-- Dữ liệu mẫu cho bảng orders (Lịch sử mua hàng)
INSERT INTO `orders` (`id`, `user_id`, `total_price`, `status`, `shipping_address`, `phone_number`, `created_at`, `updated_at`) VALUES
(1, 1, 3499.99, 'delivered', '123 Tech Street, Silicon Valley, CA', '0123456789', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2, 2, 2499.00, 'processing', '456 Gaming Ave, New York, NY', '0987654321', NOW(), NOW());

-- Dữ liệu mẫu cho bảng order_items (Chi tiết từng đơn hàng)
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `price_at_purchase`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, 3499.99, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY)),
(2, 2, 2, 1, 2499.00, NOW(), NOW());

-- Bật lại kiểm tra khóa ngoại
SET FOREIGN_KEY_CHECKS=1;
