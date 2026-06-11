'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { motion } from 'framer-motion';
import {
    BarChart3,
    DollarSign,
    Download,
    Edit,
    Filter,
    Package,
    Plus,
    Search,
    Star,
    Trash2
} from 'lucide-react';
// import DashboardLayout from './components/DashboardLayout';

export default function ProductosPage() {
  // Datos de ejemplo
  const productos = [
    {
      id: 1,
      nombre: 'Laptop Dell XPS 13',
      categoria: 'Electrónicos',
      precio: 1299.99,
      stock: 15,
      estado: 'activo'
    },
    {
      id: 2,
      nombre: 'Camiseta Nike Dri-FIT',
      categoria: 'Ropa',
      precio: 29.99,
      stock: 45,
      estado: 'activo'
    },
    {
      id: 3,
      nombre: 'iPhone 15 Pro',
      categoria: 'Electrónicos',
      precio: 999.99,
      stock: 8,
      estado: 'activo'
    },
    {
      id: 4,
      nombre: 'Café Premium Orgánico',
      categoria: 'Alimentación',
      precio: 15.99,
      stock: 120,
      estado: 'activo'
    }
  ];

  return (
    // <DashboardLayout>
      <div className="space-y-6">
        {/* Header con título y acciones */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Gestión de Productos
              </span>
            </h1>
            <p className="text-gray-600 mt-1">Administra tu inventario de productos de manera eficiente</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Barra de búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar productos..."
                className="pl-10 w-64"
              />
            </div>

            {/* Filtros */}
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filtros
            </Button>

            {/* Exportar */}
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Exportar
            </Button>

            {/* Nuevo producto */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg gap-2">
                <Plus className="w-4 h-4" />
                Nuevo Producto
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { 
              title: 'Total Productos', 
              value: productos.length.toString(), 
              icon: Package, 
              color: 'from-blue-500 to-blue-600',
              change: '+12%'
            },
            { 
              title: 'Valor Inventario', 
              value: `$${productos.reduce((acc, p) => acc + (p.precio * p.stock), 0).toLocaleString()}`, 
              icon: DollarSign, 
              color: 'from-green-500 to-green-600',
              change: '+5%'
            },
            { 
              title: 'Stock Total', 
              value: productos.reduce((acc, p) => acc + p.stock, 0).toString(), 
              icon: BarChart3, 
              color: 'from-orange-500 to-orange-600',
              change: '-2%'
            },
            { 
              title: 'Productos Activos', 
              value: productos.filter(p => p.estado === 'activo').length.toString(), 
              icon: Star, 
              color: 'from-purple-500 to-purple-600',
              change: '+8%'
            }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <Card className="bg-white/70 backdrop-blur-xl border-gray-200/50 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-xl shadow-lg`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`${stat.change.startsWith('+') ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}
                    >
                      {stat.change}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tabla de productos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white/70 backdrop-blur-xl border-gray-200/50 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800">
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Lista de Productos
                </span>
              </CardTitle>
              <CardDescription className="text-gray-600">
                Todos los productos registrados en tu inventario
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200/50">
                    <TableHead className="text-gray-700 font-semibold">Producto</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Categoría</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Precio</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Stock</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Estado</TableHead>
                    <TableHead className="text-gray-700 font-semibold text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productos.map((producto, index) => (
                    <motion.tr
                      key={producto.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="border-gray-200/50 hover:bg-gray-50/50"
                    >
                      <TableCell className="font-medium text-gray-800">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-semibold">{producto.nombre}</p>
                            <p className="text-sm text-gray-500">ID: {producto.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {producto.categoria}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-800 font-semibold">
                        ${producto.precio.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <span className={`font-semibold ${
                          producto.stock < 10 
                            ? 'text-red-600' 
                            : producto.stock < 20 
                              ? 'text-orange-600' 
                              : 'text-green-600'
                        }`}>
                          {producto.stock} unidades
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="default"
                          className="bg-green-100 text-green-700 border-green-200"
                        >
                          {producto.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-purple-600 border-purple-200 hover:bg-purple-50"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </motion.div>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    // </DashboardLayout>
  );
}
