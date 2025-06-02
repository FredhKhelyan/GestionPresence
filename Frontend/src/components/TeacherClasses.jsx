import { useEffect, useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';

const TeacherClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AOS.init({ duration: 1000 });

    const fetchClasses = async () => {
      try {
        const response = await api.get('/api/teacher/classes');
        setClasses(response.data);
      } catch (error) {
        console.error('Fetch classes error:', error.response?.data);
        toast.error(error.response?.data?.error || 'Erreur lors du chargement des classes');
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
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
      className="bg-white/80 backdrop-blur-md p-8 rounded-lg shadow-lg max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      data-aos="fade-up"
    >
      <h2 className="text-3xl font-montserrat font-bold text-[#2C3E50] mb-6">
        Mes Classes
      </h2>
      {classes.length === 0 ? (
        <p className="text-lg font-opensans text-[#2C3E50]">
          Aucune classe assignée.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-lg font-montserrat text-[#2C3E50]">
                  Nom
                </th>
                <th className="p-3 text-lg font-montserrat text-[#2C3E50]">
                  Nombre d’étudiants
                </th>
              </tr>
            </thead>
            <tbody>
              {classes.map(classe => (
                <tr key={classe.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-3 text-base font-opensans text-[#2C3E50]">
                    {classe.name}
                  </td>
                  <td className="p-3 text-base font-opensans text-[#2C3E50]">
                    {classe.students_count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default TeacherClasses;
