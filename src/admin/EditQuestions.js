import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
} from 'firebase/firestore';
import '../assets/styles.css';

const EditQuestions = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editedText, setEditedText] = useState('');

  useEffect(() => {
    refreshQuestions();
  }, [eventId]);

  const refreshQuestions = async () => {
    const snapshot = await getDocs(collection(db, 'events', eventId, 'questions'));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Sort based on question number prefix (e.g., "01. ...")
    data.sort((a, b) => {
      const numA = parseInt(a.text.split('.')[0]);
      const numB = parseInt(b.text.split('.')[0]);
      return numA - numB;
    });

    setQuestions(data);
  };

  const handleAdd = async () => {
    if (!newQuestion.trim()) return;

    const questionNumber = questions.length + 1;
    const paddedNumber = questionNumber.toString().padStart(2, '0');
    const formattedText = `${paddedNumber}. ${newQuestion}`;

    await addDoc(collection(db, 'events', eventId, 'questions'), { text: formattedText });
    setNewQuestion('');
    refreshQuestions();
  };

  const handleEdit = (id, currentText) => {
    const noPrefix = currentText.replace(/^\d+\.\s/, '');
    setEditingId(id);
    setEditedText(noPrefix);
  };

  const handleSave = async (id, index) => {
    if (!editedText.trim()) return;
    const paddedNumber = (index + 1).toString().padStart(2, '0');
    const formattedText = `${paddedNumber}. ${editedText}`;

    const ref = doc(db, 'events', eventId, 'questions', id);
    await updateDoc(ref, { text: formattedText });

    setEditingId(null);
    setEditedText('');
    refreshQuestions();
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
          <li onClick={() => navigate('/admin/add-event')}>
            <img src="/images/add_events.png" alt="Add Event" />
            <span>Add Event</span>
          </li>
          <li className="active" onClick={() => navigate(`/admin/edit-questions/${eventId}`)}>
            <img src="/images/question.png" alt="Manage Questions" />
            <span>Edit Questions</span>
          </li>
        </ul>
        <button className="logout-btn" onClick={() => navigate('/login')}>Logout</button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <h2 className="page-title">Edit Questions for This Event</h2>

        {/* Add Question */}
        <div className="form-card" style={{ marginBottom: '30px' }}>
          <input
            type="text"
            placeholder="Enter a new question..."
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            className="form-group-input"
          />
          <button className="btn btn-primary full-width" onClick={handleAdd}>
             Add Question
          </button>
        </div>

        {/* Editable List */}
        <div className="card-list">
          {questions.length > 0 ? (
            questions.map((q, index) => (
              <div key={q.id} className="event-card">
                {editingId === q.id ? (
                  <>
                    <input
                      type="text"
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      className="form-group-input"
                    />
                    <button
                      className="btn btn-primary"
                      onClick={() => handleSave(q.id, index)}
                    >
                      Save
                    </button>
                  </>
                ) : (
                  <>
                    <p><strong>{q.text}</strong></p>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleEdit(q.id, q.text)}
                    >
                      Edit
                    </button>
                  </>
                )}
              </div>
            ))
          ) : (
            <p>No questions added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditQuestions;
