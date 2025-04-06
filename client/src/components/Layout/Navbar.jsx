import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './LayoutStyles.css';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    
    // Handle scroll effect for navbar
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        // Add animation before logout
        const navElement = document.querySelector('.navbar');
        navElement.classList.add('fade-out');
        
        setTimeout(() => {
            localStorage.removeItem('user');
            navigate('/');
            navElement.classList.remove('fade-out');
        }, 300);
    };

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    return (
        <nav className={`navbar navbar-expand-lg navbar-custom ${scrolled ? 'scrolled' : ''}`}>
            <div className="container">
                <Link className="navbar-brand brand" to={user ? '/' : '/'}>
                    <span className="brand-text">CollabFlow</span>
                </Link>
                
                <button 
                    className={`navbar-toggler ${menuOpen ? 'active' : ''}`} 
                    type="button" 
                    onClick={toggleMenu}
                    aria-expanded={menuOpen ? 'true' : 'false'}
                    aria-label="Toggle navigation"
                >
                    <span className="toggler-icon"></span>
                    <span className="toggler-icon"></span>
                    <span className="toggler-icon"></span>
                </button>
                
                <div className={`collapse navbar-collapse ${menuOpen ? 'show' : ''}`}>
                    <ul className="navbar-nav me-auto">
                       
                        <li className="nav-item">
                            <Link className={`nav-link ${isActive('/features')}`} to="/features">Features</Link>
                        </li>
                        <li className="nav-item">
                            <Link className={`nav-link ${isActive('/about')}`} to="/about">About</Link>
                        </li>
                        <li className="nav-item">
                            <Link className={`nav-link ${isActive('/dashboard')}`} to="/dashboard">Dashboard</Link>
                        </li>
                    </ul>
                    
                    {user ? (
                        <ul className="navbar-nav">
                            <li className="nav-item dropdown">
                                <a 
                                    className="nav-link dropdown-toggle nav-profile-dropdown" 
                                    href="#" 
                                    id="navbarDropdown" 
                                    role="button" 
                                    data-bs-toggle="dropdown" 
                                    aria-expanded="false"
                                >
                                    <div className="avatar-circle">
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="ms-2">{user.username}</span>
                                </a>
                                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                                    <li>
                                        <Link className="dropdown-item" to="/profile">
                                            <i className="fas fa-user-circle me-2"></i> Profile
                                        </Link>
                                    </li>
                                    <li>
                                        <Link className="dropdown-item" to="/settings">
                                            <i className="fas fa-cog me-2"></i> Settings
                                        </Link>
                                    </li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li>
                                        <button className="dropdown-item" onClick={handleLogout}>
                                            <i className="fas fa-sign-out-alt me-2"></i> Logout
                                        </button>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    ) : (
                        <ul className="navbar-nav">
                            <li className="nav-item">
                                <Link className="nav-link btn-animated" to="/login">Login</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link btn btn-primary sign-up-btn" to="/register">Register</Link>
                            </li>
                        </ul>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;