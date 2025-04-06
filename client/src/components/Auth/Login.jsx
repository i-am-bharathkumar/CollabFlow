// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import './AuthStyles.css';

// const Login = () => {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [error, setError] = useState(''); 
//     const navigate = useNavigate();

//     const handleLogin = async (e) => {
//         e.preventDefault();
//         try {
//             const { data } = await axios.post('http://localhost:5000/api/auth/login', { email, password });

//             // Save user data in local storage
//             console.log(data.username)
//             localStorage.setItem('user', JSON.stringify({ username: data.username, token: data.token }));

//             // Navigate to dashboard
//             navigate('/dashboard');
//         } catch (error) {
//             if (error.response && error.response.data && error.response.data.message) {
//                 setError(error.response.data.message); 
//                 navigate('/login');
//             } else {
//                 setError('An unexpected error occurred. Please try again later.');
//                 navigate('/login');
//             }
//         }
//     };

//     return (
//         <div className="container">
//             <h2>Login</h2>
//             <form onSubmit={handleLogin}>
//                 <div className="mb-3">
//                     <label htmlFor="email" className="form-label">Email address</label>
//                     <input type="email" className="form-control" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
//                 </div>
//                 <div className="mb-3">
//                     <label htmlFor="password" className="form-label">Password</label>
//                     <input type="password" className="form-control" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
//                 </div>
//                 <button type="submit" className="btn btn-primary">Login</button>
//             </form>
//             {error && <p className="text-danger mt-3">{error}</p>} {/* Display error message */}
//             <p>Don't have an account? <a href="/register">Register</a></p>
//         </div>
//     );
// };

// export default Login;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AuthStyles.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post('http://localhost:5000/api/auth/login', { email, password });

            // Save user data in local storage
            localStorage.setItem('user', JSON.stringify({ username: data.username, token: data.token }));

            // Navigate to dashboard
            navigate('/dashboard');
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                setError(error.response.data.message);
            } else {
                setError('An unexpected error occurred. Please try again later.');
            }
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>
                        <span className="icon-space">
                            <i className="fas fa-sign-in-alt"></i>
                        </span>
                        Login
                    </h2>
                    <p>Enter your credentials to access your account</p>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form className="auth-form" onSubmit={handleLogin}>
                    <div className="form-group">
                        <div className="input-group">
                            <div className="input-icon">
                                <i className="fas fa-envelope"></i>
                            </div>
                            <input 
                                type="email" 
                                placeholder="Email address" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="input-group">
                            <div className="input-icon">
                                <i className="fas fa-lock"></i>
                            </div>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="Password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                            />
                            <div className="password-toggle" onClick={togglePasswordVisibility}>
                                <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                            </div>
                        </div>
                    </div>

                    <div className="form-options">
                        <div className="remember-me">
                            <input type="checkbox" id="remember" />
                            <label htmlFor="remember">Remember me</label>
                        </div>
                        <div className="forgot-password">
                            <button type="button" className="link-button">Forgot password?</button>
                        </div>
                    </div>

                    <button type="submit" className="auth-button">
                        Login
                    </button>
                </form>

                <div className="auth-footer">
                    Don't have an account? <a href="/register">Register now</a>
                </div>
            </div>
        </div>
    );
};

export default Login;