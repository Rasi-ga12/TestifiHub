
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Pages
import Index from './pages/Index';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Assessments from './pages/Assessments';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import TakeAssessment from './pages/TakeAssessment';
import CodeGenerator from './pages/CodeGenerator';
import Feedback from './pages/Feedback';
import Preview from './pages/Preview';
import { Toaster } from './components/ui/toaster';
import ForgotPassword from './pages/ForgotPassword';


const App: React.FC = () => {
  return (
    <Router>
       <Toaster />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/assessments" element={<Assessments />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/take-assessment/:id" element={<TakeAssessment />} />
        <Route path="/preview-assessment/:id" element={<Preview />} />
        <Route path="/code-generator" element={<CodeGenerator />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
