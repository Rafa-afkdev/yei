'use client';

import { motion } from 'framer-motion';
import {
  BarChart3,
  DollarSign,
  Package,
  ShoppingCart,
  Users
} from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import DashboardLayout from './DashboardLayout';

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Cards de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Ventas Hoy', value: '$2,450', change: '+12%', color: 'from-green-500 to-emerald-500', icon: DollarSign },
            { title: 'Productos', value: '1,247', change: '+3%', color: 'from-blue-500 to-cyan-500', icon: Package },
            { title: 'Clientes', value: '389', change: '+8%', color: 'from-purple-500 to-pink-500', icon: Users },
            { title: 'Pedidos', value: '156', change: '+15%', color: 'from-orange-500 to-red-500', icon: ShoppingCart }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <Card className="bg-white/70 backdrop-blur-2xl border border-slate-200 shadow-xl">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-xl shadow-lg`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <Badge variant="secondary" className="text-green-600 bg-green-50">
                      {stat.change}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-600 text-sm font-medium mb-1">
                    {stat.title}
                  </CardDescription>
                  <CardTitle className="text-2xl font-bold text-slate-900">
                    {stat.value}
                  </CardTitle>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Contenido adicional del dashboard */}
        <Card className="bg-white/70 backdrop-blur-2xl border border-slate-200 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-900">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Panel de Control Principal
              </span>
            </CardTitle>
            <CardDescription className="text-slate-600">
              Desde aquí puedes gestionar todos los aspectos de tu sistema de inventario y ventas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: 'Gestión de Inventario', desc: 'Controla tu stock en tiempo real', icon: Package },
                { title: 'Proceso de Ventas', desc: 'Registra y gestiona ventas', icon: ShoppingCart },
                { title: 'Análisis de Datos', desc: 'Reportes y métricas detalladas', icon: BarChart3 }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <Card className="bg-white/50 border border-slate-200 hover:border-purple-300 transition-all duration-300 shadow-sm">
                    <CardContent className="p-4">
                      <feature.icon className="w-8 h-8 text-purple-600 mb-2" />
                      <CardTitle className="text-slate-900 font-semibold mb-1 text-base">
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="text-slate-600 text-sm">
                        {feature.desc}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}



