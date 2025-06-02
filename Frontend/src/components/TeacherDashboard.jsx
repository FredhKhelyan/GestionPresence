import { useEffect, useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TeacherDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AOS.init({ duration: 1000 });

    const fetchData = async () => {
      try {
        const [profileResponse, statsResponse] = await Promise.all([
          api.get('/api/teacher/profile'),
          api.get('/api/teacher/stats'), // Corrigé de /getStats à /stats
        ]);
        setProfile(profileResponse.data);
        setStats(statsResponse.data);
      } catch (error) {
        console.error('Fetch error:', error.response?.data || error.message); // Amélioré
        toast.error(error.response?.data?.error || 'Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <motion.div
        className="text-center text-2xl font-montserrat text-[#2C3E50]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Chargement...
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-lg max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      data-aos="fade-up"
    >
      <h2 className="text-3xl font-montserrat font-bold text-[#2C3E50] mb-6">
        Tableau de Bord Enseignant
      </h2>
      {profile && (
        <div className="mb-6 p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-xl font-montserrat font-semibold text-[#2C3E50] mb-4">
            Profil
          </h3>
          <p className="text-lg font-opensans text-[#2C3E50]">
            <span className="font-bold">Nom :</span> {profile.name}
          </p>
          <p className="text-lg font-opensans text-[#2C3E50]">
            <span className="font-bold">Email :</span> {profile.email}
          </p>
          <p className="text-lg font-opensans text-[#2C3E50]">
            <span className="font-bold">Rôle :</span> {profile.role}
          </p>
        </div>
      )}
      {stats && (
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-xl font-montserrat font-semibold text-[#2C3E50] mb-4">
            Statistiques des Présences
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-[#27AE60]/10 rounded-lg">
              <p className="text-lg font-opensans text-[#2C3E50]">
                <span className="font-bold">Présences :</span> {stats.present}
              </p>
            </div>
            <div className="p-4 bg-[#E74C3C]/10 rounded-lg">
              <p className="text-lg font-opensans text-[#2C3E50]">
                <span className="font-bold">Absences :</span> {stats.absent}
              </p>
            </div>
            <div className="p-4 bg-[#2C3E50]/20 rounded-lg">
              <p className="text-lg font-opensans text-[#2C3E50]">
                <span className="font-bold">Taux de présence :</span> {stats.presence_rate}%
              </p>
            </div>
          </div>
          {stats.by_class.length > 0 && (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.by_class}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="class_name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="presence_rate" name="Taux de présence (%)" fill="#27AE60" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default TeacherDashboard;
