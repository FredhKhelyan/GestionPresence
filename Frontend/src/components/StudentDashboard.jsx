import { useState, useEffect } from 'react';
import api from '../api/axios';

const StudentDashboard = () => {
  const [attendances, setAttendances] = useState([]);

  useEffect(() => {
    const fetchAttendances = async () => {
      try {
        const response = await api.get('/api/attendances');
        setAttendances(response.data);
      } catch (error) {
        // Erreur gérée par axios.js
      }
    };
    fetchAttendances();
  }, []);

  return (
    <div className="space-y-8" data-aos="fade-up">
      <h1 className="text-3xl font-montserrat font-bold text-primary">Tableau de bord Étudiant</h1>
      <div className="card bg-white/90 backdrop-blur-md shadow-xl rounded-2xl p-6">
        <h2 className="text-2xl font-montserrat text-primary/90 mb-4">Mes Présences</h2>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="font-opensans text-primary/90">Cours</th>
                <th className="font-opensans text-primary/90">Date</th>
                <th className="font-opensans text-primary/90">Statut</th>
              </tr>
            </thead>
            <tbody>
              {attendances.map((attendance) => (
                <tr key={attendance.id}>
                  <td className="font-opensans text-primary/80">{attendance.course}</td>
                  <td className="font-opensans text-primary/80">{attendance.date}</td>
                  <td className="font-opensans text-primary/80">{attendance.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
