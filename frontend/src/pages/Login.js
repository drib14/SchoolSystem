import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/school-logo.png';
import api from '../utils/api';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', formData);
      const { token, user } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      navigate('/');
    } catch (err) {
      const msg =
        err.response?.data?.msg || err.response?.data?.error || 'Login failed';
      alert(msg);
    }
  };

  return (
    <div className="auth-container">
      <div className="logo-wrap">
        <img src={logo} alt="logo" className="logo-img" />
        <h1 className="logo-text">ISCP</h1>
      </div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <i className="fas fa-envelope" />
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            onChange={handleChange}
          />
        </div>
        <div className="input-group">
          <i className="fas fa-lock" />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            onChange={handleChange}
          />
        </div>
        <button type="submit">Login</button>
        <div className="auth-links">
          <Link to="/register">Create an account</Link>
          <Link to="/forgot-password">Forgot password?</Link>
        </div>
      </form>
    </div>
  );
}

export default Login;
