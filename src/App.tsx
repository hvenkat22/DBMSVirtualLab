import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from "react";
import Navbar from './components/Navbar';
import Homepage from './pages/Homepage';
import Theory from './pages/Theory1';
import Practice from './pages/Practice';
import Playground from './pages/Playground';
import Register from './pages/Register';
import Login from './pages/Login';


export default function App() {
  const [user, setUser] = useState<string | null>(localStorage.getItem("user"));

  useEffect(() => {
    const handleStorageChange = () => setUser(localStorage.getItem("user"));
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <Router>
      <Navbar user={user} setUser={setUser} />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/theory" element={<Theory />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/playground" element={<Playground />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}