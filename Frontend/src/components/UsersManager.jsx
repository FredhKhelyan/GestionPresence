import { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const UsersManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/user');
        console.log('Users API response:', JSON.stringify(response.data, null, 2));
        if (Array.isArray(response.data)) {
          setUsers(response.data);
        } else {
          console.error('Unexpected response format:', response.data);
          toast.error('Erreur de format des données : Réponse non sous forme de liste', {
            position: 'top-right',
            autoClose: 3000,
            style: { backgroundColor: '#E74C3C', color: '#FFFFFF' },
            className: 'toast-success',
          });
          // Temporaire : Si objet, le convertir en tableau
          if (response.data && typeof response.data === 'object') {
            setUsers([response.data]);
          } else {
            setUsers([]);
          }
        }
      } catch (error) {
        console.error('Fetch users error:', error);
        if (error.response?.status === 403) {
          toast.error('Accès refusé : Administrateur uniquement', {
            position: 'top-right',
            autoClose: 3000,
            style: { backgroundColor: '#E74C3C', color: '#FFFFFF' },
            className: 'toast-success',
          });
        } else {
          toast.error('Erreur lors du chargement des utilisateurs', {
            position: 'top-right',
            autoClose: 3000,
            style: { backgroundColor: '#E74C3C', color: '#FFFFFF' },
            className: 'toast-success',
          });
        }
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="text-center p-8">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-secondary border-r-transparent"></div>
        <p className="text-lg font-montserrat text-primary mt-4">Chargement...</p>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          .table-header {
            background: rgba(44, 62, 80, 0.2);
            color: rgba(44, 62, 80, 0.9);
            font-family: 'Montserrat', sans-serif;
            font-weight: 600;
          }
          .table-row-hover:hover {
            background: rgba(39, 174, 96, 0.1);
            transition: all 0.2s ease;
          }
        `}
      </style>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-montserrat font-bold text-primary">Gestion des Utilisateurs</h1>
        </div>
        <div className="card bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl p-8 border border-primary/10">
          <h2 className="text-2xl font-montserrat font-bold text-primary/90 mb-6">Liste des Utilisateurs</h2>
          {users.length === 0 ? (
            <p className="text-lg font-opensans text-primary/70 text-center">Aucun utilisateur trouvé.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full border-collapse">
                <thead className="table-header">
                  <tr>
                    <th className="py-4 px-6 text-left text-lg">ID</th>
                    <th className="py-4 px-6 text-left text-lg">Nom</th>
                    <th className="py-4 px-6 text-left text-lg">Email</th>
                    <th className="py-4 px-6 text-left text-lg">Rôle</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="table-row-hover border-b border-primary/10"
                    >
                      <td className="py-4 px-6 font-montserrat text-lg text-primary/90">{user.id}</td>
                      <td className="py-4 px-6 font-montserrat text-lg text-primary/90">{user.name || '-'}</td>
                      <td className="py-4 px-6 font-opensans text-base text-primary/70">{user.email || '-'}</td>
                      <td className="py-4 px-6 font-opensans text-base text-primary/90">{user.role || '-'}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default UsersManager;
