'use client';

import { motion } from 'framer-motion';
import { Bell, Search } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function DashboardLayout({ 
  children, 
  title = "Bienvenido al Dashboard",
  subtitle = "Gestiona tu inventario y ventas de manera profesional"
}: DashboardLayoutProps) {
  // Posiciones fijas para partículas (evitar hydration mismatch)
  const particlePositions = [
    { left: 5, top: 10 },
    { left: 95, top: 20 },
    { left: 10, top: 60 },
    { left: 90, top: 70 },
    { left: 15, top: 30 },
    { left: 85, top: 85 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 flex overflow-hidden relative transition-colors duration-300">
      {/* Fondo con efectos */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-purple-500/10 to-purple-500/5 animate-gradient-x"></div>
        
        {/* Partículas flotantes */}
        {particlePositions.map((pos, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-500/40 rounded-full opacity-30"
            style={{
              left: `${pos.left}%`,
              top: `${pos.top}%`,
            }}
            animate={{
              scale: [1, 2, 1],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      {/* Sidebar */}
      <Sidebar />

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Principal */}
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white/70 backdrop-blur-2xl border-b border-slate-200 p-6 shadow-sm transition-colors duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">
                <span className="bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                  {title}
                </span>
              </h2>
              <p className="text-slate-600">{subtitle}</p>
            </div>

            <div className="flex items-center gap-4">
              {/* Barra de búsqueda */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  type="text"
                  placeholder="Buscar..."
                  className="pl-10 w-64"
                />
              </div>

              {/* Notificaciones */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="icon"
                  className="relative"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.header>

        {/* Contenido del Dashboard */}
        <main className="flex-1 p-6 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
