import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title
} from 'chart.js';
import '../assets/styles.css';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

const EventAnalytics = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const eventName = location.state?.eventName || 'Event';

  const [questions, setQuestions] = useState([]);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const questionsSnap = await getDocs(collection(db, 'events', eventId, 'questions'));
      let questionData = questionsSnap.docs.map(doc => doc.data().text);

      // Sort by numeric prefix
      questionData.sort((a, b) => {
        const numA = parseInt(a.split('.')[0]);
        const numB = parseInt(b.split('.')[0]);
        return numA - numB;
      });

      setQuestions(questionData);

      const feedbackSnap = await getDocs(
        query(collection(db, 'feedbacks'), where('eventId', '==', eventId))
      );
      const feedbacks = feedbackSnap.docs.map(doc => doc.data());

      const totals = Array(questionData.length).fill(0);
      const counts = Array(questionData.length).fill(0);

      feedbacks.forEach(fb => {
        questionData.forEach((q, i) => {
          const value = parseInt(fb.feedback?.[q]);
          if (!isNaN(value)) {
            totals[i] += value;
            counts[i]++;
          }
        });
      });

      const averages = totals.map((sum, i) =>
        counts[i] > 0 ? (sum / counts[i]).toFixed(1) : 0
      );

      const barColors = averages.map(avg => {
        const score = parseFloat(avg);
        if (score <= 2) return '#e74c3c';
        if (score <= 3) return '#f39c12';
        return '#2ecc71';
      });

      setChartData({
        labels: questionData,
        datasets: [{
          label: 'Average Rating (1–5)',
          data: averages,
          backgroundColor: barColors,
          borderRadius: 6,
        }]
      });
    };

    fetchData();
  }, [eventId]);

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo-section">
          <img src="/images/logo.png" alt="Logo" className="logo-img" />
          <h2 className="logo-text">ADVENT</h2>
        </div>
        <ul className="sidebar-menu">
          <li onClick={() => navigate('/admin/dashboard')}>
            <img src="/images/dashboard.png" alt="Dashboard" />
            <span>Dashboard</span>
          </li>
          <li onClick={() => navigate('/admin/manage-events')}>
            <img src="/images/manage_events.png" alt="Manage Events" />
            <span>Manage Events</span>
          </li>
          <li onClick={() => navigate('/admin/archived-events')}>
            <img src="/images/archive.png" alt="Archived Events" />
            <span>Archived Events</span>
          </li>
          <li onClick={() => navigate('/admin/add-event')}>
            <img src="/images/add_events.png" alt="Add Event" />
            <span>Add Event</span>
          </li>
        </ul>
        <button className="logout-btn" onClick={() => navigate('/login')}>Logout</button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <h2 className="page-title">Analytics for: {eventName}</h2>

        {/* 🔙 Back Button */}
        <div style={{ marginBottom: '20px' }}>
          <button
            className="btn btn-secondary"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
        </div>

        {chartData ? (
          <div className="chart-container">
            <Bar
              data={chartData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  title: {
                    display: true,
                    text: 'Event Feedback Analytics',
                    font: { size: 20 }
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 5,
                    title: { display: true, text: 'Average Score' }
                  }
                }
              }}
            />
          </div>
        ) : (
          <p>No feedback or questions found for this event.</p>
        )}
      </div>
    </div>
  );
};

export default EventAnalytics;
