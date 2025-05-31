import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import AdminDashboard from './AdminDashboard';
import TeacherDashboard from './TeacherDashboard';
import StudentDashboard from './StudentDashboard';

const Dashboard = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');

  useEffect(() => {
    if (!role) {
      navigate('/login');
    }
  }, [role, navigate]);

  return (
    <div className="flex min-h-screen bg-neutral relative overflow-hidden">
      {/* SVG Background */}
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
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-neutral/50"></div>

      <Sidebar />
      <div className="flex-1 ml-64 mt-16 p-8 relative z-10">
        <Topbar />
        {role === 'admin' && <AdminDashboard />}
        {role === 'enseignant' && <TeacherDashboard />}
        {role === 'etudiant' && <StudentDashboard />}
      </div>
    </div>
  );
};

export default Dashboard;
