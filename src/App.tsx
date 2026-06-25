import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TopNavBar } from './components/TopNavBar';
import HomePage from './Pages/HomePage';
import AboutPage from './Pages/AboutPage';
import ServicesPage from './Pages/ServicesPage';
import EResourcesPage from './Pages/EResourcesPage';
import { FacebookBubble } from './components/FacebookBubble';
import { FeedbackStickyCard } from './components/FeedbackStickyCard';
import { RizalAssistant } from './components/RizalAssistant';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <BrowserRouter>
      <TopNavBar />
      <FacebookBubble />
      <FeedbackStickyCard />
      <RizalAssistant />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/e-resources" element={<EResourcesPage />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}
