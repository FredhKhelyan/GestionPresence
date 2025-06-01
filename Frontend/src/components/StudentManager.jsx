import { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { PencilIcon, TrashIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const StudentManager = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [users, setUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({ user_id: '', class_id: '', first_name: '', last_name: '' });
  const [assignData, setAssignData] = useState({ class_id: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Récupérer étudiants
        const studentsResponse = await api.get('/api/listStudent');
        console.log('Students API response:', JSON.stringify(studentsResponse.data, null, 2));
        setStudents(Array.isArray(studentsResponse.data) ? studentsResponse.data : []);

        // Récupérer classes
        const classesResponse = await api.get('/api/listClasse');
        console.log('Classes API response:', JSON.stringify(classesResponse.data, null, 2));
        setClasses(Array.isArray(classesResponse.data) ? classesResponse.data : []);

        // Récupérer utilisateurs (étudiants)
        const usersResponse = await api.get('/api/user?role=etudiant');
        console.log('Users API response:', JSON.stringify(usersResponse.data, null, 2));
        setUsers(Array.isArray(usersResponse.data) ? usersResponse.data : []);
      } catch (error) {
        console.error('Fetch data error:', error);
        toast.error('Erreur lors du chargement des données', {
          position: 'top-right',
          autoClose: 3000,
          style: { backgroundColor: '#E74C3C', color: '#FFFFFF' },
          className: 'toast-success',
        });
        setStudents([]);
        setClasses([]);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const openEditModal = (student) => {
    setSelectedStudent(student);
    setFormData({
      user_id: student.user_id || '',
      class_id: student.class_id || '',
      first_name: student.first_name || '',
      last_name: student.last_name || '',
    });
    setErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedStudent(null);
    setFormData({ user_id: '', class_id: '', first_name: '', last_name: '' });
    setErrors({});
  };

  const openDetailsModal = (student) => {
    setSelectedStudent(student);
    setDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setDetailsModalOpen(false);
    setSelectedStudent(null);
  };

  const openAssignModal = (student) => {
    setSelectedStudent(student);
    setAssignData({ class_id: student.class_id || '' });
    setErrors({});
    setAssignModalOpen(true);
  };

  const closeAssignModal = () => {
    setAssignModalOpen(false);
    setSelectedStudent(null);
    setAssignData({ class_id: '' });
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAssignInputChange = (e) => {
    setAssignData({ class_id: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/api/updateStudent/${selectedStudent.id}`, formData);
      console.log('Update student response:', response.data);
      setStudents(students.map((s) => (s.id === selectedStudent.id ? response.data : s)));
      toast.success('Étudiant mis à jour avec succès !', {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#27AE60', color: '#FFFFFF' },
        className: 'toast-success',
      });
      closeModal();
    } catch (error) {
      console.error('Update student error:', error);
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
      } else if (error.response?.status === 403) {
        toast.error('Accès refusé : Administrateur uniquement', {
          position: 'top-right',
          autoClose: 3000,
          style: { backgroundColor: '#E74C3C', color: '#FFFFFF' },
          className: 'toast-success',
        });
      } else {
        toast.error('Erreur lors de la mise à jour', {
          position: 'top-right',
          autoClose: 3000,
          style: { backgroundColor: '#E74C3C', color: '#FFFFFF' },
          className: 'toast-success',
        });
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cet étudiant ?')) {
      try {
        await api.delete(`/api/supprimerStudent/${id}`);
        setStudents(students.filter((s) => s.id !== id));
        toast.success('Étudiant supprimé !', {
          position: 'top-right',
          autoClose: 3000,
          style: { backgroundColor: '#27AE60', color: '#FFFFFF' },
          className: 'toast-success',
        });
      } catch (error) {
        console.error('Delete student error:', error);
        toast.error('Erreur lors de la suppression', {
          position: 'top-right',
          autoClose: 3000,
          style: { backgroundColor: '#E74C3C', color: '#FFFFFF' },
          className: 'toast-success',
        });
      }
    }
  };

  const handleAssignClass = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(`/api/assignClass/${selectedStudent.id}/assign-class`, assignData);
      console.log('Assign class response:', response.data);
      setStudents(students.map((s) => (s.id === selectedStudent.id ? response.data : s)));
      toast.success('Classe assignée avec succès !', {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#27AE60', color: '#FFFFFF' },
        className: 'toast-success',
      });
      closeAssignModal();
    } catch (error) {
      console.error('Assign class error:', error);
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
      } else if (error.response?.status === 403) {
        toast.error('Accès refusé : Administrateur uniquement', {
          position: 'top-right',
          autoClose: 3000,
          style: { backgroundColor: '#E74C3C', color: '#FFFFFF' },
          className: 'toast-success',
        });
      } else {
        toast.error('Erreur lors de l\'assignation', {
          position: 'top-right',
          autoClose: 3000,
          style: { backgroundColor: '#E74C3C', color: '#FFFFFF' },
          className: 'toast-success',
        });
      }
    }
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
            transition: all 0.3s ease;
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
          .shine::after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(
              90deg,
              transparent,
              rgba(255, 255, 255, 0.4),
              transparent
            );
            transition: 0.5s;
          }
          .shine:hover::after {
            left: 100%;
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
          .status-assigned {
            background: rgba(39, 174, 96, 0.2);
            color: #27AE60;
          }
          .status-unassigned {
            background: rgba(231, 76, 60, 0.2);
            color: #E74C3C;
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
          <h1 className="text-4xl font-montserrat font-bold text-primary">Gestion des Étudiants</h1>
        </div>
        <div className="card bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl p-8 border border-primary/10">
          <h2 className="text-2xl font-montserrat font-bold text-primary/90 mb-6">Liste des Étudiants</h2>
          {students.length === 0 ? (
            <p className="text-lg font-opensans text-primary/70 text-center">Aucun étudiant trouvé.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full border-collapse">
                <thead className="table-header">
                  <tr>
                    <th className="py-4 px-6 text-left text-lg">Prénom</th>
                    <th className="py-4 px-6 text-left text-lg">Nom</th>
                    <th className="py-4 px-6 text-left text-lg">Email</th>
                    <th className="py-4 px-6 text-left text-lg">Classe</th>
                    <th className="py-4 px-6 text-left text-lg">État</th>
                    <th className="py-4 px-6 text-center text-lg">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <motion.tr
                      key={student.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="table-row-hover border-b border-primary/10"
                    >
                      <td className="py-4 px-6 font-montserrat text-lg text-primary/90">{student.first_name || '-'}</td>
                      <td className="py-4 px-6 font-montserrat text-lg text-primary/90">{student.last_name || '-'}</td>
                      <td className="py-4 px-6 font-opensans text-base text-primary/70">{student.user?.email || '-'}</td>
                      <td className="py-4 px-6 font-montserrat text-lg text-primary/90">{student.classe?.name || '-'}</td>
                      <td className="py-4 px-6">
                        <span
                          className={`status-badge ${
                            student.class_id ? 'status-assigned' : 'status-unassigned'
                          }`}
                        >
                          {student.class_id ? 'Assigné' : 'Non assigné'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center space-x-4">
                        <button
                          onClick={() => openDetailsModal(student)}
                          className="relative bg-blue-950 text-white px-4 py-2 rounded-lg"
                        >
                          <InformationCircleIcon className="action-icon w-6 h-6" />
                        </button>
                        <button
                          onClick={() => openEditModal(student)}
                          className="relative bg-blue-600 text-white px-4 py-2 rounded-lg"
                        >
                          <PencilIcon className="action-icon w-6 h-6" />
                        </button>
                        <button
                          onClick={() => handleDelete(student.id)}
                          className="relative bg-red-600 text-white px-4 py-2 rounded-lg"
                        >
                          <TrashIcon className="action-icon w-6 h-6" />
                        </button>
                        <button
                          onClick={() => openAssignModal(student)}
                          className="relative bg-yellow-500 text-white px-4 py-2 rounded-lg"
                        >
                          <span className="font-opensans text-sm">Assigner</span>
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {modalOpen && (
          <div className="modal">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="modal-content"
            >
              <h2 className="text-3xl font-montserrat font-bold text-primary mb-8">Modifier l'Étudiant</h2>
              <form onSubmit={handleUpdate}>
                <div className="mb-6 relative">
                  <label className="block mb-2 font-montserrat text-lg font-semibold text-primary/90">Utilisateur</label>
                  <select
                    name="user_id"
                    value={formData.user_id}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 font-opensans text-lg bg-white/95 border-2 border-primary/20 rounded-xl focus:border-secondary focus:ring-4 focus:ring-secondary/30 transition-all duration-300 text-primary/90 shadow-md"
                    required
                  >
                    <option value="">Sélectionner un utilisateur</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                  {errors.user_id && (
                    <p className="text-alert text-sm mt-2 font-opensans">{errors.user_id[0]}</p>
                  )}
                </div>
                <div className="mb-6 relative">
                  <label className="block mb-2 font-montserrat text-lg font-semibold text-primary/90">Classe</label>
                  <select
                    name="class_id"
                    value={formData.class_id}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 font-opensans text-lg bg-white/95 border-2 border-primary/20 rounded-xl focus:border-secondary focus:ring-4 focus:ring-secondary/30 transition-all duration-300 text-primary/90 shadow-md"
                  >
                    <option value="">Aucune classe</option>
                    {classes.map((classe) => (
                      <option key={classe.id} value={classe.id}>{classe.name}</option>
                    ))}
                  </select>
                  {errors.class_id && (
                    <p className="text-alert text-sm mt-2 font-opensans">{errors.class_id[0]}</p>
                  )}
                </div>
                <div className="mb-6 relative">
                  <label className="block mb-2 font-montserrat text-lg font-semibold text-primary/90">Prénom</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 font-opensans text-lg bg-white/95 border-2 border-primary/20 rounded-xl focus:border-secondary focus:ring-4 focus:ring-secondary/30 transition-all duration-300 text-primary/90 shadow-md"
                    required
                  />
                  {errors.first_name && (
                    <p className="text-alert text-sm mt-2 font-opensans">{errors.first_name[0]}</p>
                  )}
                </div>
                <div className="mb-8 relative">
                  <label className="block mb-2 font-montserrat text-lg font-semibold text-primary/90">Nom</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 font-opensans text-lg bg-white/95 border-2 border-primary/20 rounded-xl focus:border-secondary focus:ring-4 focus:ring-secondary/30 transition-all duration-300 text-primary/90 shadow-md"
                    required
                  />
                  {errors.last_name && (
                    <p className="text-alert text-sm mt-2 font-opensans">{errors.last_name[0]}</p>
                  )}
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="relative bg-primary/20 text-primary font-montserrat font-semibold text-lg py-3 px-6 rounded-xl"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="relative bg-blue-950 text-white font-montserrat font-semibold text-lg py-3 px-6 rounded-xl"
                  >
                    Mettre à jour
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {detailsModalOpen && selectedStudent && (
          <div className="modal">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="modal-content"
            >
              <h2 className="text-3xl font-montserrat font-bold text-primary mb-8">Détails de l'Étudiant</h2>
              <div className="space-y-4">
                <p className="text-lg font-opensans text-primary/90">
                  <span className="font-montserrat font-semibold">Prénom :</span> {selectedStudent.first_name || '-'}
                </p>
                <p className="text-lg font-opensans text-primary/90">
                  <span className="font-montserrat font-semibold">Nom :</span> {selectedStudent.last_name || '-'}
                </p>
                <p className="text-lg font-opensans text-primary/90">
                  <span className="font-montserrat font-semibold">Email :</span> {selectedStudent.user?.email || '-'}
                </p>
                <p className="text-lg font-opensans text-primary/90">
                  <span className="font-montserrat font-semibold">Classe :</span> {selectedStudent.classe?.name || '-'}
                </p>
                <p className="text-lg font-opensans text-primary/90">
                  <span className="font-montserrat font-semibold">État :</span>{' '}
                  {selectedStudent.class_id ? 'Assigné' : 'Non assigné'}
                </p>
              </div>
              <div className="flex justify-end mt-8">
                <button
                  onClick={closeDetailsModal}
                  className="relative bg-primary/20 text-primary font-montserrat font-semibold text-lg py-3 px-6 rounded-xl hover:bg-primary/30"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {assignModalOpen && selectedStudent && (
          <div className="modal">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="modal-content"
            >
              <h2 className="text-3xl font-montserrat font-bold text-primary mb-8">Assigner une Classe</h2>
              <form onSubmit={handleAssignClass}>
                <div className="mb-8 relative">
                  <label className="block mb-2 font-montserrat text-lg font-semibold text-primary/90">Classe</label>
                  <select
                    name="class_id"
                    value={assignData.class_id}
                    onChange={handleAssignInputChange}
                    className="w-full px-4 py-3 font-opensans text-lg bg-white/95 border-2 border-primary/20 rounded-xl focus:border-secondary focus:ring-4 focus:ring-secondary/30 transition-all duration-300 text-primary/90 shadow-md"
                    required
                  >
                    <option value="">Sélectionner une classe</option>
                    {classes.map((classe) => (
                      <option key={classe.id} value={classe.id}>{classe.name}</option>
                    ))}
                  </select>
                  {errors.class_id && (
                    <p className="text-alert text-sm mt-2 font-opensans">{errors.class_id[0]}</p>
                  )}
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={closeAssignModal}
                    className="relative bg-primary/20 text-primary font-montserrat font-semibold text-lg py-3 px-6 rounded-xl "
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="relative bg-blue-950 text-white font-montserrat font-semibold text-lg py-3 px-6 rounded-xl"
                  >
                    Assigner
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

export default StudentManager;
