import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
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

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the event.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      customClass: {
        popup: 'swal2-border-radius',
      },
      backdrop: true,
    });

    if (confirm.isConfirmed) {
      try {
        await deleteDoc(doc(db, 'events', id));
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'The event has been deleted.',
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000,
        });
      } catch (error) {
        console.error('Error deleting event:', error);
        Swal.fire({
          icon: 'error',
          title: 'Failed to delete event',
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000,
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
          <li onClick={() => navigate('/admin/manage-events')} className="active">
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

      <div className="main-content">
        <h2 className="page-title">Manage Events</h2>
        {events.length === 0 ? (
          <p className="no-events">No events available.</p>
        ) : (
          events.map((event) => (
            <div className="event-card" key={event.id}>
              <div className="event-details">
                <h3>{event.title}</h3>
                <p>{event.location}</p>
                <p>Date: {event.date}</p>
              </div>
              <div className="event-actions">
                <button
                  className="btn btn-primary"
                  onClick={() =>
                    navigate(`/admin/event-feedbacks/${event.id}`, {
                      state: { eventName: event.title },
                    })
                  }
                >
                  Check Feedbacks
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(event.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageEvents;
