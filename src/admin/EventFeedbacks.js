import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Swal from 'sweetalert2';
import '../assets/styles.css';

const EventFeedbacks = () => {
  const { eventId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [feedbacks, setFeedbacks] = useState([]);
  const [questions, setQuestions] = useState([]);
  const eventName = location.state?.eventName || 'Unknown Event';

  useEffect(() => {
    const fetchQuestions = async () => {
      const snapshot = await getDocs(collection(db, 'events', eventId, 'questions'));
      const questionList = snapshot.docs.map(doc => doc.data().text);
      questionList.sort((a, b) => {
        const numA = parseInt(a.split('.')[0]);
        const numB = parseInt(b.split('.')[0]);
        return numA - numB;
      });
      setQuestions(questionList);
    };

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

    fetchQuestions();
    fetchFeedbacks();
  }, [eventId]);

  const handleArchive = async (feedback) => {
    const confirm = await Swal.fire({
      title: 'Archive this feedback?',
      text: 'This will move the feedback to the archive.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#f39c12',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, archive it!',
      position: 'center'
    });

    if (confirm.isConfirmed) {
      try {
        await addDoc(collection(db, 'archived_feedbacks'), feedback);
        await deleteDoc(doc(db, 'feedbacks', feedback.id));
        setFeedbacks(prev => prev.filter(f => f.id !== feedback.id));

        Swal.fire({
          icon: 'success',
          title: 'Archived!',
          text: 'Feedback has been archived.',
          showConfirmButton: false,
          timer: 1500,
          position: 'center'
        });
      } catch (error) {
        console.error('Archiving failed:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to archive feedback.',
          showConfirmButton: false,
          timer: 1500,
          position: 'center'
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
        <h2 style={{ marginBottom: '10px' }}>Feedback for: {eventName}</h2>

        {/* View Archived Feedbacks Button */}
        <div style={{ marginBottom: '20px' }}>
          <button
            className="btn btn-secondary"
            onClick={() => navigate(`/admin/archived-feedbacks/${eventId}`, {
              state: { eventName }
            })}
          >
            View Archived Feedbacks
          </button>
        </div>

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

                <button className="delete-btn" onClick={() => handleArchive(feedback)}>
                  Archive Feedback
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
