import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, addDoc, collection, Timestamp } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
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

const FeedbackForm = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [eventData, setEventData] = useState(null);
  const [ratings, setRatings] = useState(Array(10).fill(0));
  const [hoveredStars, setHoveredStars] = useState(Array(10).fill(0));
  const [comment, setComment] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [fullName, setFullName] = useState('');
  const [userId, setUserId] = useState('');
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      const eventRef = doc(db, 'events', eventId);
      const eventSnap = await getDoc(eventRef);
      if (eventSnap.exists()) {
        setEventData(eventSnap.data());
      } else {
        navigate('/user/dashboard');
      }
    };

    const fetchUserName = async () => {
      auth.onAuthStateChanged(async (user) => {
        if (user) {
          setUserId(user.uid);
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            const name = data.fullName?.trim();
            if (name) setFullName(name);
          }
        }
        setLoadingUser(false);
      });
    };

    fetchEvent();
    fetchUserName();
  }, [eventId, navigate]);

  const handleRatingChange = (index, value) => {
    const updated = [...ratings];
    updated[index] = value;
    setRatings(updated);
  };

  const handleHover = (index, value) => {
    const updated = [...hoveredStars];
    updated[index] = value;
    setHoveredStars(updated);
  };

  const clearHover = (index) => {
    const updated = [...hoveredStars];
    updated[index] = 0;
    setHoveredStars(updated);
  };

  const handleSubmit = async () => {
    if (loadingUser) {
      Swal.fire({
        icon: 'info',
        title: 'Please wait...',
        text: 'Still loading user information. Try again shortly.',
        position: 'top-end',
        toast: true,
        timer: 3000,
        showConfirmButton: false,
      });
      return;
    }

    if (!anonymous && fullName === '') {
      Swal.fire({
        icon: 'error',
        title: 'Cannot Submit',
        text: 'Your name could not be loaded. Please try again later or submit anonymously.',
        position: 'top-end',
        toast: true,
        timer: 4000,
        showConfirmButton: false,
      });
      return;
    }

    const missingRatingIndex = ratings.findIndex((r) => r === 0);
    if (missingRatingIndex !== -1) {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Feedback',
        text: `Please provide a rating for Question ${missingRatingIndex + 1} before submitting.`,
        position: 'top-end',
        toast: true,
        timer: 4000,
        showConfirmButton: false,
      });
      return;
    }

    const confirm = await Swal.fire({
      title: anonymous ? 'Submit Anonymously?' : 'Submit Feedback?',
      text: anonymous
        ? 'Your name will not be recorded with this feedback.'
        : 'Are you sure you want to submit this feedback?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, submit it!',
      cancelButtonText: 'Cancel',
    });

    if (!confirm.isConfirmed) return;

    try {
      const feedbackMap = {};
      questions.forEach((q, i) => {
        feedbackMap[q] = ratings[i];
      });

      await addDoc(collection(db, 'feedbacks'), {
        eventId,
        eventName: eventData?.title || '',
        createdAt: Timestamp.now(),
        fullName: anonymous ? 'Anonymous' : fullName,
        userId: userId,
        isAnonymous: anonymous,
        feedback: feedbackMap,
        comment,
      });

      Swal.fire({
        icon: 'success',
        title: 'Thank you!',
        text: 'Your feedback has been submitted.',
        position: 'top-end',
        toast: true,
        timer: 3000,
        showConfirmButton: false,
      });

      navigate('/user/dashboard');
    } catch (error) {
      console.error('Feedback submission failed:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error submitting',
        text: 'Something went wrong. Please try again.',
        position: 'top-end',
        toast: true,
        timer: 3000,
        showConfirmButton: false,
      });
    }
  };

  if (!eventData) return <div>Loading event details...</div>;

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo-section">
          <img src="/images/logo.png" alt="Logo" className="logo-img" />
          <h2 className="logo-text">ADVENT</h2>
        </div>
        <ul className="sidebar-menu">
          <li onClick={() => navigate('/user/dashboard')}>
            <img src="/images/dashboard.png" alt="Dashboard" />
            <span>Events</span>
          </li>
          <li onClick={() => navigate('/user/feedbacks')}>
            <img src="/images/manage_events.png" alt="Feedbacks" />
            <span>Feedbacks</span>
          </li>
        </ul>
        <button className="logout-btn" onClick={() => navigate('/login')}>
          Logout
        </button>
      </div>

      {/* Main */}
      <div className="main-content">
        <h2>Feedback for: {eventData?.title}</h2>
        <div className="feedback-form">
          <div className="feedback-columns">
            <div className="column">
              {questions.slice(0, 5).map((q, i) => (
                <div key={i} className="rating-section">
                  <label><strong>{q}</strong></label>
                  <div className="stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={star <= (hoveredStars[i] || ratings[i]) ? 'star filled' : 'star'}
                        onClick={() => handleRatingChange(i, star)}
                        onMouseEnter={() => handleHover(i, star)}
                        onMouseLeave={() => clearHover(i)}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="column">
              {questions.slice(5).map((q, i) => (
                <div key={i + 5} className="rating-section">
                  <label><strong>{q}</strong></label>
                  <div className="stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={star <= (hoveredStars[i + 5] || ratings[i + 5]) ? 'star filled' : 'star'}
                        onClick={() => handleRatingChange(i + 5, star)}
                        onMouseEnter={() => handleHover(i + 5, star)}
                        onMouseLeave={() => clearHover(i + 5)}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="comment-section">
            <label><strong>Comment:</strong></label>
            <textarea
              rows="5"
              placeholder="Write your feedback here..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <div className="anonymous-toggle">
            <label>
              <input
                type="checkbox"
                checked={anonymous}
                onChange={() => setAnonymous(!anonymous)}
              />
              Submit as Anonymous
            </label>
          </div>

          <button className="submit-feedback-btn" onClick={handleSubmit}>
            Submit Feedback
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackForm;
