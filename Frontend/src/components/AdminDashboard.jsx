import { useState, useEffect } from 'react';
import api from '../api/axios';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/api/users');
        setUsers(response.data);
      } catch (error) {
        // Erreur gérée par axios.js
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="space-y-8" data-aos="fade-up">
      <h1 className="text-3xl font-montserrat font-bold text-primary">Tableau de bord Admin</h1>
      <div className="card bg-white/90 backdrop-blur-md shadow-xl rounded-2xl p-6">
        <h2 className="text-2xl font-montserrat text-primary/90 mb-4">Utilisateurs</h2>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="font-opensans text-primary/90">Nom</th>
                <th className="font-opensans text-primary/90">Email</th>
                <th className="font-opensans text-primary/90">Rôle</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="font-opensans text-primary/80">{user.name}</td>
                  <td className="font-opensans text-primary/80">{user.email}</td>
                  <td className="font-opensans text-primary/80">{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
