/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useUser } from '@/hooks/use-user';
import { Categoria } from '@/interfaces/categorias.interface';
import { Productos } from '@/interfaces/productos.interface';
import { deleteDocument, getCollection } from '@/lib/firebase';
import { orderBy } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Package, Plus, Search, ShoppingCart, TrendingUp } from 'lucide-react';
import { showToast } from 'nextjs-toast-notify';
import { useEffect, useState } from 'react';
import CreateUpdateProductosForm from './components/create-update-pruductos-form';
import TableViewProductos from './components/table-view-productos';

export default function ProductosPage() {
  const user = useUser();
  const [productos, setProductos] = useState<Productos[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getProductos = async () => {
    const path = `productos`;
    const query = [orderBy("nombre", "desc")];
    setIsLoading(true);
    try {
      const res = await getCollection(path, query) as Productos[];
      setProductos(res);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategorias = async () => {
    const path = `categorias`;
    const query = [orderBy("nombre", "asc")];
    try {
      const res = await getCollection(path, query) as Categoria[];
      setCategorias(res.filter(cat => cat.activa !== false));
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    if (user) {
      getProductos();
      getCategorias();
    }
  }, [user]);

  const deleteProducto = async (producto: Productos) => {
    const path = `productos/${producto.id}`;
    setIsLoading(true);
    try {
      await deleteDocument(path);
      showToast.success("El producto fue eliminado exitosamente");
      const newProductos = productos.filter((i) => i.id !== producto.id);
      setProductos(newProductos);
    } catch (error: any) {
      showToast.error(error.message, { duration: 2500 });
    } finally {
      setIsLoading(false);
    }
  };

  // Preparar categorías para el formulario
  const categoriasForForm = categorias
    .filter(cat => cat.id !== undefined)
    .map(cat => ({
      id: cat.id!,
      nombre: cat.nombre
    }));

  return (
    <div className="space-y-6">
      {/* Header con título y búsqueda */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              Gestión de Productos
            </span>
          </h1>
          <p className="text-slate-600 mt-1">Administra el inventario y catálogo de productos</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Barra de búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              type="text"
              placeholder="Buscar productos..."
              className="pl-10 w-64"
            />
          </div>

          {/* Botón para nuevo producto */}
          <CreateUpdateProductosForm 
            getProductosAction={getProductos}
            categorias={categoriasForForm}
          >
            <Button type="button">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Producto
            </Button>
          </CreateUpdateProductosForm>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { 
            title: 'Total Productos', 
            value: isLoading ? '...' : productos.length.toString(), 
            icon: Package, 
            color: 'from-blue-500 to-blue-600' 
          },
          { 
            title: 'Productos Activos', 
            value: isLoading ? '...' : productos.filter(p => p.activa !== false).length.toString(), 
            icon: ShoppingCart, 
            color: 'from-green-500 to-green-600' 
          },
          { 
            title: 'Stock Bajo', 
            value: isLoading ? '...' : productos.filter(p => p.stock_actual <= p.stock_minimo).length.toString(), 
            icon: TrendingUp, 
            color: 'from-red-500 to-red-600' 
          }
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
          >
            <Card className="bg-white/70 backdrop-blur-xl border border-slate-200 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 font-medium">{stat.title}</p>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-xl shadow-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Card de productos con bajo stock */}
      {productos.filter(p => p.stock_actual <= p.stock_minimo && p.activa !== false).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-red-50/70 backdrop-blur-xl border border-red-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-red-800 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                  ⚠️ Productos con Stock Bajo
                </span>
              </CardTitle>
              <CardDescription className="text-red-600">
                Los siguientes productos necesitan reabastecimiento urgente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 max-h-60 overflow-y-auto">
                {productos
                  .filter(p => p.stock_actual <= p.stock_minimo && p.activa !== false)
                  .map((producto, index) => {
                    const categoria = categorias.find(cat => cat.id === producto.categoriaId);
                    return (
                      <motion.div
                        key={producto.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 bg-white/80 rounded-lg border border-red-100 hover:shadow-md transition-shadow"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{producto.nombre}</h4>
                          <p className="text-sm text-gray-600">
                            Categoría: {categoria?.nombre || 'Sin categoría'}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Stock:</span>
                            <span className="font-bold text-red-600">
                              {producto.stock_actual}
                            </span>
                            <span className="text-sm text-gray-400">
                              / {producto.stock_minimo} mín
                            </span>
                          </div>
                          <div className="mt-1">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  producto.stock_actual === 0 
                                    ? 'bg-red-600' 
                                    : producto.stock_actual <= producto.stock_minimo * 0.5 
                                    ? 'bg-red-500' 
                                    : 'bg-orange-500'
                                }`}
                                style={{ 
                                  width: `${Math.min((producto.stock_actual / (producto.stock_minimo * 2)) * 100, 100)}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Tabla de productos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-white/70 backdrop-blur-xl border border-slate-200 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-900">
              <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                Lista de Productos
              </span>
            </CardTitle>
            <CardDescription className="text-slate-600">
              Gestiona todos los productos de tu inventario
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TableViewProductos
              productos={productos}
              deleteProducto={deleteProducto}
              getProductosAction={getProductos}
              isLoading={isLoading}
              categorias={categoriasForForm}
            />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}