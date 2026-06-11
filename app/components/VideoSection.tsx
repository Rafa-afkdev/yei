'use client';

import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Pause, Play, Volume2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

gsap.registerPlugin(ScrollTrigger);

export default function VideoSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const isInView = useInView(containerRef, { once: false, margin: "-50%" });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animación del contenedor de video
      gsap.fromTo(".video-container",
        { scale: 0.8, opacity: 0, rotationY: -15 },
        {
          scale: 1,
          opacity: 1,
          rotationY: 0,
          duration: 1.5,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".video-container",
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );

      // Animación de los elementos flotantes
      gsap.to(".floating-element", {
        y: -30,
        rotation: 360,
        duration: 4,
        ease: "power1.inOut",
        stagger: 0.5,
        repeat: -1,
        yoyo: true
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <motion.div 
      id="demo"
      ref={containerRef}
      style={{ scale }}
      className="py-20 px-6 bg-gradient-to-b from-black via-slate-900 to-black relative overflow-hidden"
    >
      {/* Fondo con efectos visuales */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-radial from-purple-900/20 via-transparent to-transparent"></div>
        
        {/* Elementos flotantes decorativos */}
        {[
          { left: '20%', top: '15%', duration: 4, delay: 0 },
          { left: '75%', top: '25%', duration: 5, delay: 1 },
          { left: '15%', top: '70%', duration: 3.5, delay: 0.5 },
          { left: '85%', top: '60%', duration: 4.5, delay: 1.5 },
          { left: '45%', top: '20%', duration: 3, delay: 2 },
          { left: '65%', top: '80%', duration: 4, delay: 0.2 },
          { left: '30%', top: '85%', duration: 3.5, delay: 1.8 },
          { left: '80%', top: '30%', duration: 5, delay: 0.8 }
        ].map((circle, i) => (
          <motion.div
            key={i}
            className="floating-element absolute w-20 h-20 border border-purple-400/30 rounded-full"
            style={{
              left: circle.left,
              top: circle.top,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: circle.duration,
              repeat: Infinity,
              delay: circle.delay,
            }}
          />
        ))}
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Título de sección */}
        <motion.div 
          style={{ y }}
          className="text-center mb-16"
        >
          <motion.h2 
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-5xl md:text-6xl font-black text-white mb-6"
          >
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Experiencia
            </span>
            <br />
            <span className="text-white">Inmersiva</span>
          </motion.h2>
          <motion.p 
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl text-gray-300 max-w-3xl mx-auto"
          >
            Descubre el poder de Yei Project en acción. Una demostración que cambiará tu perspectiva sobre la gestión empresarial.
          </motion.p>
        </motion.div>

        {/* Contenedor de video principal */}
        <motion.div 
          className="video-container relative group cursor-pointer"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
          onClick={toggleVideo}
        >
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            {/* Placeholder para video - usando gradiente animado */}
            <div className="relative aspect-video bg-gradient-to-br from-purple-900 via-blue-900 to-cyan-900 flex items-center justify-center">
              {/* Efecto de video simulado */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 animate-pulse"></div>
              
              {/* Contenido del "video" */}
              <div className="relative z-10 text-center">
                <motion.div
                  animate={{ 
                    scale: isInView ? [1, 1.1, 1] : 1,
                    rotate: isInView ? [0, 5, -5, 0] : 0 
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="mb-8"
                >
                  <div className="w-32 h-32 mx-auto bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-6xl font-black text-white shadow-2xl">
                    YEI
                  </div>
                </motion.div>
                
                <h3 className="text-3xl font-bold text-white mb-4">
                  Sistema de Inventario del Futuro
                </h3>
                <p className="text-gray-300 text-lg max-w-md mx-auto">
                  Gestión inteligente, análisis predictivo y automatización total
                </p>
              </div>

              {/* Overlay de interacción */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center border-2 border-white/30"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 text-white ml-1" />
                  ) : (
                    <Play className="w-8 h-8 text-white ml-1" />
                  )}
                </motion.div>
              </div>
            </div>

            {/* Efectos de brillo */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
          </div>

          {/* Controles de video estilizados */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 flex items-center justify-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                toggleVideo();
              }}
              className="flex items-center gap-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full px-6 py-3 text-white hover:bg-white/20 transition-all duration-300"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              <span className="font-medium">
                {isPlaying ? 'Pausar' : 'Reproducir'} Demo
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-12 h-12 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300"
            >
              <Volume2 className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Estadísticas de video */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
        >
          {[
            { number: "2:30", label: "Duración" },
            { number: "4K", label: "Calidad" },
            { number: "∞", label: "Posibilidades" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5 }}
              className="p-6 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 hover:border-cyan-400/50 transition-all duration-300"
            >
              <div className="text-4xl font-black text-cyan-400 mb-2">{stat.number}</div>
              <div className="text-gray-300 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
