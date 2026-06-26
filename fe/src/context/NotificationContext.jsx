import { createContext, useState, useContext, useCallback } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Hàm gọi thông báo
  const showNotification = useCallback((message, type = 'success', title = '') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type, title }]);
    
    // Tự động tắt sau 4 giây
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2">
        {notifications.map(notification => (
          <div 
            key={notification.id} 
            className={`min-w-[300px] p-4 rounded shadow-lg text-white transition-all transform animate-fade-in-down ${
              notification.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
            }`}
            style={{
              animation: 'slideIn 0.3s ease-out forwards'
            }}
          >
            {notification.title && <h4 className="font-bold text-lg mb-1">{notification.title}</h4>}
            <p>{notification.message}</p>
          </div>
        ))}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}} />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
