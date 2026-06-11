'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  BarChart3,
  Clock,
  Package,
  Rocket,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import { useEffect, useRef } from 'react';

gsap.registerPlugin(ScrollTrigger);

export default function Features() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animación de las tarjetas al hacer scroll
      gsap.fromTo(".feature-card",
        { y: 100, opacity: 0, scale: 0.8 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".features-grid",
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );

      // Animación del título principal
      gsap.fromTo(".features-title",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".features-title",
            start: "top 90%"
          }
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const features = [
    {
      icon: Package,
      title: "Gestión de Inventario",
      description: "Control total de tu stock en tiempo real con alertas inteligentes y predicciones de demanda.",
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-500/10 to-cyan-500/10"
    },
    {
      icon: BarChart3,
      title: "Reportes Avanzados",
      description: "Analítica profunda con visualizaciones interactivas y insights accionables para tu negocio.",
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-500/10 to-pink-500/10"
    },
    {
      icon: TrendingUp,
      title: "Optimización de Ventas",
      description: "Maximiza tus ingresos con recomendaciones IA y estrategias de pricing dinámico.",
      gradient: "from-emerald-500 to-teal-500",
      bgGradient: "from-emerald-500/10 to-teal-500/10"
    },
    {
      icon: Zap,
      title: "Velocidad Extrema",
      description: "Procesamiento ultrarrápido que escala con tu negocio sin comprometer el rendimiento.",
      gradient: "from-yellow-500 to-orange-500",
      bgGradient: "from-yellow-500/10 to-orange-500/10"
    },
    {
      icon: Shield,
      title: "Seguridad Total",
      description: "Protección de datos de nivel empresarial con encriptación end-to-end y backups automáticos.",
      gradient: "from-red-500 to-pink-500",
      bgGradient: "from-red-500/10 to-pink-500/10"
    },
    {
      icon: Users,
      title: "Colaboración",
      description: "Trabajo en equipo fluido con permisos granulares y comunicación integrada.",
      gradient: "from-indigo-500 to-purple-500",
      bgGradient: "from-indigo-500/10 to-purple-500/10"
    }
  ];

  const stats = [
    { number: "99.9%", label: "Uptime", icon: Clock },
    { number: "10x", label: "Más Rápido", icon: Rocket },
    { number: "500K+", label: "Transacciones/día", icon: Target },
    { number: "100%", label: "Seguro", icon: Shield }
  ];

  // Posiciones fijas predefinidas para evitar problemas de hidratación
  const particlePositions = [
    { left: '15%', top: '20%', duration: 3, delay: 0 },
    { left: '85%', top: '15%', duration: 4, delay: 1 },
    { left: '25%', top: '80%', duration: 3.5, delay: 2 },
    { left: '75%', top: '85%', duration: 2.5, delay: 0.5 },
    { left: '45%', top: '25%', duration: 4.5, delay: 1.5 },
    { left: '65%', top: '70%', duration: 3, delay: 3 },
    { left: '10%', top: '60%', duration: 3.5, delay: 2.5 },
    { left: '90%', top: '45%', duration: 4, delay: 1 },
    { left: '35%', top: '90%', duration: 2.5, delay: 4 },
    { left: '55%', top: '10%', duration: 3.5, delay: 0.5 },
    { left: '20%', top: '40%', duration: 4, delay: 2 },
    { left: '80%', top: '65%', duration: 3, delay: 1.5 },
    { left: '5%', top: '30%', duration: 3.5, delay: 3.5 },
    { left: '95%', top: '75%', duration: 2.5, delay: 0 },
    { left: '50%', top: '50%', duration: 4, delay: 2.5 },
    { left: '30%', top: '5%', duration: 3, delay: 4 },
    { left: '70%', top: '95%', duration: 3.5, delay: 1.5 },
    { left: '15%', top: '75%', duration: 4, delay: 0.5 },
    { left: '85%', top: '35%', duration: 2.5, delay: 3 },
    { left: '40%', top: '60%', duration: 3.5, delay: 2 },
    { left: '60%', top: '20%', duration: 3, delay: 4.5 },
    { left: '25%', top: '45%', duration: 4, delay: 1 },
    { left: '75%', top: '55%', duration: 3.5, delay: 2.5 },
    { left: '10%', top: '85%', duration: 2.5, delay: 0 },
    { left: '90%', top: '10%', duration: 3, delay: 3 },
    { left: '45%', top: '80%', duration: 4, delay: 1.5 },
    { left: '65%', top: '25%', duration: 3.5, delay: 4 },
    { left: '35%', top: '70%', duration: 3, delay: 0.5 },
    { left: '55%', top: '35%', duration: 2.5, delay: 2.5 },
    { left: '20%', top: '90%', duration: 4, delay: 3.5 }
  ];

  return (
    <motion.div 
      id="features"
      ref={containerRef}
      style={{ opacity }}
      className="py-20 px-6 bg-gradient-to-b from-slate-900 to-black relative overflow-hidden"
    >
      {/* Fondo con partículas animadas */}
      <div className="absolute inset-0">
        {particlePositions.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full"
            style={{
              left: particle.left,
              top: particle.top,
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Título de sección */}
        <motion.div 
          style={{ y }}
          className="text-center mb-16 features-title"
        >
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Características
            </span>
            <br />
            <span className="text-white">Revolucionarias</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Tecnología de vanguardia que transforma la manera en que gestionas tu inventario y ventas
          </p>
        </motion.div>

        {/* Grid de características */}
        <div className="features-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="feature-card group relative"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <div className={`relative p-8 rounded-3xl bg-gradient-to-br ${feature.bgGradient} backdrop-blur-lg border border-white/10 hover:border-purple-400/50 transition-all duration-500 h-full`}>
                {/* Efecto de brillo al hover */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-400/0 via-purple-400/5 to-purple-400/0 group-hover:via-purple-400/10 transition-all duration-500"></div>
                
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-purple-300 transition-colors duration-300">
                  {feature.title}
                </h3>
                
                <p className="text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                  {feature.description}
                </p>

                {/* Efectos de partículas en hover */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Estadísticas */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.1, y: -10 }}
              className="text-center p-6 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 hover:border-purple-400/50 transition-all duration-300"
            >
              <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl md:text-4xl font-black mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {stat.number}
              </div>
              <div className="text-gray-300 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
