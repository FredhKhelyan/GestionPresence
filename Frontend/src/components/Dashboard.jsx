import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import AdminDashboard from './AdminDashboard';
import ClassesManager from './ClassesManager';
import UsersManager from './UsersManager';
import ClassTeacherManager from './ClassTeacherManager';
import StudentManager from './StudentManager';
import PresenceManager from './PresenceManager';
import TeacherDashboard from './TeacherDashboard';
import StudentDashboard from './StudentDashboard';
import ErrorBoundary from './ErrorBoundary';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const role = localStorage.getItem('role');

  useEffect(() => {
    if (!role) {
      navigate('/login');
    }
  }, [role, navigate]);

  const renderContent = () => {
    switch (role) {
      case 'admin':
        switch (activeSection) {
          case 'dashboard':
            return <AdminDashboard />;
          case 'users':
            return (
              <ErrorBoundary>
                <UsersManager />
              </ErrorBoundary>
            );
          case 'classes':
            return (
              <ErrorBoundary>
                <ClassesManager />
              </ErrorBoundary>
            );
          case 'courses':
            return (
              <ErrorBoundary>
                <ClassTeacherManager />
              </ErrorBoundary>
            );
          case 'students':
            return (
              <ErrorBoundary>
                <StudentManager />
              </ErrorBoundary>
            );
          case 'attendances':
            return (
              <ErrorBoundary>
                <PresenceManager />
              </ErrorBoundary>
            );
          case 'settings':
            return <div className="text-2xl font-montserrat text-primary">Section en développement</div>;
          default:
            return <div className="text-2xl font-montserrat text-primary">Section non trouvée</div>;
        }
      case 'enseignant':
        switch (activeSection) {
          case 'dashboard':
            return <TeacherDashboard />;
          case 'attendances':
          case 'courses':
          case 'grades':
            return <div className="text-2xl font-montserrat text-primary">Section en développement</div>;
          default:
            return <div className="text-2xl font-montserrat text-primary">Section non trouvée</div>;
        }
      case 'etudiant':
        switch (activeSection) {
          case 'dashboard':
            return <StudentDashboard />;
          case 'attendances':
          case 'courses':
          case 'grades':
            return <div className="text-2xl font-montserrat text-primary">Section en développement</div>;
          default:
            return <div className="text-2xl font-montserrat text-primary">Section non trouvée</div>;
        }
      default:
        return <div className="text-2xl font-montserrat text-primary">Rôle non reconnu</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-neutral relative overflow-hidden">
      <svg className="absolute inset-0 w-full h-full opacity-10" fill="none">
        <defs>
          <pattern id="academic-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <path
              d="M10 10h80v80H10zM20 20l10-10M30 10l10 10M40 10v80M50 10l10-10M60 10l10 10M70 20v70M20 80l70-70"
              stroke="#2C3E50"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#academic-pattern)" />
      </svg>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-neutral/50"></div>

      <Sidebar setActiveSection={setActiveSection} />
      <div className="flex-1 ml-64 mt-16 p-10 relative z-10">
        <Topbar />
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Dashboard;
