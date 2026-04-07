import React, { useRef } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import ScrollColorTransition from "./components/ScrollColorTransition";
import FeatureRow from "./components/FeatureRow";
import WhySection from "./components/WhySection";
import FeatureGrid from "./components/FeatureGrid";
import FAQSection from "./components/FAQSection";
import WaitlistCTA from "./components/WaitlistCTA";
import Footer from "./components/Footer";

const Home = () => {
  const heroFormRef = useRef(null);

  const scrollToForm = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
  setTimeout(() => {
    const input = heroFormRef.current?.querySelector("input");
    if (input) input.focus();
  }, 600);
};

  return (
    <div className="min-h-screen">
      <Navbar onJoinClick={scrollToForm} />
      <HeroSection formRef={heroFormRef} />
      {/* All sections below the hero sit in a stacking layer above the fixed
          particle canvas (z-index:0), so they always paint over it cleanly. */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <ScrollColorTransition>
          <FeatureRow />
        </ScrollColorTransition>
        <WhySection />
        <FeatureGrid />
        <WaitlistCTA />
        <FAQSection />
        <Footer />
      </div>
    </div>
  );
};

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
