import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import '../assets/styles.css';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [submittedEventIds, setSubmittedEventIds] = useState([]);
  const [fullName, setFullName] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const fetchUserDataAndEvents = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate('/login');
        return;
      }

      setUserId(user.uid);

      const usersSnapshot = await getDocs(collection(db, 'users'));
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.email === user.email) {
          const full = `${data.firstName} ${data.surname}`;
          setFullName(full);
        }
      });

      const eventsSnapshot = await getDocs(collection(db, 'events'));
      const eventList = [];
      eventsSnapshot.forEach((doc) => {
        eventList.push({ id: doc.id, ...doc.data() });
      });
      setEvents(eventList);

      const feedbacksSnapshot = await getDocs(collection(db, 'feedbacks'));
      const submitted = [];
      feedbacksSnapshot.forEach((doc) => {
        const data = doc.data();
        const submittedByThisUser =
          (data.fullName === fullName && data.isAnonymous === false) ||
          data.userId === user.uid;

        if (submittedByThisUser) {
          submitted.push(data.eventId);
        }
      });
      setSubmittedEventIds(submitted);
    };

    fetchUserDataAndEvents();
  }, [navigate]);

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div className="logo-section">
          <img src="/images/logo.png" alt="Logo" className="logo-img" />
          <h2 className="logo-text">ADVENT</h2>
        </div>
        <ul className="sidebar-menu">
          <li>
            <img src="/images/dashboard.png" alt="Dashboard Icon" />
            <span>Events</span>
          </li>
          <li onClick={() => navigate('/user/feedbacks')}>
            <img src="/images/manage_events.png" alt="Feedbacks Icon" />
            <span>Feedbacks</span>
          </li>
        </ul>
        <button className="logout-btn" onClick={() => navigate('/login')}>
          Logout
        </button>
      </div>

      <div className="main-content">
        <h2 className="welcome-text">Welcome, {fullName}!</h2>
        <h3 className="events-heading">Available Events</h3>
        <div className="event-list">
          {events.length === 0 ? (
            <p>No events available.</p>
          ) : (
            events.map((event) => {
              const isSubmitted = submittedEventIds.includes(event.id);
              return (
                <div key={event.id} className="event-card user">
                  <h4>{event.title}</h4>
                  <p><strong>Date:</strong> {event.date}</p>
                  <p><strong>Location:</strong> {event.location}</p>
                  <button
                    className={`feedback-btn ${isSubmitted ? 'submitted' : ''}`}
                    disabled={isSubmitted}
                    onClick={() => navigate(`/user/feedback/${event.id}`)}
                  >
                    {isSubmitted ? '✓ Feedback Submitted' : '📝・ Create Feedback'}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
