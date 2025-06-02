import { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';

const TeacherAttendances = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [presences, setPresences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 1000 });

    const fetchClasses = async () => {
      try {
        const response = await api.get('/api/teacher/getClasses');
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

  const fetchStudents = async (classId) => {
    try {
      const response = await api.get(`/api/classes/${classId}/students`);
      setStudents(response.data);
      setPresences(response.data.map(student => ({
        student_id: student.id,
        status: 'present',
      })));
    } catch (error) {
      console.error('Fetch students error:', error.response?.data);
      toast.error('Erreur lors du chargement des étudiants');
    }
  };

  const handleClassChange = (e) => {
    const classId = e.target.value;
    setSelectedClass(classId);
    if (classId) {
      fetchStudents(classId);
    } else {
      setStudents([]);
      setPresences([]);
    }
  };

  const handlePresenceChange = (studentId, status) => {
    setPresences(prev =>
      prev.map(p =>
        p.student_id === studentId ? { ...p, status } : p
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      for (const presence of presences) {
        await api.post('/api/store', {
          student_id: presence.student_id,
          date,
          status: presence.status,
        });
      }
      toast.success('Présences enregistrées !');
      setStudents([]);
      setPresences([]);
      setSelectedClass('');
    } catch (error) {
      console.error('Submit error:', error.response?.data);
      toast.error(error.response?.data?.error || 'Erreur lors de l’enregistrement');
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
      className="bg-white/80 backdrop-blur-md p-8 rounded-lg shadow-lg max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      data-aos="fade-up"
    >
      <h2 className="text-3xl font-montserrat font-bold text-[#2C3E50] mb-6">
        Gestion des Présences
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-lg font-montserrat text-[#2C3E50] mb-2">
            Classe
          </label>
          <select
            value={selectedClass}
            onChange={handleClassChange}
            className="w-full p-3 rounded-lg border border-[#2C3E50]/20 focus:ring-2 focus:ring-[#27AE60] text-gray-800"
            aria-label="Sélectionner une classe"
          >
            <option value="">Sélectionnez une classe</option>
            {classes.map(classe => (
              <option key={classe.id} value={classe.id}>
                {classe.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-lg font-montserrat text-[#2C3E50] mb-2">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full p-3 rounded-lg border border-[#2C3E50]/20 focus:ring-2 focus:ring-[#27AE60] text-gray-800"
            aria-required="true"
          />
        </div>
        {students.length > 0 && (
          <div>
            <h3 className="text-lg font-montserrat font-semibold text-[#2C3E50] mb-3">
              Étudiants
            </h3>
            <div className="space-y-3">
              {students.map(student => (
                <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <span className="text-base font-opensans text-[#2C3E50]">
                    {student.first_name} {student.last_name}
                  </span>
                  <select
                    value={presences.find(p => p.student_id === student.id)?.status || 'present'}
                    onChange={e => handlePresenceChange(student.id, e.target.value)}
                    className="p-2 rounded-lg border border-[#2C3E50]/20 focus:ring-2 focus:ring-[#27AE60] text-gray-800"
                    aria-label={`Statut de présence pour ${student.first_name} ${student.last_name}`}
                  >
                    <option value="present">Présent</option>
                    <option value="absent">Absent</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}
        <motion.button
          type="submit"
          disabled={submitting || !selectedClass || students.length === 0}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`w-full p-3 rounded-lg text-white font-montserrat font-semibold ${
            submitting || !selectedClass || students.length === 0 ? 'bg-gray-400' : 'bg-[#27AE60]'
          }`}
          aria-label="Enregistrer les présences"
        >
          {submitting ? 'Enregistrement...' : 'Enregistrer'}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default TeacherAttendances;

