import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import Swal from 'sweetalert2';
import '../assets/styles.css';

const ArchivedEvents = () => {
  const navigate = useNavigate();
  const [archivedEvents, setArchivedEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchArchived();
  }, []);

  const fetchArchived = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'archived_events'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setArchivedEvents(data);
    } catch (error) {
      console.error('Failed to fetch archived events:', error);
    }
  };

  const handleRestore = async (event) => {
    try {
      await addDoc(collection(db, 'events'), {
        title: event.title,
        location: event.location,
        date: event.date,
        createdAt: event.createdAt || new Date(),
      });

      await deleteDoc(doc(db, 'archived_events', event.id));

      Swal.fire({
        icon: 'success',
        title: 'Restored!',
        text: 'Event moved back to Current Events.',
        timer: 2000,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
      });

      fetchArchived();
    } catch (error) {
      console.error('Restore failed:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to restore event.',
      });
    }
  };

  const filteredEvents = archivedEvents.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <li className="active" onClick={() => navigate('/admin/archived-events')}>
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
        <div className="header-row">
          <h2 className="page-title">Archived Events</h2>
          <input
            type="text"
            placeholder="Search events..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="table-responsive">
          <table className="styled-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Location</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length > 0 ? (
                filteredEvents.map(event => (
                  <tr key={event.id}>
                    <td>{event.title}</td>
                    <td>{event.location}</td>
                    <td>{event.date}</td>
                    <td>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleRestore(event)}
                      >
                        Restore
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="no-events">No archived events found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ArchivedEvents;
