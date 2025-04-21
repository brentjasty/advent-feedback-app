import React, { useState } from 'react';
import '../assets/styles.css';
import { auth, db } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

function Register() {
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      MySwal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: 'Passwords do not match.',
        showConfirmButton: false,
        timer: 3000,
      });
      return;
    }

    if (email === 'admin@gmail.com' && password === 'admin123') {
      MySwal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: 'Admin account is predefined. Please login instead.',
        showConfirmButton: false,
        timer: 3000,
      });
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Save user data to Firestore using the uid as the document ID
      await setDoc(doc(db, 'users', uid), {
        uid: uid,
        firstName: firstName,
        surname: surname,
        fullName: `${firstName} ${surname}`,
        idNumber: idNumber,
        email: email,
        createdAt: Timestamp.now(),
      });

      MySwal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Registration successful!',
        showConfirmButton: false,
        timer: 3000,
      });

      navigate('/login');
    } catch (error) {
      MySwal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: 'Registration failed: ' + error.message,
        showConfirmButton: false,
        timer: 3000,
      });
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <form onSubmit={handleRegister}>
          <div className="input-group">
            <img src="/images/user.png" alt="User Icon" className="input-icon" />
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <img src="/images/user.png" alt="Surname Icon" className="input-icon" />
            <input
              type="text"
              placeholder="Surname"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <img src="/images/user.png" alt="ID Icon" className="input-icon" />
            <input
              type="text"
              placeholder="ID Number"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <img src="/images/email.png" alt="Email Icon" className="input-icon" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <img src="/images/password.png" alt="Password Icon" className="input-icon" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <img src="/images/password.png" alt="Confirm Password Icon" className="input-icon" />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Register</button>
          <div className="form-links">
            <a href="/login">Already have an account? Login</a>
          </div>
        </form>
      </div>

      <div className="image-container">
        <div className="logo-wrapper">
          <img src="/images/logo.png" alt="ADVENT Logo" className="logo-img" />
          <h1 className="brand">ADVENT</h1>
          <hr />
          <p className="tagline">BETTER EVENTS START WITH BETTER FEEDBACK</p>
        </div>
      </div>
    </div>
  );
}

export default Register;
