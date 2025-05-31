import { useNavigate } from 'react-router-dom';
import { HomeIcon, UserGroupIcon, CalendarIcon, ChartBarIcon, CogIcon, ClipboardDocumentListIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

const Sidebar = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');

  const adminLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
    { name: 'Utilisateurs', path: '/dashboard/users', icon: UserGroupIcon },
    { name: 'Cours', path: '/dashboard/courses', icon: AcademicCapIcon },
    { name: 'Statistiques', path: '/dashboard/stats', icon: ChartBarIcon },
    { name: 'Paramètres', path: '/dashboard/settings', icon: CogIcon },
  ];

  const teacherLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
    { name: 'Présences', path: '/dashboard/attendances', icon: ClipboardDocumentListIcon },
    { name: 'Cours', path: '/dashboard/courses', icon: AcademicCapIcon },
    { name: 'Évaluations', path: '/dashboard/grades', icon: ChartBarIcon },
  ];

  const studentLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
    { name: 'Présences', path: '/dashboard/attendances', icon: ClipboardDocumentListIcon },
    { name: 'Cours', path: '/dashboard/courses', icon: AcademicCapIcon },
    { name: 'Notes', path: '/dashboard/grades', icon: ChartBarIcon },
  ];

  const links = role === 'admin' ? adminLinks : role === 'enseignant' ? teacherLinks : studentLinks;

  return (
    <div className="w-64 h-screen bg-blue-950 text-white fixed top-0 left-0 shadow-lg">
      <div className="p-6">
        <h2 className="text-2xl font-montserrat font-bold text-center">Université Connect</h2>
      </div>
      <nav className="mt-4">
        {links.map((link) => (
          <a
            key={link.name}
            href={link.path}
            className="flex items-center px-6 py-3 text-lg font-opensans hover:bg-secondary/20 transition-colors duration-300"
            onClick={(e) => {
              e.preventDefault();
              navigate(link.path);
            }}
          >
            <link.icon className="w-6 h-6 mr-3" />
            {link.name}
          </a>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
