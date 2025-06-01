import { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { PencilIcon, TrashIcon, PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const ClassesManager = () => {
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentClass, setCurrentClass] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await api.get('/api/listClasse');
        const classesData = response.data;
        setClasses(classesData);
        setFilteredClasses(classesData);
      } catch (error) {
        if (error.response?.status === 403) {
          toast.error('Accès refusé : Administrateur uniquement', {
            position: 'top-right',
            autoClose: 3000,
            style: { backgroundColor: '#E74C3C', color: '#FFFFFF' },
            className: 'toast-success',
          });
        }
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    const filterClasses = async () => {
      if (!searchQuery) {
        setFilteredClasses(classes);
        return;
      }

      const filtered = classes.filter((classe) =>
        classe.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

      const updatedClasses = await Promise.all(
        filtered.map(async (classe) => {
          try {
            const response = await api.get(`/api/SpecialClasse/${classe.id}`);
            return response.data;
          } catch (error) {
            if (error.response?.status === 403) {
              toast.error('Accès refusé : Administrateur uniquement', {
                position: 'top-right',
                autoClose: 3000,
                style: { backgroundColor: '#E74C3C', color: '#FFFFFF' },
                className: 'toast-success',
              });
            }
            return classe;
          }
        })
      );

      setFilteredClasses(updatedClasses);
    };

    filterClasses();
  }, [searchQuery, classes]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const openModal = (classe = null) => {
    setIsEditing(!!classe);
    setCurrentClass(classe);
    setFormData(classe ? { name: classe.name, description: classe.description || '' } : { name: '', description: '' });
    setErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentClass(null);
    setFormData({ name: '', description: '' });
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing && currentClass) {
        const response = await api.put(`/api/MAJClasse/${currentClass.id}`, formData);
        setClasses(classes.map((c) => (c.id === currentClass.id ? response.data : c)));
        setFilteredClasses(filteredClasses.map((c) => (c.id === currentClass.id ? response.data : c)));
        toast.success('Classe mise à jour !', {
          position: 'top-right',
          autoClose: 3000,
          style: { backgroundColor: '#27AE60', color: '#FFFFFF' },
          className: 'toast-success',
        });
      } else {
        const response = await api.post('/api/NewClasse', formData);
        setClasses([...classes, response.data]);
        setFilteredClasses([...filteredClasses, response.data]);
        toast.success('Classe créée !', {
          position: 'top-right',
          autoClose: 3000,
          style: { backgroundColor: '#27AE60', color: '#FFFFFF' },
          className: 'toast-success',
        });
      }
      closeModal();
    } catch (error) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors);
      } else if (error.response?.status === 403) {
        toast.error('Accès refusé : Administrateur uniquement', {
          position: 'top-right',
          autoClose: 3000,
          style: { backgroundColor: '#E74C3C', color: '#FFFFFF' },
          className: 'toast-success',
        });
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cette classe ?')) {
      try {
        await api.delete(`/api/SupprimerClasse/${id}`);
        setClasses(classes.filter((c) => c.id !== id));
        setFilteredClasses(filteredClasses.filter((c) => c.id !== id));
        toast.success('Classe supprimée !', {
          position: 'top-right',
          autoClose: 3000,
          style: { backgroundColor: '#27AE60', color: '#FFFFFF' },
          className: 'toast-success',
        });
      } catch (error) {
        if (error.response?.status === 403) {
          toast.error('Accès refusé : Administrateur uniquement', {
            position: 'top-right',
            autoClose: 3000,
            style: { backgroundColor: '#E74C3C', color: '#FFFFFF' },
            className: 'toast-success',
          });
        }
      }
    }
  };

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
            transform: translateY(0);
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
            transform: scale(1);
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
          .search-input {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(8px);
            border: 2px solid rgba(44, 62, 80, 0.2);
            border-radius: 12px;
            padding: 12px 16px 12px 40px;
            font-size: 18px;
            color: rgba(44, 62, 80, 0.9);
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .search-input:focus {
            border-color: #27AE60;
            box-shadow: 0 0 0 4px rgba(39, 174, 96, 0.3);
          }
          .search-button {
            background: #2C3E50;
            transition: all 0.3s ease;
          }
          .search-button:hover {
            background: #1A252F;
            transform: scale(1.05);
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
          }
          .search-icon {
            transition: transform 0.3s ease;
          }
          .search-button:hover .search-icon {
            transform: scale(1.2);
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
          <h1 className="text-4xl font-montserrat font-bold text-primary">Gestion des Classes</h1>
          <button
            onClick={() => openModal()}
            className="relative bg-blue-950 to-primary text-white font-montserrat font-semibold text-lg py-3 px-8 rounded-xl shadow-2xl hover:shadow-3xl hover:scale-110 transform transition-all duration-300 flex items-center space-x-2 animate-pulse"
          >
            <PlusIcon className="w-6 h-6" />
            <span>Ajouter une Classe</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 text-primary/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Rechercher une classe..."
              className="search-input w-full"
            />
          </div>
          <button
            className="search-button text-white font-montserrat font-semibold text-lg py-3 px-6 rounded-xl shadow-md hover:shadow-lg"
          >
            <MagnifyingGlassIcon className="search-icon w-6 h-6" />
          </button>
        </div>

        <div className="card bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl p-8 border border-primary/10">
          <h2 className="text-2xl font-montserrat font-bold text-primary/90 mb-6">Liste des Classes</h2>
          <div className="overflow-x-auto">
            <table className="table w-full border-collapse">
              <thead className="table-header">
                <tr>
                  <th className="py-4 px-6 text-left text-lg">Nom</th>
                  <th className="py-4 px-6 text-left text-lg">Description</th>
                  <th className="py-4 px-6 text-center text-lg">Étudiants</th>
                  <th className="py-4 px-6 text-center text-lg">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClasses.map((classe) => (
                  <motion.tr
                    key={classe.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="table-row-hover border-b border-primary/10"
                  >
                    <td className="py-4 px-6 font-montserrat text-lg text-primary/90">{classe.name}</td>
                    <td className="py-4 px-6 font-opensans text-base text-primary/70">{classe.description || '-'}</td>
                    <td className="py-4 px-6 text-center font-opensans text-base text-primary/90">{classe.students_count}</td>
                    <td className="py-4 px-6 text-center space-x-4">
                      <button
                        onClick={() => openModal(classe)}
                        className="relative bg-blue-950 text-white px-4 py-2 rounded-lg shadow-md"
                      >
                        <PencilIcon className="action-icon w-6 h-6" />
                      </button>
                      <button
                        onClick={() => handleDelete(classe.id)}
                        className="relative bg-alert text-white px-4 py-2 rounded-lg bg-red-600"
                      >
                        <TrashIcon className="action-icon w-6 h-6" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
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
                {isEditing ? 'Modifier la Classe' : 'Ajouter une Classe'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-6 relative">
                  <label className="block mb-2 font-montserrat text-lg font-semibold text-primary/90">
                    Nom
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 font-opensans text-lg bg-white/95 border-2 border-primary/20 rounded-xl focus:border-secondary focus:ring-4 focus:ring-secondary/30 transition-all duration-300 placeholder-primary/40 text-primary/90 shadow-md"
                    placeholder="Nom de la classe"
                    required
                  />
                  {errors.name && (
                    <p className="text-alert text-sm mt-2 font-opensans">{errors.name[0]}</p>
                  )}
                </div>
                <div className="mb-8 relative">
                  <label className="block mb-2 font-montserrat text-lg font-semibold text-primary/90">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 font-opensans text-lg bg-white/95 border-2 border-primary/20 rounded-xl focus:border-secondary focus:ring-4 focus:ring-secondary/30 transition-all duration-300 placeholder-primary/40 text-primary/90 shadow-md"
                    placeholder="Description (optionnel)"
                    rows="4"
                  />
                  {errors.description && (
                    <p className="text-alert text-sm mt-2 font-opensans">{errors.description[0]}</p>
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
                    {isEditing ? 'Mettre à jour' : 'Créer'}
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

export default ClassesManager;
