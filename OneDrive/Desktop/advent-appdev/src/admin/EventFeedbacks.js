import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Swal from 'sweetalert2';
import '../assets/styles.css';

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

const EventFeedbacks = () => {
  const { eventId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [feedbacks, setFeedbacks] = useState([]);
  const eventName = location.state?.eventName || 'Unknown Event';

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const q = query(collection(db, 'feedbacks'), where('eventId', '==', eventId));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFeedbacks(data);
      } catch (error) {
        console.error('Error fetching feedbacks:', error);
      }
    };

    fetchFeedbacks();
  }, [eventId]);

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the feedback.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    });

    if (confirm.isConfirmed) {
      try {
        await deleteDoc(doc(db, 'feedbacks', id));
        setFeedbacks(prev => prev.filter(f => f.id !== id));
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Feedback has been deleted.',
          showConfirmButton: false,
          timer: 1500,
        });
      } catch (error) {
        console.error('Delete failed:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete feedback.',
          showConfirmButton: false,
          timer: 1500,
        });
      }
    }
  };

  return (
    <div className="dashboard-container" style={{ height: '100vh', display: 'flex' }}>
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
        <button className="logout-btn" onClick={() => navigate('/login')}>Logout</button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <h2 style={{ marginBottom: '20px' }}>Feedback for: {eventName}</h2>

        {feedbacks.length > 0 ? (
          <div className="feedback-grid">
            {feedbacks.map((feedback, index) => (
              <div className="feedback-card" key={index}>
                <h3>{feedback.fullName || 'Anonymous'}</h3>
                <p className="date">
                  <strong>Date:</strong>{' '}
                  {feedback.createdAt?.seconds
                    ? new Date(feedback.createdAt.seconds * 1000).toLocaleString()
                    : 'N/A'}
                </p>
                <p><strong>Comment:</strong> {feedback.comment || 'No comment provided'}</p>

                <div className="feedback-questions">
                  {questions.map((q, i) => (
                    <p key={i}>
                      <strong>{q}</strong>: {feedback.feedback?.[q] ?? 'N/A'}
                    </p>
                  ))}
                </div>

                <button className="delete-btn" onClick={() => handleDelete(feedback.id)}>
                  Delete Feedback
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>No feedbacks submitted yet.</p>
        )}
      </div>
    </div>
  );
};

export default EventFeedbacks;
