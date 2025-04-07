import React from 'react';
import { Link } from 'react-router-dom';
import './LandingStyles.css';

const isLoggedIn = !!localStorage.getItem('token'); // or 'user' or whatever you're storing

const Landing = () => {
    return (
        <div className="landing-container">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-6 hero-content fade-in">
                            <h1 className="display-4">Welcome to CollabFlow</h1>
                            <p className="lead">
                                CollabFlow is your go-to platform for seamless real-time collaboration. 
                                Work together on documents, share ideas, and communicate effortlessly with your team.
                            </p>
                            <div className="cta-buttons">
                                <Link to="/register" className="btn btn-primary btn-lg me-3 btn-animated">Get Started</Link>
                                <Link to="/login" className="btn btn-outline-secondary btn-lg">Login</Link>
                            </div>
                        </div>
                        <div className="col-lg-6 hero-image fade-in delay-2">
                            <img src="https://media.istockphoto.com/id/1077988578/photo/theyve-struck-a-big-deal.jpg?s=612x612&w=0&k=20&c=_hkZQN7THjkl6GcbQXtjAUVGcg9a94EJliYtwHEXuU0=" 
                            alt="Collaboration illustration" className="img-fluid floating" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section bg-light py-5">
                <div className="container">
                    <div className="row text-center">
                        <div className="col-md-4 mb-4 mb-md-0 fade-in delay-1">
                            <div className="stat-card">
                                <i className="fas fa-users stat-icon"></i>
                                <h3 className="stat-number count-up">10,000+</h3>
                                <p className="stat-label">Active Teams</p>
                            </div>
                        </div>
                        <div className="col-md-4 mb-4 mb-md-0 fade-in delay-2">
                            <div className="stat-card">
                                <i className="fas fa-file-alt stat-icon"></i>
                                <h3 className="stat-number count-up">500,000+</h3>
                                <p className="stat-label">Documents Created</p>
                            </div>
                        </div>
                        <div className="col-md-4 fade-in delay-3">
                            <div className="stat-card">
                                <i className="fas fa-clock stat-icon"></i>
                                <h3 className="stat-number count-up">2M+</h3>
                                <p className="stat-label">Hours Saved</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="how-it-works-section py-5">
                <div className="container">
                    <div className="row justify-content-center mb-5">
                        <div className="col-lg-8 text-center fade-in">
                            <h2 className="section-title">How CollabFlow Works</h2>
                            <p className="section-description">
                                Our simple yet powerful workflow makes collaboration effortless
                            </p>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-4 mb-4 mb-md-0 text-center fade-in delay-1">
                            <div className="step-card">
                                <div className="step-number">1</div>
                                <i className="fas fa-user-plus step-icon"></i>
                                <h4>Create Your Workspace</h4>
                                <p>Sign up and create a dedicated workspace for your team or project</p>
                            </div>
                        </div>
                        <div className="col-md-4 mb-4 mb-md-0 text-center fade-in delay-2">
                            <div className="step-card">
                                <div className="step-number">2</div>
                                <i className="fas fa-user-friends step-icon"></i>
                                <h4>Invite Your Team</h4>
                                <p>Bring your colleagues onboard with simple email invitations</p>
                            </div>
                        </div>
                        <div className="col-md-4 text-center fade-in delay-3">
                            <div className="step-card">
                                <div className="step-number">3</div>
                                <i className="fas fa-rocket step-icon"></i>
                                <h4>Start Collaborating</h4>
                                <p>Edit documents, chat, and manage tasks all in one platform</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="testimonials-section bg-light py-5">
                <div className="container">
                    <div className="row justify-content-center mb-5">
                        <div className="col-lg-8 text-center fade-in">
                            <h2 className="section-title">What Our Users Say</h2>
                            <p className="section-description">
                                Join thousands of satisfied teams around the world
                            </p>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-4 mb-4 mb-md-0 fade-in slide-up">
                            <div className="testimonial-card">
                                <div className="testimonial-text">
                                    <i className="fas fa-quote-left quote-icon"></i>
                                    <p>CollabFlow has transformed how our design team works together. The simultaneous editing feature is a game-changer!</p>
                                </div>
                                <div className="testimonial-author">
                                    <div className="testimonial-avatar">
                                        <i className="fas fa-user-circle"></i>
                                    </div>
                                    <div className="testimonial-info">
                                        <h5>Sarah Johnson</h5>
                                        <p>Design Director, CreativeCo</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 mb-4 mb-md-0 fade-in slide-up delay-1">
                            <div className="testimonial-card">
                                <div className="testimonial-text">
                                    <i className="fas fa-quote-left quote-icon"></i>
                                    <p>Our remote team finally feels connected. The video conferencing and task management tools are simple yet powerful.</p>
                                </div>
                                <div className="testimonial-author">
                                    <div className="testimonial-avatar">
                                        <i className="fas fa-user-circle"></i>
                                    </div>
                                    <div className="testimonial-info">
                                        <h5>Michael Chen</h5>
                                        <p>Project Manager, TechFirm</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4 fade-in slide-up delay-2">
                            <div className="testimonial-card">
                                <div className="testimonial-text">
                                    <i className="fas fa-quote-left quote-icon"></i>
                                    <p>The workflow automation has saved us countless hours. Setting up our approval processes took minutes, not days.</p>
                                </div>
                                <div className="testimonial-author">
                                    <div className="testimonial-avatar">
                                        <i className="fas fa-user-circle"></i>
                                    </div>
                                    <div className="testimonial-info">
                                        <h5>Elena Rodriguez</h5>
                                        <p>Operations Lead, AgileStartup</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-8 text-center">
                            <h2 className="mb-4 fade-in">Ready to transform how your team works?</h2>
                            <p className="mb-5 fade-in delay-1">Join thousands of teams boosting their productivity with CollabTool.</p>
                            <div className="fade-in delay-2">
                                <Link to="/register" className="btn btn-light btn-lg btn-cta me-3">Start For Free</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Landing;