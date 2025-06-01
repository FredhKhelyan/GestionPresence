import { useEffect, useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StudentAttendances = () => {
  const [presences, setPresences] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    AOS.init({ duration: 1000 });

    const fetchPresences = async () => {
      try {
        const response = await api.get('api/myPresences');
        console.log('API Response:', response.data); // Debug

        // Gérer les deux formats de réponse
        let presencesData = Array.isArray(response.data) ? response.data : response.data.presences || [];
        let statsData = response.data.stats || null;

        // Calculer stats si absentes
        if (!statsData && presencesData.length > 0) {
          const total = presencesData.length;
          const present = presencesData.filter(p => p.status === 'present').length;
          const absent = total - present;
          statsData = {
            total,
            present,
            absent,
            presence_rate: total > 0 ? ((present / total) * 100).toFixed(2) : 0,
            monthly: Object.values(
              presencesData.reduce((acc, presence) => {
                const month = new Date(presence.date).toISOString().slice(0, 7); // YYYY-MM
                if (!acc[month]) {
                  acc[month] = { month, present: 0, absent: 0, total: 0 };
                }
                acc[month].total += 1;
                if (presence.status === 'present') acc[month].present += 1;
                else acc[month].absent += 1;
                acc[month].presence_rate = acc[month].total > 0
                  ? ((acc[month].present / acc[month].total) * 100).toFixed(2)
                  : 0;
                return acc;
              }, {})
            ),
          };
        }

        setPresences(presencesData);
        setStats(statsData);
      } catch (error) {
        console.error('Fetch error:', error.response); // Debug
        const errorMsg = error.response?.data?.error || 'Erreur lors du chargement des présences';
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    fetchPresences();
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

  if (error) {
    return (
      <motion.div
        className="text-center text-2xl font-montserrat text-[#E74C3C]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {error}
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      data-aos="fade-up"
    >
      <h2 className="text-3xl font-montserrat font-bold text-[#2C3E50] mb-6">
        Mes Présences
      </h2>
      {stats && (
        <div className="mb-8">
          <h3 className="text-xl font-montserrat font-semibold text-[#2C3E50] mb-4">
            Statistiques d’assiduité
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
            <div className="p-4 bg-[#2C3E50]/10 rounded-lg">
              <p className="text-lg font-opensans text-[#2C3E50]">
                <span className="font-bold">Taux de présence :</span> {stats.presence_rate}%
              </p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.monthly || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="presence_rate" name="Taux de présence (%)" stroke="#27AE60" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      <div>
        <h3 className="text-xl font-montserrat font-semibold text-[#2C3E50] mb-4">
          Historique des présences
        </h3>
        {Array.isArray(presences) && presences.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg">
              <thead>
                <tr className="bg-[#2C3E50] text-white">
                  <th className="py-3 px-4 text-left font-opensans">Date</th>
                  {/* <th className="py-3 px-4 text-left font-opensans">Cours</th> */}
                  <th className="py-3 px-4 text-left font-opensans">Statut</th>
                </tr>
              </thead>
              <tbody>
                {presences.map((presence) => (
                  <tr key={presence.id} className="border-b">
                    <td className="py-3 px-4 font-opensans text-[#2C3E50]">
                      {new Date(presence.date).toLocaleDateString('fr-FR')}
                    </td>
                    {/* <td className="py-3 px-4 font-opensans text-[#2C3E50]">
                      {presence.course?.name || 'N/A'}
                    </td> */}
                    <td className="py-3 px-4 font-opensans">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm ${
                          presence.status === 'present'
                            ? 'bg-[#27AE60] text-white'
                            : 'bg-[#E74C3C] text-white'
                        }`}
                      >
                        {presence.status === 'present' ? 'Présent' : 'Absent'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-lg font-opensans text-[#2C3E50]">
            Aucune présence enregistrée.
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default StudentAttendances;
