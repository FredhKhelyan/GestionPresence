import { useNavigate } from 'react-router-dom';
import { UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const Topbar = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    toast.success('Déconnexion réussie !', {
      position: 'top-right',
      autoClose: 3000,
      style: { backgroundColor: '#27AE60', color: '#FFFFFF' },
      className: 'toast-success',
    });
    navigate('/login');
  };

  return (
    <div className="bg-white/90 backdrop-blur-md shadow-md h-16 flex items-center justify-between px-6 fixed top-0 left-64 right-0 z-10">
      <div className="font-montserrat text-xl text-primary/90">
        {role === 'admin' ? 'Administration' : role === 'enseignant' ? 'Enseignant' : 'Étudiant'}
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <UserCircleIcon className="w-8 h-8 text-primary/60" />
          <span className="font-opensans text-primary/90">{role}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 text-primary/60 hover:text-secondary transition-colors duration-300"
        >
          <ArrowRightOnRectangleIcon className="w-6 h-6" />
          <span className="font-opensans">Déconnexion</span>
        </button>
      </div>
    </div>
  );
};

export default Topbar;
