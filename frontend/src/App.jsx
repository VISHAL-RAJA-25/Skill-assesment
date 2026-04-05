import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import TestEngine from './pages/TestEngine';
import Results from './pages/Results';
import History from './pages/History';
import QuestionReview from './pages/Questionreview';
import Progress from './pages/progress';
import AdminPanel from './pages/adminpanel';

function PrivateRoute({ children }) {
  return localStorage.getItem('token') ? children : <Navigate to="/" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/test/:topic/:difficulty" element={<PrivateRoute><TestEngine /></PrivateRoute>} />
        <Route path="/results" element={<PrivateRoute><Results /></PrivateRoute>} />
        <Route path="/review" element={<PrivateRoute><QuestionReview /></PrivateRoute>} />
        <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
        <Route path="/progress" element={<PrivateRoute><Progress /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute><AdminPanel /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}