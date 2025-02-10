import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Homepage from './pages/Homepage';
import Theory from './pages/Theory1';
import Practice from './pages/Practice';
import Playground from './pages/Playground';

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/theory" element={<Theory />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/playground" element={<Playground />} />
      </Routes>
    </Router>
  );
}