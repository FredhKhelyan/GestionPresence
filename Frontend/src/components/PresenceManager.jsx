import { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { TrashIcon, PlusIcon, PencilIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const PresenceManager = () => {
  const [presences, setPresences] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPresence, setSelectedPresence] = useState(null);
  const [formData, setFormData] = useState({ student_id: '', date: selectedDate, status: 'present' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Récupérer classes
        const classesResponse = await api.get('/api/listClasse');
        setClasses(Array.isArray(classesResponse.data) ? classesResponse.data : []);

        // Récupérer étudiants
        const studentsResponse = await api.get('/api/listStudent');
        setStudents(Array.isArray(studentsResponse.data) ? studentsResponse.data : []);

        // Récupérer présences
        await fetchPresences();
      } catch (error) {
        console.error('Fetch data error:', error);
        toast.error('Erreur lors du chargement des données', {
          position: 'top-right',
          autoClose: 3000,
          style: { backgroundColor: '#E74C3C', color: '#FFFFFF' },
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const fetchPresences = async () => {
    try {
      const params = {};
      if (selectedClass) params.class_id = selectedClass;
      if (selectedDate) params.date = selectedDate;
      const response = await api.get('/api/index', { params });
      setPresences(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Fetch presences error:', error);
      toast.error('Erreur lors du chargement des présences', {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#E74C3C', color: '#FFFFFF' },
      });
      setPresences([]);
    }
  };

  useEffect(() => {
    if (!loading) fetchPresences();
  }, [selectedClass, selectedDate]);

  const handleMarkPresence = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/store', formData);
      setPresences([...presences, response.data]);
      toast.success('Présence enregistrée avec succès !', {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#27AE60', color: '#FFFFFF' },
      });
      closeModal();
    } catch (error) {
      console.error('Mark presence error:', error);
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
      } else if (error.response?.status === 403) {
        toast.error('Accès refusé : Administrateur uniquement', {
          position: 'top-right',
          autoClose: 3000,
          style: { backgroundColor: '#E74C3C', color: '#FFFFFF' },
        });
      } else {
        toast.error('Erreur lors de l\'enregistrement', {
          position: 'top-right',
          autoClose: 3000,
          style: { backgroundColor: '#E74C3C', color: '#FFFFFF' },
        });
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/api/update/${selectedPresence.id}`, formData);
      setPresences(presences.map((p) => (p.id === selectedPresence.id ? response.data : p)));
      toast.success('Présence mise à jour avec succès !', {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#27AE60', color: '#FFFFFF' },
      });
      closeModal();
    } catch (error) {
      console.error('Update presence error:', error);
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
      } else if (error.response?.status === 403) {
        toast.error('Accès refusé : Administrateur uniquement', {
          position: 'top-right',
          autoClose: 3000,
          style: { backgroundColor: '#E74C3C', color: '#FFFFFF' },
        });
      } else {
        toast.error('Erreur lors de la mise à jour', {
          position: 'top-right',
          autoClose: 3000,
          style: { backgroundColor: '#E74C3C', color: '#FFFFFF' },
        });
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cette présence ?')) {
      try {
        await api.delete(`/api/destroy/${id}`);
        setPresences(presences.filter((p) => p.id !== id));
        toast.success('Présence supprimée !', {
          position: 'top-right',
          autoClose: 3000,
          style: { backgroundColor: '#27AE60', color: '#FFFFFF' },
        });
      } catch (error) {
        console.error('Delete presence error:', error);
        toast.error('Erreur lors de la suppression', {
          position: 'top-right',
          autoClose: 3000,
          style: { backgroundColor: '#E74C3C', color: '#FFFFFF' },
        });
      }
    }
  };

  const openModal = (presence = null) => {
    if (presence) {
      setIsEditing(true);
      setSelectedPresence(presence);
      setFormData({
        student_id: presence.student_id.toString(),
        date: presence.date,
        status: presence.status,
      });
    } else {
      setIsEditing(false);
      setFormData({ student_id: '', date: selectedDate, status: 'present' });
    }
    setErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setIsEditing(false);
    setSelectedPresence(null);
    setFormData({ student_id: '', date: selectedDate, status: 'present' });
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const filteredPresences = presences.filter((presence) => {
    const studentName = `${presence.student?.first_name || ''} ${presence.student?.last_name || ''}`.toLowerCase();
    const email = presence.student?.user?.email?.toLowerCase() || '';
    const className = presence.student?.classe?.name?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return studentName.includes(query) || email.includes(query) || className.includes(query);
  });

  const getClassStats = (classId) => {
    const classPresences = presences.filter((p) => p.student?.class_id === classId);
    const classStudents = students.filter((s) => s.class_id === classId);
    const totalStudents = classStudents.length;
    const totalPresent = classPresences.filter((p) => p.status === 'present').length;
    const totalAbsent = classPresences.filter((p) => p.status === 'absent').length;
    const ratio = totalStudents > 0 ? ((totalPresent / totalStudents) * 100).toFixed(1) : 0;

    return { totalStudents, totalPresent, totalAbsent, ratio };
  };

  const chartData = (classId) => {
    const stats = getClassStats(classId);
    return {
      labels: ['Présents', 'Absents'],
      datasets: [
        {
          data: [stats.totalPresent, stats.totalAbsent],
          backgroundColor: ['#27AE60', '#E74C3C'],
          borderColor: ['#2C3E50', '#2C3E50'],
          borderWidth: 1,
        },
      ],
    };
  };

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
          .modal {
            position: fixed;
            inset: 0;
            background: rgba(44, 62, 80, 0.5);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 50;
          }
          .modal-content {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(16px);
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            padding: 32px;
            width: 100%;
            max-width: 600px;
            border: 2px solid rgba(39, 174, 96, 0.2);
          }
          .modal-content:hover {
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
          }
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
          .action-icon {
            transition: transform 0.3s ease;
          }
          .action-icon:hover {
            transform: scale(1.2);
          }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 0.875rem;
            font-weight: 500;
            font-family: 'Open Sans', sans-serif;
          }
          .status-present {
            background: rgba(39, 174, 96, 0.2);
            color: #27AE60;
          }
          .status-absent {
            background: rgba(231, 76, 60, 0.2);
            color: #E74C3C;
          }
          .stats-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(16px);
            border-radius: 12px;
            border: 1px solid rgba(44, 62, 80, 0.1);
            transition: all 0.3s ease;
          }
          .stats-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
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
          <h1 className="text-4xl font-montserrat font-bold text-primary">Gestion des Présences</h1>
          <button
            onClick={() => openModal()}
            className="relative bg-blue-950 text-white px-6 py-3 rounded-lg hover:bg-secondary/80 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
          >
            <PlusIcon className="w-6 h-6" />
            <span className="font-montserrat">Marquer Présence</span>
          </button>
        </div>

        {/* Filtres et Recherche */}
        <div className="card bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl p-6 border border-primary/10">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block mb-2 font-montserrat text-lg font-semibold text-primary/90">Classe</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-4 py-3 font-opensans text-lg bg-white/95 border-2 border-primary/20 rounded-xl focus:border-secondary focus:ring-4 focus:ring-secondary/30 transition-all duration-300 text-primary/90"
              >
                <option value="">Toutes les classes</option>
                {classes.map((classe) => (
                  <option key={classe.id} value={classe.id}>{classe.name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block mb-2 font-montserrat text-lg font-semibold text-primary/90">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 font-opensans text-lg bg-white/95 border-2 border-primary/20 rounded-xl focus:border-secondary focus:ring-4 focus:ring-secondary/30 transition-all duration-300 text-primary/90"
              />
            </div>
            <div className="flex-1">
              <label className="block mb-2 font-montserrat text-lg font-semibold text-primary/90">Recherche</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nom, email, classe..."
                className="w-full px-4 py-3 font-opensans text-lg bg-white/95 border-2 border-primary/20 rounded-xl focus:border-secondary focus:ring-4 focus:ring-secondary/30 transition-all duration-300 text-primary/90"
              />
            </div>
          </div>
        </div>

        {/* Stats par Classe */}
        {selectedClass && (
          <div className="card bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl p-6 border border-primary/10">
            <h2 className="text-2xl font-montserrat font-bold text-primary/90 mb-6">
              Statistiques - {classes.find((c) => c.id === parseInt(selectedClass))?.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {['totalStudents', 'totalPresent', 'totalAbsent', 'ratio'].map((key, idx) => {
                const stats = getClassStats(parseInt(selectedClass));
                const labels = {
                  totalStudents: 'Total Étudiants',
                  totalPresent: 'Présents',
                  totalAbsent: 'Absents',
                  ratio: 'Taux Présence',
                };
                const value = key === 'ratio' ? `${stats[key]}%` : stats[key];
                return (
                  <div key={key} className="stats-card p-4 text-center">
                    <p className="text-lg font-montserrat font-semibold text-primary/90">{labels[key]}</p>
                    <p className="text-3xl font-montserrat font-bold text-secondary">{value}</p>
                  </div>
                );
              })}
            </div>
            <div className="w-48 mx-auto">
              <Doughnut
                data={chartData(parseInt(selectedClass))}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'top' },
                    tooltip: { enabled: true },
                  },
                }}
              />
            </div>
          </div>
        )}

        {/* Liste Présences */}
        <div className="card bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl p-8 border border-primary/10">
          <h2 className="text-2xl font-montserrat font-bold text-primary/90 mb-6">Liste des Présences</h2>
          {filteredPresences.length === 0 ? (
            <p className="text-lg font-opensans text-primary/70 text-center">Aucune présence trouvée.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full border-collapse">
                <thead className="table-header">
                  <tr>
                    <th className="py-4 px-6 text-left text-lg">Étudiant</th>
                    <th className="py-4 px-6 text-left text-lg">Email</th>
                    <th className="py-4 px-6 text-left text-lg">Classe</th>
                    <th className="py-4 px-6 text-left text-lg">Date</th>
                    <th className="py-4 px-6 text-left text-lg">Statut</th>
                    <th className="py-4 px-6 text-center text-lg">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPresences.map((presence) => (
                    <motion.tr
                      key={presence.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="table-row-hover border-b border-primary/10"
                    >
                      <td className="py-4 px-6 font-montserrat text-lg text-primary/90">
                        {presence.student?.first_name} {presence.student?.last_name}
                      </td>
                      <td className="py-4 px-6 font-opensans text-base text-primary/70">
                        {presence.student?.user?.email || '-'}
                      </td>
                      <td className="py-4 px-6 font-montserrat text-lg text-primary/90">
                        {presence.student?.classe?.name || '-'}
                      </td>
                      <td className="py-4 px-6 font-montserrat text-lg text-primary/90">
                        {new Date(presence.date).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`status-badge ${
                            presence.status === 'present' ? 'status-present' : 'status-absent'
                          }`}
                        >
                          {presence.status === 'present' ? 'Présent' : 'Absent'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center space-x-4">
                        <button
                          onClick={() => openModal(presence)}
                          className="relative bg-blue-950 text-white px-4 py-2 rounded-lg hover:bg-secondary/80 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                        >
                          <PencilIcon className="action-icon w-6 h-6" />
                        </button>
                        <button
                          onClick={() => handleDelete(presence.id)}
                          className="relative bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-alert/80 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                        >
                          <TrashIcon className="action-icon w-6 h-6" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Marquage/Mise à jour Présence */}
        {modalOpen && (
          <div className="modal">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="modal-content"
            >
              <h2 className="text-3xl font-montserrat font-bold text-primary mb-8">
                {isEditing ? 'Modifier la Présence' : 'Marquer une Présence'}
              </h2>
              <form onSubmit={isEditing ? handleUpdate : handleMarkPresence}>
                <div className="mb-6">
                  <label className="block mb-2 font-montserrat text-lg font-semibold text-primary/90">Étudiant</label>
                  <select
                    name="student_id"
                    value={formData.student_id}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 font-opensans text-lg bg-white/95 border-2 border-primary/20 rounded-xl focus:border-secondary focus:ring-4 focus:ring-secondary/30 transition-all duration-300 text-primary/90"
                    required
                  >
                    <option value="">Sélectionner un étudiant</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.first_name} {student.last_name} ({student.user?.email})
                      </option>
                    ))}
                  </select>
                  {errors.student_id && (
                    <p className="text-alert text-sm mt-2 font-opensans">{errors.student_id[0]}</p>
                  )}
                </div>
                <div className="mb-6">
                  <label className="block mb-2 font-montserrat text-lg font-semibold text-primary/90">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 font-opensans text-lg bg-white/95 border-2 border-primary/20 rounded-xl focus:border-secondary focus:ring-4 focus:ring-secondary/30 transition-all duration-300 text-primary/90"
                    required
                  />
                  {errors.date && (
                    <p className="text-alert text-sm mt-2 font-opensans">{errors.date[0]}</p>
                  )}
                </div>
                <div className="mb-8">
                  <label className="block mb-2 font-montserrat text-lg font-semibold text-primary/90">Statut</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 font-opensans text-lg bg-white/95 border-2 border-primary/20 rounded-xl focus:border-secondary focus:ring-4 focus:ring-secondary/30 transition-all duration-300 text-primary/90"
                    required
                  >
                    <option value="present">Présent</option>
                    <option value="absent">Absent</option>
                  </select>
                  {errors.status && (
                    <p className="text-alert text-sm mt-2 font-opensans">{errors.status[0]}</p>
                  )}
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="relative bg-primary/20 text-primary font-montserrat font-semibold text-lg py-3 px-6 rounded-xl hover:bg-primary/30 hover:scale-105 transform transition-all duration-300"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="relative bg-blue-950 text-white font-montserrat font-semibold text-lg py-3 px-6 rounded-xl hover:bg-secondary/80 hover:scale-105 transform transition-all duration-300"
                  >
                    {isEditing ? 'Mettre à jour' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </motion.div>
    </>
  );
};

export default PresenceManager;
