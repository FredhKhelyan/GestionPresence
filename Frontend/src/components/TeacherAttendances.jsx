import { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

const TeacherAttendances = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendances, setAttendances] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/teacher/TeacherPresence');
        setClasses(response.data.classes || []);
        if (response.data.classes.length > 0) {
          setSelectedClass(response.data.classes[0].id);
        }
      } catch (error) {
        console.error('Erreur classes:', error);
        const errorMessage = error.response?.data?.error || 'Erreur lors du chargement des classes';
        setError(errorMessage);
        toast.error(errorMessage, {
          position: 'top-right',
          autoClose: 3000,
          style: { backgroundColor: '#E74C3C', color: '#FFFFFF' },
        });
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  const handleAttendanceChange = (studentId, status) => {
    setAttendances((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSubmit = async () => {
    if (!selectedClass || !selectedDate) {
      toast.error('Veuillez sélectionner une classe et une date', {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#E74C3C', color: '#FFFFFF' },
      });
      return;
    }

    try {
      const promises = Object.entries(attendances).map(([studentId, status]) =>
        api.post('/api/store', {
          student_id: parseInt(studentId),
          date: selectedDate,
          status,
        })
      );
      await Promise.all(promises);
      toast.success('Présences enregistrées avec succès', {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#27AE60', color: '#FFFFFF' },
      });
      setAttendances({});
    } catch (error) {
      console.error('Erreur enregistrement:', error);
      const errorMessage = error.response?.data?.error || 'Erreur lors de l\'enregistrement des présences';
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#E74C3C', color: '#FFFFFF' },
      });
    }
  };

  const selectedClassData = classes.find((c) => c.id === parseInt(selectedClass)) || { students: [] };

  if (loading) {
    return (
      <div className="text-center p-8">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-secondary border-r-transparent"></div>
        <p className="text-lg font-montserrat text-primary mt-4">Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-lg font-montserrat text-alert">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 p-8" data-aos="fade-up">
      <h1 className="text-4xl font-montserrat font-bold text-primary">Gestion des Présences</h1>

      {/* Sélecteurs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-aos="fade-up" data-aos-delay="100">
        <div>
          <label className="block text-lg font-montserrat text-primary/90 mb-2">Classe</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full p-3 rounded-lg border border-primary/20 bg-white/95 text-primary focus:ring-2 focus:ring-secondary"
          >
            {classes.map((classe) => (
              <option key={classe.id} value={classe.id}>
                {classe.name}
              </option>
            ))}
            {classes.length === 0 && <option value="">Aucune classe</option>}
          </select>
        </div>
        <div>
          <label className="block text-lg font-montserrat text-primary/90 mb-2">Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full p-3 rounded-lg border border-primary/20 bg-white/95 text-primary focus:ring-2 focus:ring-secondary"
          />
        </div>
      </div>

      {/* Liste Étudiants */}
      {selectedClass && selectedClassData.students.length > 0 ? (
        <div className="card bg-white/95 backdrop-blur-lg shadow-2xl rounded-2xl p-8 border border-primary/10" data-aos="fade-up" data-aos-delay="200">
          <h2 className="text-2xl font-montserrat text-primary/90 mb-6">Étudiants ({selectedClassData.name})</h2>
          <div className="space-y-4">
            {selectedClassData.students.map((student) => (
              <div key={student.id} className="flex items-center justify-between p-4 border-b border-primary/10">
                <span className="text-lg font-opensans text-primary/80">
                  {student.first_name} {student.last_name}
                </span>
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleAttendanceChange(student.id, 'present')}
                    className={`p-2 rounded-full ${
                      attendances[student.id] === 'present'
                        ? 'bg-secondary text-white'
                        : 'bg-gray-200 text-primary'
                    }`}
                  >
                    <CheckCircleIcon className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => handleAttendanceChange(student.id, 'absent')}
                    className={`p-2 rounded-full ${
                      attendances[student.id] === 'absent'
                        ? 'bg-alert text-white'
                        : 'bg-gray-200 text-primary'
                    }`}
                  >
                    <XCircleIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={handleSubmit}
            className="mt-6 w-full p-3 bg-secondary text-white rounded-lg font-montserrat font-medium hover:bg-secondary/90 transition"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            Enregistrer les Présences
          </button>
        </div>
      ) : (
        <div className="text-center p-8" data-aos="fade-up" data-aos-delay="200">
          <p className="text-lg font-montserrat text-primary/70">
            {classes.length === 0 ? 'Aucune classe assignée' : 'Aucun étudiant dans cette classe'}
          </p>
        </div>
      )}
    </div>
  );
};

export default TeacherAttendances;
