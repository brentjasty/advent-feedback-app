import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './admin/Dashboard';
import ManageEvents from './admin/ManageEvents';
import AddEvent from './admin/AddEvent';
import EventFeedbacks from './admin/EventFeedbacks'; // <== Import the component
import UserDashboard from './user/UserDashboard';
import FeedbackForm from './user/FeedbackForm';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/manage-events" element={<ManageEvents />} />
        <Route path="/admin/add-event" element={<AddEvent />} />
        <Route path="/admin/feedbacks/:eventId" element={<EventFeedbacks />} /> {/* <-- Add this line */}
        <Route path="/user/dashboard" element={<UserDashboard />} /> 
        <Route path="/user/feedback/:eventId" element={<FeedbackForm />} />
        <Route path="/admin/event-feedbacks/:eventId" element={<EventFeedbacks />} />

      </Routes>
    </Router>
  );
}

export default App;
