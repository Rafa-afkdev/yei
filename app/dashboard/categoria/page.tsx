/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useUser } from '@/hooks/use-user';
import { Categoria } from '@/interfaces/categorias.interface';
import { deleteDocument, getCollection } from '@/lib/firebase';
import { orderBy } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Plus, Search, Star, Tag } from 'lucide-react';
import { showToast } from 'nextjs-toast-notify';
import { useEffect, useState } from 'react';
import CreateUpdateCategoriaForm from './components/create-update-categoria.form';
import TableViewCategorias from './components/table-view-categorias';

export default function CategoriaPage() {
  const user = useUser();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getCategorias = async () => {
    const path = `categorias`;
    const query = [orderBy("nombre", "desc")];
    setIsLoading(true);
    try {
      const res = await getCollection(path, query) as Categoria[];
      setCategorias(res);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) getCategorias();
  }, [user]);

  // Si tienes una función para eliminar categorías, defínela aquí.
  // Por ejemplo:
  const deleteCategoria = async (categoria: Categoria) => {
    const path = `categorias/${categoria.id}`;
    setIsLoading(true);
    try {
      await deleteDocument(path);
      showToast.success("La categoría fue eliminada exitosamente");
      const newCategorias = categorias.filter((i) => i.id !== categoria.id);
      setCategorias(newCategorias);
    } catch (error: any) {
      showToast.error(error.message, { duration: 2500 });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con título y búsqueda */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            <span className="bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
              Gestión de Categorías
            </span>
          </h1>
          <p className="text-slate-600 mt-1">Organiza y administra las categorías de tus productos</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Barra de búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              type="text"
              placeholder="Buscar categorías..."
              className="pl-10 w-64"
            />
          </div>

          {/* Botón para nueva categoría */}
          <CreateUpdateCategoriaForm getCategoriasAction={getCategorias}>
            <Button type="button">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Categoría
            </Button>
          </CreateUpdateCategoriaForm>
        </div>
      </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Total Categorías', value: isLoading ? '...' : categorias.length.toString(), icon: Tag, color: 'from-blue-500 to-blue-600' },
            { title: 'Categorías Activas', value: isLoading ? '...' : categorias.filter(c => c.activa !== false).length.toString(), icon: Star, color: 'from-green-500 to-green-600' },
            // { title: 'Última Creación', value: 'Hoy', icon: Plus, color: 'from-primary to-primary/80' }
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

        {/* Tabla de categorías */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white/70 backdrop-blur-xl border border-slate-200 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900">
                <span className="bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                  Lista de Categorías
                </span>
              </CardTitle>
              <CardDescription className="text-slate-600">
                Gestiona todas las categorías de productos de tu inventario
              </CardDescription>
            </CardHeader>
            <CardContent >
              
                <TableViewCategorias
                  categoria={categorias}
                  deleteCategoria={deleteCategoria}
                  getCategoriasAction={getCategorias}
                  isLoading={isLoading}
                />
              
            </CardContent>
          </Card>
        </motion.div>
      </div>
  
  );
}
