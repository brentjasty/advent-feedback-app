import React, { useState } from 'react';
import '../assets/styles.css';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { collection, getDocs, query, where } from 'firebase/firestore';

const MySwal = withReactContent(Swal);

function Login() {
  const [idNumber, setIdNumber] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // Check if admin
    if (idNumber === 'admin' && password === 'admin123') {
      MySwal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Admin login successful!',
        showConfirmButton: false,
        timer: 3000
      });
      navigate('/admin/dashboard');
      return;
    }

    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('idNumber', '==', idNumber));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('ID Number not found');
      }

      const userData = querySnapshot.docs[0].data();
      await signInWithEmailAndPassword(auth, userData.email, password);

      MySwal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Login successful!',
        showConfirmButton: false,
        timer: 3000
      });

      navigate('/user/dashboard');
    } catch (error) {
      MySwal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: `Login Failed: ${error.message}`,
        showConfirmButton: false,
        timer: 3000
      });
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <form onSubmit={handleLogin}>
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
            <img src="/images/password.png" alt="Password Icon" className="input-icon" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Login</button>
          <div className="form-links">
            <a href="#">Forgot Password?</a> | <a href="/register">Register</a>
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

export default Login;
