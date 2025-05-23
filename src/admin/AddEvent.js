import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Swal from 'sweetalert2';
import '../assets/styles.css';

const AddEvent = () => {
  const navigate = useNavigate();
  const [eventName, setEventName] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventDate, setEventDate] = useState('');

  const handleAddEvent = async () => {
    if (!eventName || !eventLocation || !eventDate) {
      Swal.fire({
        icon: 'warning',
        title: 'All fields are required!',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
      });
      return;
    }

    try {
      await addDoc(collection(db, 'events'), {
        title: eventName,
        location: eventLocation,
        date: eventDate,
        createdAt: Timestamp.now(),
        archived: false,
      });

      Swal.fire({
        icon: 'success',
        title: 'Event added successfully!',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
      });

      setEventName('');
      setEventLocation('');
      setEventDate('');
    } catch (error) {
      console.error('Error adding event:', error);
      Swal.fire({
        icon: 'error',
        title: 'Failed to add event',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
      });
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
          <li onClick={() => navigate('/admin/manage-events')}>
            <img src="/images/manage_events.png" alt="Manage Events" />
            <span>Manage Events</span>
          </li>
          <li onClick={() => navigate('/admin/archived-events')}>
            <img src="/images/archive.png" alt="Archived Events" />
            <span>Archived Events</span>
          </li>
          <li className="active" onClick={() => navigate('/admin/add-event')}>
            <img src="/images/add_events.png" alt="Add Event" />
            <span>Add Event</span>
          </li>
        </ul>
        <button className="logout-btn" onClick={() => navigate('/login')}>Logout</button>
      </div>

      {/* Main Content */}
      <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '40px' }}>
        <div className="form-card" style={{ maxWidth: '500px', width: '100%', padding: '25px 30px' }}>
          <h2 className="page-title" style={{ textAlign: 'center', marginBottom: '20px' }}>Add New Event</h2>
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label>Event Title</label>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="Enter event title"
            />
          </div>
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label>Location</label>
            <input
              type="text"
              value={eventLocation}
              onChange={(e) => setEventLocation(e.target.value)}
              placeholder="Enter event location"
            />
          </div>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label>Date</label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
            />
          </div>
          <button className="btn btn-primary full-width" onClick={handleAddEvent}>
            Add Event
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEvent;
