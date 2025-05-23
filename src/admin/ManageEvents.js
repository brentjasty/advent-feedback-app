import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import Swal from 'sweetalert2';
import '../assets/styles.css';

const ManageEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'events'), (snapshot) => {
      const eventsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(eventsData);
    });

    return () => unsubscribe();
  }, []);

  const handleArchive = async (id, eventData) => {
    const confirm = await Swal.fire({
      title: 'Archive this event?',
      text: 'This event will be moved to Archived Events.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#e67e22',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, archive it!',
      position: 'center', // 🟡 Centered alert
    });

    if (confirm.isConfirmed) {
      try {
        await addDoc(collection(db, 'archived_events'), {
          title: eventData.title,
          location: eventData.location,
          date: eventData.date,
          createdAt: eventData.createdAt || new Date(),
        });

        await deleteDoc(doc(db, 'events', id));

        Swal.fire({
          icon: 'success',
          title: 'Archived!',
          text: 'Event moved to Archived Events.',
          timer: 2000,
          showConfirmButton: false,
          position: 'center', // ✅ Centered
        });
      } catch (error) {
        console.error('Error archiving event:', error);
        Swal.fire({
          icon: 'error',
          title: 'Failed to archive event',
          timer: 2000,
          showConfirmButton: false,
          position: 'center', // ✅ Centered
        });
      }
    }
  };

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
          <li className="active" onClick={() => navigate('/admin/manage-events')}>
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
        <h2 className="page-title">Manage Events</h2>
        <div className="table-responsive">
          <table className="styled-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Location</th>
                <th>Date</th>
                <th className="actions-column">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.length > 0 ? (
                events.map((event) => (
                  <tr key={event.id}>
                    <td>{event.title}</td>
                    <td>{event.location}</td>
                    <td>{event.date}</td>
                    <td className="action-buttons">
                      <button
                        className="btn btn-primary"
                        onClick={() =>
                          navigate(`/admin/event-feedbacks/${event.id}`, {
                            state: { eventName: event.title },
                          })
                        }
                      >
                        View Feedbacks
                      </button>
                      <button
                        className="btn btn-warning"
                        onClick={() => handleArchive(event.id, event)}
                      >
                        Archive
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => navigate(`/admin/edit-questions/${event.id}`)}
                      >
                        Edit Questions
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="no-events">No events available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageEvents;
