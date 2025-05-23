import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import '../assets/styles.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [eventCount, setEventCount] = useState(0);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const eventsSnap = await getDocs(collection(db, 'events'));
      const eventsData = eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEventCount(eventsData.length);
      setEvents(eventsData);

      const feedbackSnap = await getDocs(collection(db, 'feedbacks'));
      setFeedbackCount(feedbackSnap.size);

      const usersSnap = await getDocs(collection(db, 'users'));
      setUserCount(usersSnap.size);
    };

    fetchData();
  }, []);

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo-section">
          <img src="/images/logo.png" className="logo-img" alt="Logo" />
          <h2 className="logo-text">ADVENT</h2>
        </div>
        <ul className="sidebar-menu">
          <li className="active" onClick={() => navigate('/admin/dashboard')}>
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
        <h2 className="admin-heading">Hello, Admin!</h2>

        <div className="stats-cards">
          <div className="card">
            <h4>Total Events</h4>
            <h2>{eventCount}</h2>
          </div>
          <div className="card">
            <h4>Total Feedback</h4>
            <h2>{feedbackCount}</h2>
          </div>
          <div className="card">
            <h4>User Registrations</h4>
            <h2>{userCount}</h2>
          </div>
        </div>

        {/* Current Event Analytics */}
        <h3 className="events-heading">📊 Current Event Analytics</h3>

        <div className="card-list">
          {events.length > 0 ? (
            events.map(event => (
              <div key={event.id} className="event-card">
                <div className="event-details">
                  <h3 className="event-title">{event.title}</h3>
                  <p className="event-info"><strong>Date:</strong> {event.date}</p>
                  <p className="event-info"><strong>Location:</strong> {event.location}</p>
                </div>
                <div className="event-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() =>
                      navigate(`/admin/event-analytics/${event.id}`, {
                        state: { eventName: event.title }
                      })
                    }
                  >
                    View Analytics
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No events found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
