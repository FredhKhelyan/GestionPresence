import { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { PencilIcon, TrashIcon, InformationCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const ClassTeacherManager = () => {
  const [associations, setAssociations] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedAssociation, setSelectedAssociation] = useState(null);
  const [formData, setFormData] = useState({ class_id: '', teacher_id: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Récupérer associations
        const assocResponse = await api.get('/api/listClassTeacher');
        console.log('Associations API response:', JSON.stringify(assocResponse.data, null, 2));
        setAssociations(Array.isArray(assocResponse.data) ? assocResponse.data : []);

        // Récupérer classes
        const classesResponse = await api.get('/api/listClasse');
        console.log('Classes API response:', JSON.stringify(classesResponse.data, null, 2));
        setClasses(Array.isArray(classesResponse.data) ? classesResponse.data : []);

        // Récupérer enseignants
        const teachersResponse = await api.get('/api/teacher');
        console.log('Teachers API response:', JSON.stringify(teachersResponse.data, null, 2));
        setTeachers(Array.isArray(teachersResponse.data) ? teachersResponse.data : []);
      } catch (error) {
        console.error('Fetch data error:', error);
        toast.error('Erreur lors du chargement des données', {
          position: 'top-right',
          autoClose: 3000,
          style: { backgroundColor: '#E74C3C', color: '#FFFFFF' },
          className: 'toast-success',
        });
        setAssociations([]);
        setClasses([]);
        setTeachers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const openModal = () => {
    setFormData({ class_id: '', teacher_id: '' });
    setErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setFormData({ class_id: '', teacher_id: '' });
    setErrors({});
  };

  const openDetailsModal = (association) => {
    setSelectedAssociation(association);
    setDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setDetailsModalOpen(false);
    setSelectedAssociation(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSearchChange = (e) => {
    setSearchId(e.target.value);
  };

  const handleSearch = async () => {
    if (!searchId || isNaN(searchId)) {
      toast.error('Veuillez entrer un ID valide', {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#E74C3C', color: '#FFFFFF' },
        className: 'toast-success',
      });
      return;
    }

    try {
      const response = await api.get(`/api/specialClassTeacher/${searchId}`);
      console.log('Search association response:', JSON.stringify(response.data, null, 2));
      setSelectedAssociation(response.data);
      setDetailsModalOpen(true);
    } catch (error) {
      console.error('Search association error:', error);
      if (error.response?.status === 403) {
        toast.error('Accès refusé : Administrateur uniquement', {
          position: 'top-right',
          autoClose: 3000,
          style: { backgroundColor: '#E74C3C', color: '#FFFFFF' },
          className: 'toast-success',
        });
      } else if (error.response?.status === 404) {
        toast.error('Association non trouvée', {
          position: 'top-right',
          autoClose: 3000,
          style: { backgroundColor: '#E74C3C', color: '#FFFFFF' },
          className: 'toast-success',
        });
      } else {
        toast.error('Erreur lors de la recherche', {
          position: 'top-right',
          autoClose: 3000,
          style: { backgroundColor: '#E74C3C', color: '#FFFFFF' },
          className: 'toast-success',
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/NewClassTeacher', formData);
      console.log('Create association response:', response.data);
      setAssociations([...associations, response.data]);
      toast.success('Association créée avec succès !', {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#27AE60', color: '#FFFFFF' },
        className: 'toast-success',
      });
      closeModal();
    } catch (error) {
      console.error('Create association error:', error);
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
        toast.error('Erreur lors de la création de l\'association', {
          position: 'top-right',
          autoClose: 3000,
          style: { backgroundColor: '#E74C3C', color: '#FFFFFF' },
          className: 'toast-success',
        });
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cette association ?')) {
      try {
        await api.delete(`/api/supprimerClassTeacher/${id}`);
        setAssociations(associations.filter((assoc) => assoc.id !== id));
        toast.success('Association supprimée !', {
          position: 'top-right',
          autoClose: 3000,
          style: { backgroundColor: '#27AE60', color: '#FFFFFF' },
          className: 'toast-success',
        });
      } catch (error) {
        console.error('Delete association error:', error);
        toast.error('Erreur lors de la suppression', {
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
          .search-container {
            display: flex;
            align-items: center;
            background: rgba(255, 255, 255, 0.95);
            border: 2px solid rgba(44, 62, 80, 0.2);
            border-radius: 12px;
            padding: 8px 16px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
          }
          .search-container:focus-within {
            border-color: rgba(39, 174, 96, 0.5);
            box-shadow: 0 4px 15px rgba(39, 174, 96, 0.2);
          }
          .search-input {
            flex: 1;
            background: transparent;
            border: none;
            font-family: 'Open Sans', sans-serif;
            font-size: 1rem;
            color: rgba(44, 62, 80, 0.9);
            outline: none;
          }
          .search-button {
            background: transparent;
            border: none;
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
          }
          .search-button:hover .search-icon {
            transform: scale(1.2);
          }
          .search-icon {
            width: 24px;
            height: 24px;
            color: rgba(44, 62, 80, 0.7);
            transition: transform 0.3s ease;
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
          <h1 className="text-4xl font-montserrat font-bold text-primary">Gestion des Cours</h1>
          <div className="flex items-center space-x-4">
            <div className="search-container">
              <input
                type="text"
                value={searchId}
                onChange={handleSearchChange}
                placeholder="Rechercher par ID..."
                className="search-input"
              />
              <button onClick={handleSearch} className="search-button">
                <MagnifyingGlassIcon className="search-icon" />
              </button>
            </div>
            <button
              onClick={openModal}
              className="relative bg-blue-950 text-white font-montserrat font-semibold text-lg py-3 px-6 rounded-xl"
            >
              Ajouter une Association
            </button>
          </div>
        </div>
        <div className="card bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl p-8 border border-primary/10">
          <h2 className="text-2xl font-montserrat font-bold text-primary/90 mb-6">Liste des Associations Classe-Enseignant</h2>
          {associations.length === 0 ? (
            <p className="text-lg font-opensans text-primary/70 text-center">Aucune association trouvée.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full border-collapse">
                <thead className="table-header">
                  <tr>
                    <th className="py-4 px-6 text-left text-lg">Classe</th>
                    <th className="py-4 px-6 text-left text-lg">Enseignant</th>
                    <th className="py-4 px-6 text-left text-lg">Email</th>
                    <th className="py-4 px-6 text-center text-lg">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {associations.map((assoc) => (
                    <motion.tr
                      key={assoc.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="table-row-hover border-b border-primary/10"
                    >
                      <td className="py-4 px-6 font-montserrat text-lg text-primary/90">{assoc.classe?.name || '-'}</td>
                      <td className="py-4 px-6 font-montserrat text-lg text-primary/90">{assoc.teacher?.name || '-'}</td>
                      <td className="py-4 px-6 font-opensans text-base text-primary/70">{assoc.teacher?.email || '-'}</td>
                      <td className="py-4 px-6 text-center space-x-4">
                        <button
                          onClick={() => openDetailsModal(assoc)}
                          className="relative bg-blue-950 text-white px-4 py-2 rounded-lg"
                        >
                          <InformationCircleIcon className="action-icon w-6 h-6" />
                        </button>
                        <button
                          onClick={() => handleDelete(assoc.id)}
                          className="relative bg-red-600 bg-alert text-white px-4 py-2 rounded-lg"
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

        {modalOpen && (
          <div className="modal">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="modal-content"
            >
              <h2 className="text-3xl font-montserrat font-bold text-primary mb-8">Ajouter une Association</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-6 relative">
                  <label className="block mb-2 font-montserrat text-lg font-semibold text-primary/90">Classe</label>
                  <select
                    name="class_id"
                    value={formData.class_id}
                    onChange={handleInputChange}
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
                <div className="mb-8 relative">
                  <label className="block mb-2 font-montserrat text-lg font-semibold text-primary/90">Enseignant</label>
                  <select
                    name="teacher_id"
                    value={formData.teacher_id}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 font-opensans text-lg bg-white/95 border-2 border-primary/20 rounded-xl focus:border-secondary focus:ring-4 focus:ring-secondary/30 transition-all duration-300 text-primary/90 shadow-md"
                    required
                  >
                    <option value="">Sélectionner un enseignant</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>{teacher.name} ({teacher.email})</option>
                    ))}
                  </select>
                  {errors.teacher_id && (
                    <p className="text-alert text-sm mt-2 font-opensans">{errors.teacher_id[0]}</p>
                  )}
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="relative bg-primary/20 text-primary font-montserrat font-semibold text-lg py-3 px-6 rounded-xl hover:bg-primary/30 hover:scale-105 transform transition-all duration-300 shine"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="relative bg-blue-950 text-white font-montserrat font-semibold text-lg py-3 px-6 rounded-xl hover:bg-blue-950/90 hover:scale-105 transform transition-all duration-300 shine"
                  >
                    Créer
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {detailsModalOpen && selectedAssociation && (
          <div className="modal">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="modal-content"
            >
              <h2 className="text-3xl font-montserrat font-bold text-primary mb-8">Détails de l'Association</h2>
              <div className="space-y-4">
                <p className="text-lg font-opensans text-primary/90">
                  <span className="font-montserrat font-semibold">ID :</span> {selectedAssociation.id || '-'}
                </p>
                <p className="text-lg font-opensans text-primary/90">
                  <span className="font-montserrat font-semibold">Classe :</span> {selectedAssociation.classe?.name || '-'}
                </p>
                <p className="text-lg font-opensans text-primary/90">
                  <span className="font-montserrat font-semibold">Enseignant :</span> {selectedAssociation.teacher?.name || '-'}
                </p>
                <p className="text-lg font-opensans text-primary/90">
                  <span className="font-montserrat font-semibold">Email :</span> {selectedAssociation.teacher?.email || '-'}
                </p>
                <p className="text-lg font-opensans text-primary/90">
                  <span className="font-montserrat font-semibold">Rôle :</span> {selectedAssociation.teacher?.role || '-'}
                </p>
              </div>
              <div className="flex justify-end mt-8">
                <button
                  onClick={closeDetailsModal}
                  className="relative bg-primary/20 text-primary font-montserrat font-semibold text-lg py-3 px-6 rounded-xl hover:bg-primary/30 hover:scale-105 transform transition-all duration-300 shine"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </>
  );
};

export default ClassTeacherManager;
