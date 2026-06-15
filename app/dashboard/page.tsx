"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  Clock,
  Plus,
  FileText,
  UserCheck,
  TrendingDown,
  BarChart2,
  Calendar,
  Layers
} from "lucide-react";
import { showToast } from "nextjs-toast-notify";
import { getCollection } from "@/lib/firebase";
import { Venta } from "@/interfaces/ventas.interface";
import { Pedido } from "@/interfaces/pedidos.interface";
import { Productos } from "@/interfaces/productos.interface";
import { Cliente } from "@/interfaces/clientes.interface";
import { useRouter } from "next/navigation";

interface RecienteActividad {
  id: string;
  tipo: "VENTA" | "PEDIDO";
  numero: string;
  cliente: string;
  montoUsd: number;
  fecha: string;
  estado: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  // Datos
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [productos, setProductos] = useState<Productos[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  // Estadísticas calculadas
  const [stats, setStats] = useState({
    ventasMesUsd: 0,
    ventasMesBs: 0,
    clientesActivos: 0,
    pedidosActivos: 0,
    productosCriticos: 0,
  });

  const [productosBajoStock, setProductosBajoStock] = useState<Productos[]>([]);
  const [actividadReciente, setActividadReciente] = useState<RecienteActividad[]>([]);

  const cargarDatos = async () => {
    setIsLoading(true);
    try {
      const [ventasData, pedidosData, productosData, clientesData] = await Promise.all([
        getCollection("ventas"),
        getCollection("pedidos"),
        getCollection("productos"),
        getCollection("clientes"),
      ]);

      const sales = ventasData as Venta[];
      const orders = pedidosData as Pedido[];
      const prods = productosData as Productos[];
      const custs = clientesData as Cliente[];

      setVentas(sales);
      setPedidos(orders);
      setProductos(prods);
      setClientes(custs);

      calcularMetricas(sales, orders, prods, custs);
    } catch (error) {
      console.error("Error al cargar datos del Dashboard:", error);
      showToast.error("Error al cargar los datos del sistema");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const calcularMetricas = (
    sales: Venta[],
    orders: Pedido[],
    prods: Productos[],
    custs: Cliente[]
  ) => {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    // Ventas del mes
    const ventasMes = sales.filter((v) => {
      const fecha = new Date(v.fecha_venta || v.createdAt || "");
      return fecha >= inicioMes && v.estado === "PAGADA";
    });

    const ventasMesUsd = ventasMes.reduce((sum, v) => sum + (v.total_usd || 0), 0);
    const ventasMesBs = ventasMes.reduce((sum, v) => sum + (v.total_bs || 0), 0);

    // Pedidos activos (No entregados ni cancelados)
    const pedidosActivos = orders.filter(
      (p) => p.estado === "PENDIENTE" || p.estado === "PREPARANDO" || p.estado === "EN_CAMINO"
    ).length;

    // Productos bajo stock crítico
    const criticos = prods.filter((p) => p.activa && p.stock_actual <= p.stock_minimo);
    setProductosBajoStock(criticos.slice(0, 5)); // Últimos 5 críticos

    // Clientes activos
    const clientesActivos = custs.filter((c) => c.activo).length;

    setStats({
      ventasMesUsd,
      ventasMesBs,
      clientesActivos,
      pedidosActivos,
      productosCriticos: criticos.length,
    });

    // Actividad reciente combinada (últimas 5 ventas y pedidos)
    const actividades: RecienteActividad[] = [];

    // Añadir últimas 5 ventas
    sales
      .sort((a, b) => new Date(b.fecha_venta).getTime() - new Date(a.fecha_venta).getTime())
      .slice(0, 5)
      .forEach((v) => {
        actividades.push({
          id: v.id || "",
          tipo: "VENTA",
          numero: v.numero_venta,
          cliente: v.cliente_nombre || "Consumidor Final",
          montoUsd: v.total_usd,
          fecha: v.fecha_venta,
          estado: v.estado,
        });
      });

    // Añadir últimos 5 pedidos
    orders
      .sort((a, b) => new Date(b.fecha_pedido).getTime() - new Date(a.fecha_pedido).getTime())
      .slice(0, 5)
      .forEach((p) => {
        actividades.push({
          id: p.id || "",
          tipo: "PEDIDO",
          numero: p.numero_pedido,
          cliente: p.cliente_nombre,
          montoUsd: p.total_usd,
          fecha: p.fecha_pedido,
          estado: p.estado,
        });
      });

    // Ordenar actividades de forma descendente por fecha y tomar las últimas 5
    const activSorted = actividades
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 5);

    setActividadReciente(activSorted);
  };

  const getEstadoPedidoBadge = (estado: string) => {
    switch (estado) {
      case "PENDIENTE":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-300">⏳ Pendiente</Badge>;
      case "PREPARANDO":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">📦 Preparando</Badge>;
      case "EN_CAMINO":
        return <Badge className="bg-purple-100 text-purple-800 border-purple-300">🚚 En camino</Badge>;
      case "ENTREGADO":
        return <Badge className="bg-green-100 text-green-800 border-green-300">✅ Entregado</Badge>;
      case "PAGADA":
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">💵 Facturada</Badge>;
      case "CANCELADO":
        return <Badge className="bg-red-100 text-red-800 border-red-300">❌ Cancelado</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Ventas del Mes */}
        <motion.div whileHover={{ y: -4 }}>
          <Card className="bg-white/70 backdrop-blur-xl border border-slate-200 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-slate-500 font-medium">Facturado este Mes</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">
                    ${stats.ventasMesUsd.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    {stats.ventasMesBs.toLocaleString("es-VE", { maximumFractionDigits: 0 })} Bs
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-2xl text-purple-600">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pedidos Activos */}
        <motion.div whileHover={{ y: -4 }}>
          <Card className="bg-white/70 backdrop-blur-xl border border-slate-200 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-slate-500 font-medium">Pedidos Activos</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">
                    {isLoading ? "..." : stats.pedidosActivos}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Despachos y retiros pendientes</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-2xl text-blue-600">
                  <ShoppingCart className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Clientes Activos */}
        <motion.div whileHover={{ y: -4 }}>
          <Card className="bg-white/70 backdrop-blur-xl border border-slate-200 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-slate-500 font-medium">Clientes Registrados</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">
                    {isLoading ? "..." : stats.clientesActivos}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Clientes habilitados en base de datos</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stock Crítico */}
        <motion.div whileHover={{ y: -4 }}>
          <Card className="bg-white/70 backdrop-blur-xl border border-slate-200 shadow-lg relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-1 ${stats.productosCriticos > 0 ? "bg-red-500" : "bg-slate-400"}`}></div>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-slate-500 font-medium">Alertas de Stock</p>
                  <h3 className={`text-2xl font-bold mt-1 ${stats.productosCriticos > 0 ? "text-red-600" : "text-slate-900"}`}>
                    {isLoading ? "..." : stats.productosCriticos}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Artículos bajo stock mínimo</p>
                </div>
                <div className={`p-4 rounded-2xl ${stats.productosCriticos > 0 ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-400"}`}>
                  <AlertTriangle className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Grid: Accesos, Actividad y Stock Crítico */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel izquierdo: Accesos Rápidos y Actividad */}
        <div className="lg:col-span-2 space-y-6">
          {/* Accesos rápidos */}
          <Card className="bg-white/70 backdrop-blur-xl border border-slate-200 shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-900">Enlaces y Accesos Rápidos</CardTitle>
              <CardDescription>Accesos directos para agilizar las operaciones del día</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Nueva Venta", route: "/dashboard/nueva-venta", icon: Plus, color: "bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700" },
                { label: "Nuevo Pedido", route: "/dashboard/pedidos", icon: ShoppingCart, color: "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700" },
                { label: "Control de Stock", route: "/dashboard/stock", icon: Layers, color: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700" },
                { label: "Rendimiento", route: "/dashboard/rendimiento", icon: BarChart2, color: "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700" }
              ].map((act, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => router.push(act.route)}
                  className={`h-auto p-4 rounded-2xl flex flex-col items-center gap-2 border shadow-sm transition-all duration-300 ${act.color}`}
                >
                  <act.icon className="w-6 h-6" />
                  <span className="font-bold text-xs">{act.label}</span>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Actividad Reciente */}
          <Card className="bg-white/70 backdrop-blur-xl border border-slate-200 shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                Actividad Reciente
              </CardTitle>
              <CardDescription>Últimas transacciones y pedidos registrados en la plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : actividadReciente.length === 0 ? (
                <p className="text-center text-slate-500 py-6 text-sm">No hay actividad reciente.</p>
              ) : (
                <div className="space-y-4">
                  {actividadReciente.map((act) => (
                    <div
                      key={act.id + act.tipo}
                      className="flex items-center justify-between p-3.5 bg-white border border-slate-150 rounded-2xl hover:border-purple-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2.5 rounded-xl border ${
                          act.tipo === "VENTA"
                            ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                            : "bg-blue-50 border-blue-100 text-blue-600"
                        }`}>
                          {act.tipo === "VENTA" ? <FileText className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 text-sm">{act.numero}</span>
                            {getEstadoPedidoBadge(act.estado)}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Cliente: <span className="font-semibold text-slate-700">{act.cliente}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-slate-800 text-sm">${act.montoUsd.toFixed(2)}</span>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(act.fecha).toLocaleDateString("es-VE")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Panel derecho: Alertas de Stock Crítico */}
        <Card className="bg-white/70 backdrop-blur-xl border border-slate-200 shadow-xl flex flex-col h-full">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Stock Crítico
            </CardTitle>
            <CardDescription>Productos que requieren reabastecimiento urgente</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
              </div>
            ) : productosBajoStock.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-slate-300" />
                <p className="text-slate-500 mt-2 text-sm">Todas las existencias están correctas.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {productosBajoStock.map((prod) => (
                  <div
                    key={prod.id}
                    className="flex justify-between items-center p-3 bg-red-50/50 border border-red-100 rounded-2xl"
                  >
                    <div className="truncate max-w-[150px]">
                      <p className="font-bold text-xs text-slate-800 truncate">{prod.nombre}</p>
                      <p className="text-[10px] text-slate-500">{prod.categoriaId}</p>
                    </div>
                    <div className="text-right flex items-center gap-2.5">
                      <div>
                        <span className="font-extrabold text-red-600 text-xs">{prod.stock_actual} uds.</span>
                        <p className="text-[9px] text-slate-400 mt-0.5">Mínimo: {prod.stock_minimo}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button
                  variant="ghost"
                  className="w-full text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-xl mt-2 font-semibold"
                  onClick={() => router.push("/dashboard/productos")}
                >
                  Ver inventario completo <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
