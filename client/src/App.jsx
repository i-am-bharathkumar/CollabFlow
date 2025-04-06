import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Auth
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

// Dashboard
import Dashboard from './components/Dashboard/Dashboard';
import DocumentForm from './components/Dashboard/DocumentForm';
import DocumentDetails from './components/Dashboard/DocumentDetails';

// Layout
import Navbar from './components/Layout/Navbar';
import About from './components/pages/About';

// Landing
import LandingPage from './components/Landing/Landing';
import Features from './components/Landing/Features';

// Features
import LiveChat from './components/Features/LiveChat';
import SimultaneousEditing from './components/Features/SimultaneousEditing';
import TaskManagement from './components/Features/TaskManagement';
import VersionControl from './components/Features/VersionControl';
import VideoConferencing from './components/Features/VideoConferencing';
import WorkflowAutomation from './components/Features/WorkflowAutomation';
import Profile from './components/Profile/Profile';

function App() {
    return (
        <Router>
            <Navbar />
            <Routes>
                {/* Landing */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/features" element={<Features />} />

                {/* Auth */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/about" element={<About />} />
                

                {/* Dashboard */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/document/:id" element={<DocumentDetails />} />
                <Route path="/document/new" element={<DocumentForm />} />

                {/* Features */}
                <Route path="/live-chat" element={<LiveChat />} />
                <Route path="/simultaneous-editing" element={<SimultaneousEditing />} />
                <Route path="/task-management" element={<TaskManagement />} />
                <Route path="/version-control" element={<VersionControl />} />
                <Route path="/video-conferencing" element={<VideoConferencing />} />
                <Route path="/workflow-automation" element={<WorkflowAutomation />} />
            </Routes>
        </Router>
    );
}

export default App;
