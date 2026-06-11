'use client';

import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BarChart3, Package, TrendingUp, Zap } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const floatingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animación de entrada épica
      const tl = gsap.timeline();
      
      tl.fromTo(titleRef.current, 
        { y: 100, opacity: 0, scale: 0.8 },
        { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: "power3.out" }
      )
      .fromTo(subtitleRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
        "-=0.6"
      )
      .fromTo(ctaRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
        "-=0.4"
      );

      // Elementos flotantes
      gsap.to(floatingRef.current?.children || [], {
        y: -20,
        duration: 2,
        ease: "power1.inOut",
        stagger: 0.2,
        repeat: -1,
        yoyo: true
      });

      // Parallax scroll
      gsap.to(heroRef.current, {
        yPercent: -50,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div id="home" ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-80 pb-20">
      {/* Fondo animado */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/api/placeholder/1920/1080')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-emerald-600/20 animate-gradient-x"></div>
        
        {/* Partículas flotantes - posiciones fijas para evitar hidratación */}
        <div ref={floatingRef} className="absolute inset-0">
          {[
            { left: 10, top: 20 },
            { left: 80, top: 15 },
            { left: 25, top: 70 },
            { left: 60, top: 40 },
            { left: 45, top: 85 },
            { left: 15, top: 50 },
            { left: 90, top: 75 },
            { left: 35, top: 25 },
            { left: 70, top: 60 },
            { left: 20, top: 90 },
            { left: 85, top: 30 },
            { left: 50, top: 10 },
            { left: 5, top: 65 },
            { left: 75, top: 45 },
            { left: 40, top: 80 },
            { left: 95, top: 55 },
            { left: 30, top: 35 },
            { left: 65, top: 95 },
            { left: 55, top: 5 },
            { left: 12, top: 75 }
          ].map((particle, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full opacity-20"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 3 + (i % 3),
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>

      {/* Contenido principal */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        transition={{
          staggerChildren: 0.1,
          delayChildren: 0.3
        }}
        className="relative z-10 text-center px-6 max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-20rem)]"
      >
        <motion.div ref={titleRef} variants={itemVariants}>
          <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              YEI
            </span>
            <br />
            <span className="text-white">PROJECT</span>
          </h1>
        </motion.div>

        <motion.div ref={subtitleRef} variants={itemVariants}>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            El sistema de <span className="text-purple-400 font-semibold">inventario y ventas</span>. Transformamos tu negocio con tecnología.
          </p>
        </motion.div>

        <motion.div ref={ctaRef} variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(168, 85, 247, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-2xl hover:shadow-purple-500/25 transition-all duration-300"
          >
            <span className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              <Link href="/auth">
                Comenzar Ahora
              </Link>
            </span>
          </motion.button>
          
          {/* <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="border-2 border-purple-400 text-purple-400 px-8 py-4 rounded-full font-semibold text-lg hover:bg-purple-400 hover:text-white transition-all duration-300"
          >
            Ver Demo
          </motion.button> */}
        </motion.div>

        {/* Iconos flotantes */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
          {[
            { icon: Package, label: "Inventario", color: "from-blue-400 to-cyan-400" },
            { icon: BarChart3, label: "Reportes", color: "from-purple-400 to-pink-400" },
            { icon: TrendingUp, label: "Ventas", color: "from-emerald-400 to-blue-400" },
            { icon: Zap, label: "Velocidad", color: "from-yellow-400 to-orange-400" }
          ].map((item, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -10, scale: 1.1 }}
              className="flex flex-col items-center p-6 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 hover:border-purple-400/50 transition-all duration-300"
            >
              <div className={`p-4 rounded-full bg-gradient-to-r ${item.color} mb-3`}>
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-white font-medium">{item.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Indicador de scroll */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
        </div>
      </motion.div>
    </div>
  );
}
