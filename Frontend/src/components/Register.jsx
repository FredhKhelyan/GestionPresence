import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { UserIcon, EnvelopeIcon, LockClosedIcon, IdentificationIcon } from '@heroicons/react/24/outline';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('etudiant');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/register', {
        name,
        email,
        password,
        role,
      });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.user.role);
      toast.success('Inscription réussie !', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'light',
        style: { backgroundColor: '#27AE60', color: '#FFFFFF' },
        className: 'toast-success',
      });
      navigate('/dashboard');
    } catch (error) {
      // Erreur gérée par l'intercepteur axios
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral relative overflow-hidden">
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
      {/* Effet gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-neutral/50"></div>

      <div
        className="card w-full max-w-lg bg-white/90 backdrop-blur-md shadow-xl rounded-2xl transform hover:scale-105 hover:shadow-2xl transition-all duration-500 relative z-10"
        data-aos="fade-up"
      >
        {/* Header */}
        <div className="bg-primary/10 rounded-t-2xl p-6 text-center border-b border-secondary/20 bg-blue-950">
          <h1 className="text-4xl font-montserrat font-bold text-primary text-white">
            Université Connect
          </h1>
          <p className="text-sm font-opensans text-primary/70 mt-1 text-white">
            Gestion de présence numérique
          </p>
        </div>
        {/* Body */}
        <div className="card-body p-10">
          <form onSubmit={handleSubmit}>
            <div className="form-control mb-6" data-aos="fade-up" data-aos-delay="100">
              <label className="label">
                <span className="label-text font-opensans text-primary/90 text-xl">Nom complet</span>
              </label>
              <div className="relative group">
                <IdentificationIcon className="absolute w-6 h-6 text-primary/60 left-4 top-1/2 transform -translate-y-1/2 group-focus-within:text-secondary group-focus-within:animate-icon-bounce" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input w-full pl-14 pr-4 py-4 font-opensans bg-white/50 border-2 border-primary/20 rounded-lg focus:border-secondary focus:ring-4 focus:ring-secondary/30 transition-all duration-300 placeholder-primary/40 text-primary/90 text-lg"
                  placeholder="Dexter Nkamta"
                  required
                />
              </div>
            </div>
            <div className="form-control mb-6" data-aos="fade-up" data-aos-delay="200">
              <label className="label">
                <span className="label-text font-opensans text-primary/90 text-xl">Email</span>
              </label>
              <div className="relative group">
                <EnvelopeIcon className="absolute w-6 h-6 text-primary/60 left-4 top-1/2 transform -translate-y-1/2 group-focus-within:text-secondary group-focus-within:animate-icon-bounce" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input w-full pl-14 pr-4 py-4 font-opensans bg-white/50 border-2 border-primary/20 rounded-lg focus:border-secondary focus:ring-4 focus:ring-secondary/30 transition-all duration-300 placeholder-primary/40 text-primary/90 text-lg"
                  placeholder="votre.email@universite.com"
                  required
                />
              </div>
            </div>
            <div className="form-control mb-6" data-aos="fade-up" data-aos-delay="300">
              <label className="label">
                <span className="label-text font-opensans text-primary/90 text-xl">Mot de passe</span>
              </label>
              <div className="relative group">
                <LockClosedIcon className="absolute w-6 h-6 text-primary/60 left-4 top-1/2 transform -translate-y-1/2 group-focus-within:text-secondary group-focus-within:animate-icon-bounce" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input w-full pl-14 pr-4 py-4 font-opensans bg-white/50 border-2 border-primary/20 rounded-lg focus:border-secondary focus:ring-4 focus:ring-secondary/30 transition-all duration-300 placeholder-primary/40 text-primary/90 text-lg"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            <div className="form-control mb-10" data-aos="fade-up" data-aos-delay="400">
              <label className="label">
                <span className="label-text font-opensans text-primary/90 text-xl">Rôle</span>
              </label>
              <div className="relative group">
                <UserIcon className="absolute w-6 h-6 text-primary/60 left-4 top-1/2 transform -translate-y-1/2 group-focus-within:text-secondary group-focus-within:animate-icon-bounce" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="select w-full pl-14 pr-4 py-4 font-opensans bg-white/50 border-2 border-primary/20 rounded-lg focus:border-secondary focus:ring-4 focus:ring-secondary/30 transition-all duration-300 text-primary/90 text-lg"
                >
                  <option value="etudiant">Étudiant</option>
                  <option value="enseignant">Enseignant</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
            </div>
            <div className="form-control" data-aos="fade-up" data-aos-delay="500">
              <button
                type="submit"
                className="btn w-full bg-secondary text-white font-montserrat font-semibold text-xl py-4 rounded-lg shadow-2xl hover:bg-secondary/90 hover:scale-110 transform transition-all duration-300 relative overflow-hidden shine bg-blue-950"
              >
                S'inscrire
              </button>
            </div>
          </form>
          <p className="text-center mt-8 font-opensans text-primary/70 text-sm">
            Déjà inscrit ?{' '}
            <a href="/login" className="text-secondary font-semibold hover:underline transition-colors duration-300">
              Se connecter
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
