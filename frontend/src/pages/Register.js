import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/school-logo.png';
import api from '../utils/api';

function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const navigate = useNavigate();

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword)
            return alert("Passwords don't match");

        try {
            const res = await api.post('/auth/register', formData);
            alert(res.data.msg); // Success message (e.g. "Please check your email")
            navigate('/login');
        } catch (err) {
            const msg =
                err.response?.data?.msg || err.response?.data?.error || 'Registration failed';
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
                    <i className="fas fa-user" />
                    <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        required
                        onChange={handleChange}
                    />
                </div>
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
                <div className="input-group">
                    <i className="fas fa-lock" />
                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        required
                        onChange={handleChange}
                    />
                </div>
                <button type="submit">Register</button>
                <div className="auth-links">
                    <Link to="/login">Already have an account?</Link>
                </div>
            </form>
        </div>
    );
}

export default Register;
