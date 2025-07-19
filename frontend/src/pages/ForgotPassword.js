import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/school-logo.png';
import api from '../utils/api';

function ForgotPassword() {
    const [email, setEmail] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/forgot-password', { email });
            alert(res.data.msg); // Success message
        } catch (err) {
            const msg =
                err.response?.data?.msg || err.response?.data?.error || 'Request failed';
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
                        placeholder="Enter your email"
                        required
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <button type="submit">Send Reset Link</button>
                <div className="auth-links">
                    <Link to="/login">Back to login</Link>
                </div>
            </form>
        </div>
    );
}

export default ForgotPassword;
