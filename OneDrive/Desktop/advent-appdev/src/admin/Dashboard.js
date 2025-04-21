import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import '../assets/styles.css';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const questions = [
  '01. Overall quality of the event content',
  '02. Organization and structure of the event',
  '03. Speaker/facilitator performance',
  '04. Speaker engagement with the audience',
  '05. Event logistics and coordination',
  '06. Technical setup (audio, visuals, tools)',
  '07. Event engagement and interest level',
  '08. Likelihood of joining future S.I.T.E. events',
  '09. Learning or personal gain from the event',
  '10. Relevance to academic or personal interests'
];

const Dashboard = () => {
  const navigate = useNavigate();

  const [eventCount, setEventCount] = useState(0);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const eventsSnapshot = await getDocs(collection(db, 'events'));
        setEventCount(eventsSnapshot.size);

        const feedbacksSnapshot = await getDocs(collection(db, 'feedbacks'));
        const feedbacks = feedbacksSnapshot.docs.map(doc => doc.data());
        setFeedbackCount(feedbacks.length);

        const usersSnapshot = await getDocs(collection(db, 'users'));
        setUserCount(usersSnapshot.size);

        // Calculate average per question
        const totals = Array(questions.length).fill(0);
        const counts = Array(questions.length).fill(0);

        feedbacks.forEach(fb => {
          questions.forEach((q, i) => {
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

        const colors = [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
          '#FF9F40', '#FF6384', '#36A2EB', '#4CAF50', '#F06292'
        ];

        setChartData({
          labels: questions.map(q => q.slice(4)), // Remove "01. " prefix
          datasets: [
            {
              label: 'Average Rating (1–5)',
              data: averages,
              backgroundColor: colors,
              borderRadius: 6,
            },
          ],
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

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
          <li onClick={() => navigate('/admin/add-event')}>
            <img src="/images/add_events.png" alt="Add Event" />
            <span>Add Event</span>
          </li>
        </ul>
        <button className="logout-btn" onClick={() => navigate('/login')}>
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <h2 className="admin-heading">Hello, Admin!</h2>

        <div className="stats-cards">
          <div className="card">
            <h4 className="card-title">Total Events</h4>
            <h2 className="card-count">{eventCount}</h2>
          </div>
          <div className="card">
            <h4 className="card-title">Total Feedback</h4>
            <h2 className="card-count">{feedbackCount}</h2>
          </div>
          <div className="card">
            <h4 className="card-title">User Registrations</h4>
            <h2 className="card-count">{userCount}</h2>
          </div>
        </div>

        <div className="feedback-overview centered-overview">
          <h3 className="analytics-heading">📊 Average Ratings per Question</h3>
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
                    },
                  },
                  scales: {
                    y: {
                      min: 0,
                      max: 5,
                      ticks: { stepSize: 1 },
                    },
                  },
                }}
              />
            </div>
          ) : (
            <div className="chart-placeholder">Loading chart...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
