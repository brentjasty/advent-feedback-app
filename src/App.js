import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './components/Login';
import Register from './components/Register';

import Dashboard from './admin/Dashboard';
import ManageEvents from './admin/ManageEvents';
import AddEvent from './admin/AddEvent';
import EventFeedbacks from './admin/EventFeedbacks';
import ArchivedEvents from './admin/ArchivedEvents';
import EditQuestions from './admin/EditQuestions';
import EventAnalytics from './admin/EventAnalytics';
import ArchivedFeedbacks from './admin/ArchivedFeedbacks'; // ✅ Added this line

import UserDashboard from './user/UserDashboard';
import FeedbackForm from './user/FeedbackForm';

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/manage-events" element={<ManageEvents />} />
        <Route path="/admin/add-event" element={<AddEvent />} />
        <Route path="/admin/archived-events" element={<ArchivedEvents />} />
        <Route path="/admin/edit-questions/:eventId" element={<EditQuestions />} />
        <Route path="/admin/event-feedbacks/:eventId" element={<EventFeedbacks />} />
        <Route path="/admin/event-analytics/:eventId" element={<EventAnalytics />} />
        <Route path="/admin/archived-feedbacks/:eventId" element={<ArchivedFeedbacks />} /> {/* ✅ New route */}

        {/* User Routes */}
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/user/feedback/:eventId" element={<FeedbackForm />} />
      </Routes>
    </Router>
  );
}

export default App;
