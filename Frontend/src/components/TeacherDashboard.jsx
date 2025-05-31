import { useState, useEffect } from 'react';
import api from '../api/axios';

const TeacherDashboard = () => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/api/courses');
        setCourses(response.data);
      } catch (error) {
        // Erreur gérée par axios.js
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="space-y-8" data-aos="fade-up">
      <h1 className="text-3xl font-montserrat font-bold text-primary">Tableau de bord Enseignant</h1>
      <div className="card bg-white/90 backdrop-blur-md shadow-xl rounded-2xl p-6">
        <h2 className="text-2xl font-montserrat text-primary/90 mb-4">Mes Cours</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((course) => (
            <div key={course.id} className="card bg-white shadow-md rounded-lg p-4">
              <h3 className="font-montserrat text-lg text-primary/90">{course.name}</h3>
              <p className="font-opensans text-primary/80">Horaire: {course.schedule}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
