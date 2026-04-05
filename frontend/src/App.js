import React, { useRef } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import FeatureRow from "./components/FeatureRow";
import WhySection from "./components/WhySection";
import FeatureGrid from "./components/FeatureGrid";
import WaitlistCTA from "./components/WaitlistCTA";
import Footer from "./components/Footer";

const Home = () => {
  const heroFormRef = useRef(null);

  const scrollToForm = () => {
    if (heroFormRef.current) {
      heroFormRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      // Focus the input after scroll
      setTimeout(() => {
        const input = heroFormRef.current.querySelector("input");
        if (input) input.focus();
      }, 600);
    }
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      <Navbar onJoinClick={scrollToForm} />
      <HeroSection formRef={heroFormRef} />
      <FeatureRow />
      <WhySection />
      <FeatureGrid />
      <WaitlistCTA />
      <Footer />
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
