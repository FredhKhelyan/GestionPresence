import { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TeacherDashboard = () => {
  const [stats, setStats] = useState({ classes: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/teacher/TeacherStats');
        setStats(response.data || { classes: [] });
      } catch (error) {
        console.error('Erreur stats:', error);
        const errorMessage = error.response?.data?.error || 'Erreur lors du chargement des statistiques';
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
    fetchStats();
  }, []);

  const chartData = {
    labels: (stats.classes || []).map((classe) => classe.name || 'Inconnu'),
    datasets: [
      {
        label: 'Présences',
        data: (stats.classes || []).map((classe) => classe.total_presences || 0),
        backgroundColor: '#27AE60',
        borderRadius: 8,
      },
      {
        label: 'Absences',
        data: (stats.classes || []).map((classe) => classe.total_absences || 0),
        backgroundColor: '#E74C3C',
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { font: { family: 'Montserrat', size: 14 } } },
      title: { display: true, text: 'Présences/Absences par Classe', font: { family: 'Montserrat', size: 18 } },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Nombre', font: { family: 'Open Sans' } } },
      x: { title: { display: true, text: 'Classes', font: { family: 'Open Sans' } } },
    },
  };

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
      <h1 className="text-4xl font-montserrat font-bold text-primary">Tableau de Bord Enseignant</h1>

      {/* Récap Classes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(stats.classes || []).map((classe) => (
          <div
            key={classe.id}
            className="card bg-white/95 backdrop-blur-lg shadow-2xl rounded-2xl p-6 border border-primary/10"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <h3 className="text-xl font-montserrat text-primary/90 mb-4">{classe.name}</h3>
            <p className="text-lg font-opensans text-primary/80">
              Présences : <span className="font-bold text-secondary">{classe.total_presences}</span>
            </p>
            <p className="text-lg font-opensans text-primary/80">
              Absences : <span className="font-bold text-alert">{classe.total_absences}</span>
            </p>
            <p className="text-lg font-opensans text-primary/80">
              Ratio :{' '}
              <span className="font-bold text-primary">
                {(classe.presence_ratio * 100).toFixed(1)}%
              </span>
            </p>
          </div>
        ))}
        {stats.classes.length === 0 && (
          <div className="text-center col-span-full">
            <p className="text-lg font-montserrat text-primary/70">Aucune classe assignée</p>
          </div>
        )}
      </div>

      {/* Graphique */}
      {stats.classes.length > 0 && (
        <div
          className="card bg-white/95 backdrop-blur-lg shadow-2xl rounded-2xl p-8 border border-primary/10"
          data-aos="fade-up"
          data-aos-delay="400"
        >
          <h2 className="text-2xl font-montserrat text-primary/90 mb-6">Statistiques par Classe</h2>
          <div className="relative h-96">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
