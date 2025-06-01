import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_presences: 0,
    total_absences: 0,
    presence_ratio: 0,
    by_room: [],
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/api/attendance-stats');
        setStats(response.data);
      } catch (error) {
        console.error('Erreur stats:', error);
      }
    };
    fetchStats();
  }, []);

  const chartData = {
    labels: stats.by_room.map((room) => room.room),
    datasets: [
      {
        label: 'Présences',
        data: stats.by_room.map((room) => room.presences),
        backgroundColor: '#27AE60',
        borderRadius: 8,
      },
      {
        label: 'Absences',
        data: stats.by_room.map((room) => room.absences),
        backgroundColor: '#E74C3C',
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { font: { family: 'Montserrat', size: 14 } } },
      title: { display: true, text: 'Présences/Absences par Salle', font: { family: 'Montserrat', size: 18 } },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Nombre', font: { family: 'Open Sans' } } },
      x: { title: { display: true, text: 'Salles', font: { family: 'Open Sans' } } },
    },
  };

  return (
    <div className="space-y-10" data-aos="fade-up">
      <h1 className="text-4xl font-montserrat font-bold text-primary">Tableau de Bord Administrateur</h1>

      {/* Cartes de Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card" data-aos="fade-up" data-aos-delay="100">
          <h3 className="text-xl font-montserrat text-primary/90 mb-4">Total Présences</h3>
          <p className="text-4xl font-montserrat font-bold text-secondary">{stats.total_presences}</p>
        </div>
        <div className="stat-card" data-aos="fade-up" data-aos-delay="200">
          <h3 className="text-xl font-montserrat text-primary/90 mb-4">Total Absences</h3>
          <p className="text-4xl font-montserrat font-bold text-alert">{stats.total_absences}</p>
        </div>
        <div className="stat-card" data-aos="fade-up" data-aos-delay="300">
          <h3 className="text-xl font-montserrat text-primary/90 mb-4">Ratio Présence</h3>
          <p className="text-4xl font-montserrat font-bold text-primary">
            {(stats.presence_ratio * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Graphique */}
      <div className="card bg-white/95 backdrop-blur-lg shadow-2xl rounded-2xl p-8 border border-primary/10" data-aos="fade-up" data-aos-delay="400">
        <h2 className="text-2xl font-montserrat text-primary/90 mb-6">Statistiques par Salle</h2>
        <div className="relative h-96">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
