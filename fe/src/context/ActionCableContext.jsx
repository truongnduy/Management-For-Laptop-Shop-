import { useEffect } from 'react';
import { createConsumer } from '@rails/actioncable';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

export const useActionCable = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();

  useEffect(() => {
    // Chỉ kết nối nếu đã đăng nhập
    if (!user) return;

    const token = localStorage.getItem('token');
    
    // Khởi tạo kết nối tới đường dẫn /cable của Backend
    const consumer = createConsumer(`ws://localhost:3000/cable?token=${token}`);

    // Subscribe (Đăng ký) lắng nghe NotificationChannel
    const subscription = consumer.subscriptions.create(
      { channel: "NotificationChannel" },
      {
        connected() {
          console.log("Đã kết nối WebSockets!");
        },
        disconnected() {
          console.log("Đã ngắt kết nối!");
        },
        received(data) {
          // Hiển thị Toast notification
          console.log("Nhận được thông báo real-time: ", data);
          showNotification(data.message, data.type, data.title);
        }
      }
    );

    // Cleanup khi component unmount hoặc user đăng xuất
    return () => {
      subscription.unsubscribe();
      consumer.disconnect();
    };
  }, [user, showNotification]); 
};

export const ActionCableListener = () => {
  useActionCable();
  return null; // Component này không render gì cả, chỉ chạy ngầm
};
