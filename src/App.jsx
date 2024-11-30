import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AddItem from './components/AddItem';
import AdminPannel from './components/AdminPannel';
import Home from './components/Home';
import Login from './components/Login';
import { auth } from './components/Firebase';
import BackgroundVideo from './components/BackgroundVideo';
import ProfileVideo from './components/ProfileVideo';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showHome, setShowHome] = useState(true);

  // Firebase authentication state listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  const ProtectedRoute = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/login" />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<ProtectedRoute element={<AdminPannel />} />} />
        <Route path="/addItem" element={<ProtectedRoute element={<AddItem />} />} />
        <Route path="/BackgroundVideo" element={<ProtectedRoute element={<ProfileVideo />} />} />
      </Routes>
      <div>
        {showHome && <Home />}
        <BackgroundVideo onShowHome={setShowHome} />
      </div>
    </Router>
  );
}

export default App;
