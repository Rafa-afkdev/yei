'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect } from 'react';
import Features from './components/Features';
import Footer from './components/Footer';
import Hero from './components/Hero';
import Navigation from './components/Navigation';
import VideoSection from './components/VideoSection';

// Registrar plugins de GSAP
gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  useEffect(() => {
    // Configuración global de GSAP para un scroll suave
    gsap.config({
      force3D: true,
      nullTargetWarn: false
    });

    // Configurar ScrollTrigger
    ScrollTrigger.config({
      autoRefreshEvents: "visibilitychange,DOMContentLoaded,load"
    });

    // Refresh ScrollTrigger después de que la página se carga completamente
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    return () => {
      // Cleanup
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      ScrollTrigger.clearMatchMedia();
    };
  }, []);

  return (
    <main className="relative overflow-x-hidden">
      <Navigation />
      
      <Hero />
      
      
      <Features />
      
      
      <VideoSection />
      
     
      <Footer />
    </main>
  );
}
