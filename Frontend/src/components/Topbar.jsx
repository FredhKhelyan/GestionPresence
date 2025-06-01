import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { UserCircleIcon, BellIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const Topbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    // Récupérer utilisateur
    const fetchUser = async () => {
      try {
        const response = await api.get('/api/actor');
        setUser(response.data);
      } catch (error) {
        // Géré par axios.js
      }
    };

    // Récupérer notifications
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/api/notifications');
        setNotifications(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Fetch notifications error:', error);
        toast.error('Erreur lors du chargement des notifications', {
          position: 'top-right',
          autoClose: 3000,
          style: { backgroundColor: '#E74C3C', color: '#FFFFFF' },
          className: 'toast-success',
        });
      }
    };

    fetchUser();
    fetchNotifications();

    // Polling notifications toutes les 30s
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setUser(null);
    toast.success('Déconnexion réussie !', {
      position: 'top-right',
      autoClose: 3000,
      style: { backgroundColor: '#27AE60', color: '#FFFFFF' },
      className: 'toast-success',
    });
    navigate('/login');
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.post(`/api/notifications/${id}/read`);
      setNotifications(notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      ));
      toast.success('Notification marquée comme lue', {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#27AE60', color: '#FFFFFF' },
        className: 'toast-success',
      });
    } catch (error) {
      console.error('Mark as read error:', error);
      toast.error('Erreur lors de la mise à jour', {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#E74C3C', color: '#FFFFFF' },
        className: 'toast-success',
      });
    }
  };

  const unreadCount = notifications.filter((notif) => !notif.read).length;
  const role = user?.role || localStorage.getItem('role') || 'Utilisateur';
  const displayName = user?.name || role;

  return (
    <>
      <style>
        {`
          .notification-dropdown {
            position: absolute;
            top: 64px;
            right: 16px;
            width: 320px;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(16px);
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(44, 62, 80, 0.1);
            z-index: 50;
            max-height: 400px;
            overflow-y: auto;
          }
          .notification-item {
            padding: 12px 16px;
            border-bottom: 1px solid rgba(44, 62, 80, 0.1);
            transition: all 0.3s ease;
            cursor: pointer;
          }
          .notification-item:hover {
            background: rgba(39, 174, 96, 0.1);
          }
          .notification-item.unread {
            background: rgba(231, 76, 60, 0.05);
          }
          .badge {
            position: absolute;
            top: -4px;
            right: -4px;
            background: #E74C3C;
            color: white;
            border-radius: 50%;
            width: 18px;
            height: 18px;
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .profile-dropdown {
            position: absolute;
            top: 64px;
            right: 80px;
            width: 200px;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(16px);
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(44, 62, 80, 0.1);
            z-index: 50;
          }
          .profile-item {
            padding: 12px 16px;
            border-bottom: 1px solid rgba(44, 62, 80, 0.1);
            transition: all 0.3s ease;
            cursor: pointer;
          }
          .profile-item:hover {
            background: rgba(39, 174, 96, 0.1);
          }
        `}
      </style>
      <div className="bg-white/90 backdrop-blur-md shadow-md h-16 flex items-center justify-between px-6 fixed top-0 left-64 right-0 z-10">
        <div className="font-montserrat text-xl text-primary/90">
          {role === 'admin' ? 'Administration' : role === 'enseignant' ? 'Enseignant' : 'Étudiant'}
        </div>
        <div className="flex items-center space-x-6">
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative flex items-center space-x-2 text-primary/60 hover:text-secondary hover:bg-blue-950/10 rounded-lg px-3 py-2 transition-all duration-300 shine"
            >
              <BellIcon className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="badge">{unreadCount}</span>
              )}
            </button>
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="notification-dropdown"
                >
                  {notifications.length === 0 ? (
                    <div className="notification-item text-center font-opensans text-primary/70">
                      Aucune notification
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                        className={`notification-item ${notif.read ? '' : 'unread'}`}
                      >
                        <p className="font-opensans text-sm text-primary/90">{notif.message}</p>
                        <p className="font-opensans text-xs text-primary/50">
                          {new Date(notif.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="relative flex items-center space-x-2">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 text-primary/60 hover:text-secondary hover:bg-blue-950/10 rounded-lg px-3 py-2 transition-all duration-300 shine"
            >
              <UserCircleIcon className="w-8 h-8" />
              <span className="font-opensans text-primary/90">{displayName}</span>
            </button>
            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="profile-dropdown"
                >
                  <div
                    onClick={handleLogout}
                    className="profile-item flex items-center space-x-2"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5 text-primary/60" />
                    <span className="font-opensans text-primary/90">Déconnexion</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
};

export default Topbar;
