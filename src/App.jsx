import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AddItem from "./components/AddItem";
import AdminPannel from "./components/AdminPannel";
import Home from "./components/Home";
import Login from "./components/Login";
import { auth } from './components/Firebase';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Firebase authentication state listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsAuthenticated(true);  // User is logged in
      } else {
        setIsAuthenticated(false); // User is not logged in
      }
    });

    return () => unsubscribe();  // Cleanup listener on unmount
  }, []);

  // ProtectedRoute component to handle route protection
  const ProtectedRoute = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/login" />;  // Redirect to login if not authenticated
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route path="/admin" element={<ProtectedRoute element={<AdminPannel />} />} />
        <Route path="/addItem" element={<ProtectedRoute element={<AddItem />} />} />
      </Routes>
    </Router>
  );
}

export default App;
