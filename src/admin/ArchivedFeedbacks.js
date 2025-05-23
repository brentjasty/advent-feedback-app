import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { collection, getDocs, query, where, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Swal from 'sweetalert2';
import '../assets/styles.css';

const ArchivedFeedbacks = () => {
  const { eventId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const eventName = location.state?.eventName || 'Unknown Event';

  const [archivedFeedbacks, setArchivedFeedbacks] = useState([]);
  const [questions, setQuestions] = useState([]);

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

    const fetchArchived = async () => {
      const q = query(collection(db, 'archived_feedbacks'), where('eventId', '==', eventId));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setArchivedFeedbacks(data);
    };

    fetchQuestions();
    fetchArchived();
  }, [eventId]);

  const handleRestore = async (feedback) => {
    const confirm = await Swal.fire({
      title: 'Restore this feedback?',
      text: 'It will be moved back to the active feedbacks.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, restore it!',
      confirmButtonColor: '#2ecc71',
      cancelButtonColor: '#e74c3c',
      position: 'center'
    });

    if (confirm.isConfirmed) {
      try {
        await addDoc(collection(db, 'feedbacks'), feedback);
        await deleteDoc(doc(db, 'archived_feedbacks', feedback.id));
        setArchivedFeedbacks(prev => prev.filter(f => f.id !== feedback.id));

        Swal.fire({
          icon: 'success',
          title: 'Restored!',
          text: 'Feedback has been moved back.',
          showConfirmButton: false,
          timer: 1500,
          position: 'center'
        });
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Could not restore feedback.',
          showConfirmButton: false,
          timer: 1500,
          position: 'center'
        });
      }
    }
  };

  return (
    <div className="dashboard-container">
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

      <div className="main-content">
        <h2 style={{ marginBottom: '20px' }}>Archived Feedbacks for: {eventName}</h2>

        {archivedFeedbacks.length > 0 ? (
          <div className="feedback-grid">
            {archivedFeedbacks.map((fb, i) => (
              <div className="feedback-card" key={i}>
                <h3>{fb.fullName || 'Anonymous'}</h3>
                <p className="date"><strong>Date:</strong> {fb.createdAt?.seconds ? new Date(fb.createdAt.seconds * 1000).toLocaleString() : 'N/A'}</p>
                <p><strong>Comment:</strong> {fb.comment || 'No comment'}</p>
                <div className="feedback-questions">
                  {questions.map((q, i) => (
                    <p key={i}>
                      <strong>{q}</strong>: {fb.feedback?.[q] ?? 'N/A'}
                    </p>
                  ))}
                </div>
                <button className="btn btn-primary" onClick={() => handleRestore(fb)}>
                  Restore Feedback
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>No archived feedbacks available.</p>
        )}
      </div>
    </div>
  );
};

export default ArchivedFeedbacks;
