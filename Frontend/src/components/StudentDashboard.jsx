import { useEffect, useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';

const StudentDashboard = () => {
  const [student, setStudent] = useState(null);
//   const [classes, setClasses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    // class_id: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 1000 });

    const fetchProfile = async () => {
      try {
        const response = await api.get('api/student/MonProfil');
        setStudent(response.data);
      } catch (error) {
        if (error.response?.status === 404) {
          // Non inscrit, charger classes
        //   try {
        //     const classesResponse = await api.get('/classes');
        //     setClasses(classesResponse.data);
        //   } catch (err) {
        //     toast.error('Erreur lors du chargement des classes');
        //   }
        } else {
          toast.error('Erreur lors du chargement du profil');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await api.post('api/students/enroll', formData);
      setStudent(response.data);
      setShowForm(false);
      toast.success('Inscription réussie !');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors de l’inscription');
    } finally {
      setSubmitting(false);
    }
  };

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
      className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      data-aos="fade-up"
    >
      <h2 className="text-3xl font-montserrat font-bold text-[#2C3E50] mb-6">
        Mon Profil Étudiant
      </h2>
      {student ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <p className="text-lg font-opensans text-[#2C3E50]">
              <span className="font-bold">Nom :</span> {student.last_name}
            </p>
            <p className="text-lg font-opensans text-[#2C3E50]">
              <span className="font-bold">Prénom :</span> {student.first_name}
            </p>
            <p className="text-lg font-opensans text-[#2C3E50]">
              <span className="font-bold">Matricule :</span> {student.matricule}
            </p>
            <p className="text-lg font-opensans text-[#2C3E50]">
              <span className="font-bold">Classe :</span>{' '}
              {student.classe ? student.classe.name : 'Non assigné'}
            </p>
            <p className="text-lg font-opensans text-[#2C3E50]">
              <span className="font-bold">Email :</span> {student.user.email}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {!showForm ? (
            <motion.button
              onClick={() => setShowForm(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full p-3 rounded-lg bg-[#27AE60] text-white font-opensans font-medium"
              data-aos="fade-up"
            >
              Configurer mon espace étudiant
            </motion.button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-lg font-opensans text-[#2C3E50] mb-2">
                  Prénom
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg border border-[#2C3E50]/30 focus:ring-2 focus:ring-[#27AE60] focus:outline-none"
                  placeholder="Entrez votre prénom"
                  required
                />
              </div>
              <div>
                <label className="block text-lg font-opensans text-[#2C3E50] mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg border border-[#2C3E50]/30 focus:ring-2 focus:ring-[#27AE60] focus:outline-none"
                  placeholder="Entrez votre nom"
                  required
                />
              </div>
              {/* <div>
                <label className="block text-lg font-opensans text-[#2C3E50] mb-2">
                  Classe (optionnel)
                </label>
                <select
                  name="class_id"
                  value={formData.class_id}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg border border-[#2C3E50]/30 focus:ring-2 focus:ring-[#27AE60] focus:outline-none"
                >
                  <option value="">Sélectionnez une classe</option>
                  {classes.map((classe) => (
                    <option key={classe.id} value={classe.id}>
                      {classe.name}
                    </option>
                  ))}
                </select>
              </div> */}
              <div className="flex space-x-4">
                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex-1 p-3 rounded-lg text-white font-opensans font-medium ${
                    submitting ? 'bg-[#27AE60]/50' : 'bg-[#27AE60]'
                  }`}
                >
                  {submitting ? 'Inscription...' : 'S’inscrire'}
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => setShowForm(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 p-3 rounded-lg bg-[#E74C3C] text-white font-opensans font-medium"
                >
                  Annuler
                </motion.button>
              </div>
            </form>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default StudentDashboard;
