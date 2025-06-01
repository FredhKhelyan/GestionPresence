import { useState } from 'react';
import { HomeIcon, UserGroupIcon, CalendarIcon, ChartBarIcon, CogIcon, ClipboardDocumentListIcon, AcademicCapIcon, BookOpenIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ setActiveSection }) => {
  const navigate = useNavigate();
  const [activeLink, setActiveLink] = useState('dashboard');
  const role = localStorage.getItem('role');

  const adminLinks = [
    { name: 'Dashboard', section: 'dashboard', icon: HomeIcon },
    { name: 'Utilisateurs', section: 'users', icon: UserGroupIcon },
    { name: 'Classes', section: 'classes', icon: BookOpenIcon },
    { name: 'Cours', section: 'courses', icon: AcademicCapIcon },
    { name: 'Présences', section: 'stats', icon: ChartBarIcon },
    { name: 'Etudiants', section: 'students', icon: AcademicCapIcon },
  ];

  const teacherLinks = [
    { name: 'Dashboard', section: 'dashboard', icon: HomeIcon },
    { name: 'Présences', section: 'attendances', icon: ClipboardDocumentListIcon },
    { name: 'Cours', section: 'courses', icon: AcademicCapIcon },
    { name: 'Évaluations', section: 'grades', icon: ChartBarIcon },
  ];

  const studentLinks = [
    { name: 'Dashboard', section: 'dashboard', icon: HomeIcon },
    { name: 'Présences', section: 'attendances', icon: ClipboardDocumentListIcon },
    { name: 'Cours', section: 'courses', icon: AcademicCapIcon },
    { name: 'Notes', section: 'grades', icon: ChartBarIcon },
  ];

  const links = role === 'admin' ? adminLinks : role === 'enseignant' ? teacherLinks : studentLinks;

  const handleLinkClick = (section) => {
    setActiveLink(section);
    setActiveSection(section);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <>
      <style>
        {`
          .sidebar-link {
            transition: all 0.3s ease;
          }
          .sidebar-link:hover {
            background: rgba(39, 174, 96, 0.4);
            box-shadow: 0 10px 15px rgba(0, 0, 0, 0.2);
            transform: scale(1.05);
            border-radius: 0 16px 16px 0;
          }
          .sidebar-link-active {
            background: rgba(39, 174, 96, 0.6);
            box-shadow: inset 0 4px 6px rgba(0, 0, 0, 0.1);
            transform: scale(1);
            font-weight: bold;
            border-right: 4px solid #27AE60;
          }
          .sidebar-icon {
            width: 28px;
            height: 28px;
            margin-right: 16px;
            transition: transform 0.3s ease;
          }
          .sidebar-link:hover .sidebar-icon {
            animation: icon-bounce 0.3s ease;
          }
          .sidebar-icon-active {
            animation: pulse 1.5s infinite;
            transform: scale(1.1);
          }
          @keyframes icon-bounce {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.2); }
          }
          @keyframes pulse {
            0% { transform: scale(1.1); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1.1); }
          }
        `}
      </style>
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-64 h-screen bg-blue-950/95 backdrop-blur-md text-white fixed top-0 left-0 shadow-2xl z-20 border-r border-primary/20"
      >
        <div className="p-6 border-b border-primary/30">
          <h2 className="text-3xl font-montserrat font-bold text-center text-white">IUT Management</h2>
        </div>
        <nav className="mt-6 space-y-2 flex-1">
          {links.map((link) => (
            <motion.button
              key={link.section}
              onClick={() => handleLinkClick(link.section)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`sidebar-link flex items-center px-8 py-4 text-xl font-opensans text-white/90 w-full text-left ${
                activeLink === link.section ? 'sidebar-link-active' : ''
              }`}
            >
              <link.icon
                className={`sidebar-icon ${
                  activeLink === link.section ? 'sidebar-icon-active' : ''
                }`}
              />
              <span className="font-opensans font-medium">{link.name}</span>
            </motion.button>
          ))}
        </nav>
        <div className="p-4 border-t border-primary/30">
          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="sidebar-link flex items-center px-8 py-4 text-xl font-opensans text-white/90 w-full text-left hover:bg-alert/20"
          >
            <ArrowLeftOnRectangleIcon className="sidebar-icon" />
            <span className="font-opensans font-medium">Déconnexion</span>
          </motion.button>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
