'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    ArrowRight,
    Github,
    Heart,
    Linkedin,
    Mail,
    MapPin,
    Phone,
    Send,
    Star,
    Twitter
} from 'lucide-react';
import { useEffect, useRef } from 'react';

gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
  const footerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: ["start end", "end start"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -100]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animación de entrada de los elementos del footer
      gsap.fromTo(".footer-item",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 90%",
            end: "bottom 10%",
            toggleActions: "play none none reverse"
          }
        }
      );

      // Animación de las estrellas flotantes
      gsap.to(".floating-star", {
        y: -20,
        rotation: 180,
        duration: 3,
        ease: "power1.inOut",
        stagger: 0.3,
        repeat: -1,
        yoyo: true
      });
    }, footerRef);

    return () => ctx.revert();
  }, []);

  const quickLinks = [
    { name: "Características", href: "#features" },
    { name: "Precios", href: "#pricing" },
    { name: "Documentación", href: "#docs" },
    { name: "API", href: "#api" },
    { name: "Soporte", href: "#support" },
    { name: "Blog", href: "#blog" }
  ];

  const socialLinks = [
    { icon: Github, href: "#", name: "GitHub", color: "hover:text-gray-400" },
    { icon: Twitter, href: "#", name: "Twitter", color: "hover:text-blue-400" },
    { icon: Linkedin, href: "#", name: "LinkedIn", color: "hover:text-blue-600" }
  ];

  return (
    <motion.footer 
      id="contact"
      ref={footerRef}
      style={{ backgroundPositionY: backgroundY }}
      className="relative bg-gradient-to-t from-black via-slate-900 to-slate-800 text-white overflow-hidden"
    >
      {/* Fondo con efectos visuales */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-cyan-900/20 animate-gradient-x"></div>
        
        {/* Estrellas flotantes */}
        {[
          { left: '10%', top: '20%' }, { left: '85%', top: '15%' }, { left: '25%', top: '80%' },
          { left: '75%', top: '85%' }, { left: '45%', top: '25%' }, { left: '65%', top: '70%' },
          { left: '15%', top: '60%' }, { left: '90%', top: '45%' }, { left: '35%', top: '90%' },
          { left: '55%', top: '10%' }, { left: '20%', top: '40%' }, { left: '80%', top: '65%' },
          { left: '5%', top: '30%' }, { left: '95%', top: '75%' }, { left: '50%', top: '50%' }
        ].map((star, i) => (
          <motion.div
            key={i}
            className="floating-star absolute"
            style={{
              left: star.left,
              top: star.top,
            }}
          >
            <Star className="w-4 h-4 text-purple-400 opacity-60" fill="currentColor" />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-10">
        {/* Sección principal del footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Logo y descripción */}
          <motion.div className="footer-item lg:col-span-2">
            <div className="mb-6">
              <h3 className="text-4xl font-black mb-4">
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  YEI PROJECT
                </span>
              </h3>
              <p className="text-gray-300 text-lg leading-relaxed max-w-md">
                Transformando el futuro de la gestión empresarial con tecnología de vanguardia. 
                Tu éxito es nuestra pasión.
              </p>
            </div>

            {/* Newsletter */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-purple-400" />
                Mantente Actualizado
              </h4>
              <p className="text-gray-300 mb-4">
                Recibe las últimas noticias y actualizaciones directamente en tu inbox.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="tu@email.com"
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg px-4 py-2 flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Enlaces rápidos */}
          <motion.div className="footer-item">
            <h4 className="text-xl font-bold mb-6 text-white">Enlaces Rápidos</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <motion.a
                    href={link.href}
                    whileHover={{ x: 5 }}
                    className="text-gray-300 hover:text-purple-400 transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {link.name}
                  </motion.a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contacto */}
          <motion.div className="footer-item">
            <h4 className="text-xl font-bold mb-6 text-white">Contacto</h4>
            <div className="space-y-4">
              <motion.div 
                whileHover={{ x: 5 }}
                className="flex items-center gap-3 text-gray-300 hover:text-purple-400 transition-colors duration-300"
              >
                <Mail className="w-5 h-5" />
                <span>hello@yeiproject.com</span>
              </motion.div>
              <motion.div 
                whileHover={{ x: 5 }}
                className="flex items-center gap-3 text-gray-300 hover:text-purple-400 transition-colors duration-300"
              >
                <Phone className="w-5 h-5" />
                <span>+1 (555) 123-4567</span>
              </motion.div>
              <motion.div 
                whileHover={{ x: 5 }}
                className="flex items-center gap-3 text-gray-300 hover:text-purple-400 transition-colors duration-300"
              >
                <MapPin className="w-5 h-5" />
                <span>San Francisco, CA</span>
              </motion.div>
            </div>

            {/* Redes sociales */}
            <div className="mt-8">
              <h5 className="text-lg font-semibold mb-4 text-white">Síguenos</h5>
              <div className="flex gap-3">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    className={`w-10 h-10 bg-white/10 backdrop-blur-lg rounded-full flex items-center justify-center text-gray-300 ${social.color} transition-all duration-300 border border-white/20 hover:border-purple-400/50`}
                  >
                    <social.icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Línea divisoria */}
        <motion.div 
          className="footer-item"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <div className="h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent mb-8"></div>
        </motion.div>

        {/* Footer bottom */}
        <motion.div className="footer-item flex flex-col md:flex-row justify-between items-center gap-4 text-gray-400">
          <div className="flex items-center gap-2">
            <span>© 2025 Yei Project. Hecho con</span>
            <Heart className="w-4 h-4 text-red-400 animate-pulse" fill="currentColor" />
            <span>en el futuro.</span>
          </div>
          
          <div className="flex gap-6 text-sm">
            <motion.a 
              href="#" 
              whileHover={{ y: -2 }}
              className="hover:text-purple-400 transition-colors duration-300"
            >
              Privacidad
            </motion.a>
            <motion.a 
              href="#" 
              whileHover={{ y: -2 }}
              className="hover:text-purple-400 transition-colors duration-300"
            >
              Términos
            </motion.a>
            <motion.a 
              href="#" 
              whileHover={{ y: -2 }}
              className="hover:text-purple-400 transition-colors duration-300"
            >
              Cookies
            </motion.a>
          </div>
        </motion.div>

        {/* CTA flotante */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="fixed bottom-8 right-8 z-50 md:relative md:bottom-auto md:right-auto md:mt-12 md:text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-bold shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 flex items-center gap-2"
          >
            <span>¡Comienza Gratis!</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    </motion.footer>
  );
}
