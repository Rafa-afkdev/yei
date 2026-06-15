"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Calendar,
  AlertCircle,
  TrendingDown,
  Percent,
  Award,
  CreditCard,
  Grid,
  BarChart2,
  Clock,
  Briefcase
} from "lucide-react";
import { showToast } from "nextjs-toast-notify";
import { Venta, VentaItem } from "@/interfaces/ventas.interface";
import { Productos } from "@/interfaces/productos.interface";
import { Cliente } from "@/interfaces/clientes.interface";
import { getCollection } from "@/lib/firebase";
import { useUser } from "@/hooks/use-user";

interface VendedorPerformance {
  nombre: string;
  totalVendidoUsd: number;
  totalVendidoBs: number;
  transacciones: number;
  ticketPromedio: number;
}

interface CategoriaPerformance {
  nombre: string;
  totalVendidoUsd: number;
  cantidadVendida: number;
}

interface MetodoPagoPerformance {
  metodo: string;
  totalVendidoUsd: number;
  porcentaje: number;
}

interface DiaSemanaPerformance {
  dia: string;
  totalVendidoUsd: number;
  porcentaje: number;
}

const DIAS_SEMANA = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default function RendimientoPage() {
  const currentUser = useUser() as any;
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [productos, setProductos] = useState<Productos[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtros de fecha
  const [filterRange, setFilterRange] = useState<"HOY" | "ULTIMOS_7_DIAS" | "ESTE_MES" | "PERSONALIZADO">("ESTE_MES");
  const [fechaInicio, setFechaInicio] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]
  );
  const [fechaFin, setFechaFin] = useState(new Date().toISOString().split("T")[0]);

  // Métricas Calculadas
  const [metrics, setMetrics] = useState({
    ingresosBrutosUsd: 0,
    ingresosBrutosBs: 0,
    utilidadNetaUsd: 0,
    margenGananciaPromedio: 0,
    ticketPromedioUsd: 0,
    totalTransacciones: 0,
    totalProductosVendidos: 0,
  });

  // Análisis detallados
  const [vendedoresPerf, setVendedoresPerf] = useState<VendedorPerformance[]>([]);
  const [categoriasPerf, setCategoriasPerf] = useState<CategoriaPerformance[]>([]);
  const [metodosPagoPerf, setMetodosPagoPerf] = useState<MetodoPagoPerformance[]>([]);
  const [diasSemanaPerf, setDiasSemanaPerf] = useState<DiaSemanaPerformance[]>([]);

  const cargarDatos = async () => {
    setIsLoading(true);
    try {
      const [ventasData, productosData, clientesData] = await Promise.all([
        getCollection("ventas"),
        getCollection("productos"),
        getCollection("clientes"),
      ]);

      setVentas(ventasData as Venta[]);
      setProductos(productosData as Productos[]);
      setClientes(clientesData as Cliente[]);

      calcularMétricas(ventasData as Venta[], productosData as Productos[]);
    } catch (error) {
      console.error("Error al cargar datos de rendimiento:", error);
      showToast.error("Error al cargar los datos financieros");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.rol === "ADMINISTRADOR") {
      cargarDatos();
    }
  }, [currentUser]);

  // Actualizar estadísticas al cambiar filtros de fecha
  useEffect(() => {
    if (ventas.length > 0) {
      calcularMétricas(ventas, productos);
    }
  }, [filterRange, fechaInicio, fechaFin, ventas, productos]);

  // Cambiar rango rápido
  const handleRangeChange = (range: "HOY" | "ULTIMOS_7_DIAS" | "ESTE_MES" | "PERSONALIZADO") => {
    setFilterRange(range);
    const hoy = new Date();

    if (range === "HOY") {
      const hoyString = hoy.toISOString().split("T")[0];
      setFechaInicio(hoyString);
      setFechaFin(hoyString);
    } else if (range === "ULTIMOS_7_DIAS") {
      const hace7Dias = new Date(hoy.setDate(hoy.getDate() - 7)).toISOString().split("T")[0];
      setFechaInicio(hace7Dias);
      setFechaFin(new Date().toISOString().split("T")[0]);
    } else if (range === "ESTE_MES") {
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split("T")[0];
      setFechaInicio(inicioMes);
      setFechaFin(new Date().toISOString().split("T")[0]);
    }
  };

  const calcularMétricas = (ventasData: Venta[], productosData: Productos[]) => {
    const inicio = new Date(fechaInicio);
    inicio.setHours(0, 0, 0, 0);

    const fin = new Date(fechaFin);
    fin.setHours(23, 59, 59, 999);

    // 1. Filtrar ventas por rango de fecha
    const ventasFiltradas = ventasData.filter((v) => {
      const fecha = new Date(v.fecha_venta || v.createdAt || "");
      return fecha >= inicio && fecha <= fin && v.estado === "PAGADA";
    });

    // 2. Cálculos generales
    const totalTransacciones = ventasFiltradas.length;
    const ingresosBrutosUsd = ventasFiltradas.reduce((sum, v) => sum + (v.total_usd || 0), 0);
    const ingresosBrutosBs = ventasFiltradas.reduce((sum, v) => sum + (v.total_bs || 0), 0);

    let costoTotalUsd = 0;
    let totalProductosVendidos = 0;

    // Relación de productos para búsqueda rápida por ID
    const prodMap = new Map<string, Productos>();
    productosData.forEach((p) => {
      if (p.id) prodMap.set(p.id, p);
    });

    ventasFiltradas.forEach((v) => {
      v.items.forEach((item) => {
        totalProductosVendidos += item.cantidad;
        const prod = prodMap.get(item.producto_id);
        const costoUnitario = prod?.precio_compra_usd || 0;
        costoTotalUsd += costoUnitario * item.cantidad;
      });
    });

    const utilidadNetaUsd = ingresosBrutosUsd - costoTotalUsd;
    const margenGananciaPromedio = ingresosBrutosUsd > 0 ? (utilidadNetaUsd / ingresosBrutosUsd) * 100 : 0;
    const ticketPromedioUsd = totalTransacciones > 0 ? ingresosBrutosUsd / totalTransacciones : 0;

    setMetrics({
      ingresosBrutosUsd,
      ingresosBrutosBs,
      utilidadNetaUsd,
      margenGananciaPromedio,
      ticketPromedioUsd,
      totalTransacciones,
      totalProductosVendidos,
    });

    // 3. Rendimiento de Vendedores
    const vendedoresMap = new Map<string, { totalUsd: number; totalBs: number; trans: number }>();
    ventasFiltradas.forEach((v) => {
      const vendedor = v.vendedor || "Sin asignar";
      const actual = vendedoresMap.get(vendedor) || { totalUsd: 0, totalBs: 0, trans: 0 };
      vendedoresMap.set(vendedor, {
        totalUsd: actual.totalUsd + (v.total_usd || 0),
        totalBs: actual.totalBs + (v.total_bs || 0),
        trans: actual.trans + 1,
      });
    });

    const vendedorPerfArray: VendedorPerformance[] = Array.from(vendedoresMap.entries()).map(([nombre, stat]) => ({
      nombre,
      totalVendidoUsd: stat.totalUsd,
      totalVendidoBs: stat.totalBs,
      transacciones: stat.trans,
      ticketPromedio: stat.trans > 0 ? stat.totalUsd / stat.trans : 0,
    })).sort((a, b) => b.totalVendidoUsd - a.totalVendidoUsd);

    setVendedoresPerf(vendedorPerfArray);

    // 4. Rendimiento por Categoría
    const categoriasMap = new Map<string, { totalUsd: number; cant: number }>();
    ventasFiltradas.forEach((v) => {
      v.items.forEach((item) => {
        const cat = item.categoria || "Sin categoría";
        const actual = categoriasMap.get(cat) || { totalUsd: 0, cant: 0 };
        categoriasMap.set(cat, {
          totalUsd: actual.totalUsd + (item.subtotal_usd || 0),
          cant: actual.cant + item.cantidad,
        });
      });
    });

    const categoriaPerfArray: CategoriaPerformance[] = Array.from(categoriasMap.entries()).map(([nombre, stat]) => ({
      nombre,
      totalVendidoUsd: stat.totalUsd,
      cantidadVendida: stat.cant,
    })).sort((a, b) => b.totalVendidoUsd - a.totalVendidoUsd);

    setCategoriasPerf(categoriaPerfArray);

    // 5. Métodos de Pago
    const metodosMap = new Map<string, number>();
    ventasFiltradas.forEach((v) => {
      const mPago = v.metodo_pago || "EFECTIVO";
      const actual = metodosMap.get(mPago) || 0;
      metodosMap.set(mPago, actual + (v.total_usd || 0));
    });

    const metodosPerfArray: MetodoPagoPerformance[] = Array.from(metodosMap.entries()).map(([metodo, total]) => ({
      metodo,
      totalVendidoUsd: total,
      porcentaje: ingresosBrutosUsd > 0 ? (total / ingresosBrutosUsd) * 100 : 0,
    })).sort((a, b) => b.totalVendidoUsd - a.totalVendidoUsd);

    setMetodosPagoPerf(metodosPerfArray);

    // 6. Pico de Ventas por Día de la Semana
    const diasVentas = new Array(7).fill(0);
    ventasFiltradas.forEach((v) => {
      const fecha = new Date(v.fecha_venta || v.createdAt || "");
      const diaIndice = fecha.getDay(); // 0 = Domingo, 1 = Lunes, etc.
      diasVentas[diaIndice] += v.total_usd || 0;
    });

    const diasPerfArray: DiaSemanaPerformance[] = diasVentas.map((total, idx) => ({
      dia: DIAS_SEMANA[idx],
      totalVendidoUsd: total,
      porcentaje: ingresosBrutosUsd > 0 ? (total / ingresosBrutosUsd) * 100 : 0,
    }));

    setDiasSemanaPerf(diasPerfArray);
  };

  // Validaciones del Usuario
  if (!currentUser) {
    return (
      <div className="p-6 space-y-6 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (currentUser.rol !== "ADMINISTRADOR") {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-600 shadow-md">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Acceso Denegado</h1>
        <p className="text-slate-600 max-w-md">
          Lo sentimos, solo los usuarios con el rol de <strong>Administrador</strong> tienen permisos para acceder y visualizar las analíticas financieras.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Rendimiento Financiero
            </span>
          </h1>
          <p className="text-slate-600">Análisis detallado de utilidades, ventas por vendedor y eficiencia operativa</p>
        </div>
      </div>

      {/* Rango de Filtros */}
      <Card className="bg-white/70 backdrop-blur-xl border border-slate-200 shadow-xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-6 items-end justify-between">
            {/* Filtros rápidos */}
            <div className="space-y-2 w-full lg:w-auto">
              <Label className="text-slate-700 font-semibold text-sm">Filtro rápido de período</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: "HOY", label: "Hoy" },
                  { key: "ULTIMOS_7_DIAS", label: "Últimos 7 Días" },
                  { key: "ESTE_MES", label: "Este Mes" },
                  { key: "PERSONALIZADO", label: "Personalizado" }
                ].map((item) => (
                  <Button
                    key={item.key}
                    variant={filterRange === item.key ? "default" : "outline"}
                    onClick={() => handleRangeChange(item.key as any)}
                    className={`rounded-xl px-4 py-2 ${
                      filterRange === item.key
                        ? "bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/20"
                        : "text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Selector de rango personalizado */}
            <div className="grid grid-cols-2 gap-4 w-full lg:max-w-md">
              <div>
                <Label htmlFor="fecha_inicio" className="text-slate-600 text-xs">Fecha Inicio</Label>
                <Input
                  id="fecha_inicio"
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => {
                    setFechaInicio(e.target.value);
                    setFilterRange("PERSONALIZADO");
                  }}
                  className="mt-1 border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="fecha_fin" className="text-slate-600 text-xs">Fecha Fin</Label>
                <Input
                  id="fecha_fin"
                  type="date"
                  value={fechaFin}
                  onChange={(e) => {
                    setFechaFin(e.target.value);
                    setFilterRange("PERSONALIZADO");
                  }}
                  className="mt-1 border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de KPIs principales */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Ventas Totales */}
            <motion.div whileHover={{ y: -4, scale: 1.02 }}>
              <Card className="bg-white/70 backdrop-blur-xl border border-slate-200 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Ventas Totales (Bruto)</p>
                      <h3 className="text-2xl font-bold text-slate-900 mt-1">
                        ${metrics.ingresosBrutosUsd.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1">
                        {metrics.ingresosBrutosBs.toLocaleString("es-VE", { minimumFractionDigits: 2 })} Bs
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-2xl text-blue-600">
                      <ShoppingCart className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Utilidad Neta */}
            <motion.div whileHover={{ y: -4, scale: 1.02 }}>
              <Card className="bg-white/70 backdrop-blur-xl border border-slate-200 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Ganancia Neta Estimada</p>
                      <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                        ${metrics.utilidadNetaUsd.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">Excluyendo costos de compra</p>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600">
                      <DollarSign className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Margen de Ganancia */}
            <motion.div whileHover={{ y: -4, scale: 1.02 }}>
              <Card className="bg-white/70 backdrop-blur-xl border border-slate-200 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Margen de Ganancia Promedio</p>
                      <h3 className="text-2xl font-bold text-purple-600 mt-1">
                        {metrics.margenGananciaPromedio.toFixed(1)}%
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">Retorno sobre ventas bruto</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-2xl text-purple-600">
                      <Percent className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Ticket Promedio */}
            <motion.div whileHover={{ y: -4, scale: 1.02 }}>
              <Card className="bg-white/70 backdrop-blur-xl border border-slate-200 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Ticket Promedio</p>
                      <h3 className="text-2xl font-bold text-amber-600 mt-1">
                        ${metrics.ticketPromedioUsd.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        {metrics.totalTransacciones} Ventas • {metrics.totalProductosVendidos} Artículos
                      </p>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-2xl text-amber-600">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Gráficos y Tablas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ranking de Vendedores */}
            <Card className="bg-white/70 backdrop-blur-xl border border-slate-200 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-600" />
                    Rendimiento por Vendedor
                  </CardTitle>
                  <CardDescription>Ventas netas y ticket promedio facturado por empleado</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                {vendedoresPerf.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-slate-300" />
                    <p className="text-slate-500 mt-2 text-sm">No hay datos de vendedores en este período.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {vendedoresPerf.map((vendedor, index) => {
                      const maxVentas = vendedoresPerf[0]?.totalVendidoUsd || 1;
                      const pct = (vendedor.totalVendidoUsd / maxVentas) * 100;
                      return (
                        <div key={vendedor.nombre} className="space-y-1">
                          <div className="flex justify-between items-center text-sm font-semibold text-slate-700">
                            <div className="flex items-center gap-2">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                index === 0 ? "bg-yellow-100 text-yellow-800" :
                                index === 1 ? "bg-slate-100 text-slate-800" :
                                index === 2 ? "bg-amber-100 text-amber-800" :
                                "bg-slate-50 text-slate-500"
                              }`}>
                                {index + 1}
                              </span>
                              <span className="truncate max-w-[150px]">{vendedor.nombre}</span>
                            </div>
                            <span>${vendedor.totalVendidoUsd.toLocaleString("es-VE", { minimumFractionDigits: 2 })}</span>
                          </div>
                          
                          {/* Barra de progreso visual */}
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-slate-500 min-w-[50px] text-right font-medium">
                              {vendedor.transacciones} trans.
                            </span>
                          </div>
                          
                          {/* Datos secundarios */}
                          <div className="text-[10px] text-slate-500 flex justify-between pl-7">
                            <span>Ticket Promedio: ${vendedor.ticketPromedio.toFixed(2)}</span>
                            <span>Bs: {vendedor.totalVendidoBs.toLocaleString("es-VE", { maximumFractionDigits: 0 })}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rendimiento por Categoría */}
            <Card className="bg-white/70 backdrop-blur-xl border border-slate-200 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Grid className="w-5 h-5 text-indigo-600" />
                  Rendimiento por Categoría
                </CardTitle>
                <CardDescription>Categorías de productos más rentables en el negocio</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                {categoriasPerf.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="mx-auto h-12 w-12 text-slate-300" />
                    <p className="text-slate-500 mt-2 text-sm">No hay ventas categorizadas en este período.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {categoriasPerf.map((categoria, index) => {
                      const maxCat = categoriasPerf[0]?.totalVendidoUsd || 1;
                      const pct = (categoria.totalVendidoUsd / maxCat) * 100;
                      return (
                        <div key={categoria.nombre} className="space-y-1.5">
                          <div className="flex justify-between items-center text-sm font-semibold text-slate-700">
                            <span className="truncate max-w-[200px]">{categoria.nombre}</span>
                            <span>${categoria.totalVendidoUsd.toLocaleString("es-VE", { minimumFractionDigits: 2 })}</span>
                          </div>
                          
                          {/* Barra de progreso */}
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                                style={{ width: `${pct}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-slate-500 font-medium min-w-[50px] text-right">
                              {categoria.cantidadVendida} uds.
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Eficiencia de Métodos de Pago */}
            <Card className="bg-white/70 backdrop-blur-xl border border-slate-200 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-600" />
                  Métodos de Pago
                </CardTitle>
                <CardDescription>Distribución y volumen de ingresos por método de cobro</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                {metodosPagoPerf.length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCard className="mx-auto h-12 w-12 text-slate-300" />
                    <p className="text-slate-500 mt-2 text-sm">No hay transacciones en este período.</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {metodosPagoPerf.map((pago) => {
                      return (
                        <div key={pago.metodo} className="space-y-1">
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-semibold text-slate-700">{pago.metodo}</span>
                            <div className="text-right">
                              <span className="font-semibold text-slate-700">
                                ${pago.totalVendidoUsd.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                              </span>
                              <span className="text-xs text-slate-500 ml-2">({pago.porcentaje.toFixed(1)}%)</span>
                            </div>
                          </div>
                          
                          {/* Barra de progreso */}
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                              style={{ width: `${pago.porcentaje}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ventas por Día de la Semana (Picos de Venta) */}
            <Card className="bg-white/70 backdrop-blur-xl border border-slate-200 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-rose-600" />
                  Días de Mayor Actividad
                </CardTitle>
                <CardDescription>Ventas acumuladas por cada día de la semana</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                {metrics.ingresosBrutosUsd === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="mx-auto h-12 w-12 text-slate-300" />
                    <p className="text-slate-500 mt-2 text-sm">No hay datos registrados en este período.</p>
                  </div>
                ) : (
                  <div className="flex items-end justify-between h-56 pt-6 px-2">
                    {diasSemanaPerf.map((diaInfo) => {
                      const maxDia = Math.max(...diasSemanaPerf.map((d) => d.totalVendidoUsd)) || 1;
                      const pctHeight = (diaInfo.totalVendidoUsd / maxDia) * 100;
                      return (
                        <div key={diaInfo.dia} className="flex flex-col items-center gap-2 flex-1 group">
                          {/* Tooltip de valor */}
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] rounded px-1.5 py-0.5 absolute -translate-y-8 font-medium shadow-md">
                            ${diaInfo.totalVendidoUsd.toFixed(0)}
                          </span>
                          
                          {/* Columna de gráfico */}
                          <div className="w-8 md:w-10 bg-slate-100 h-36 rounded-xl flex items-end overflow-hidden relative shadow-inner">
                            <div
                              className="w-full bg-gradient-to-t from-rose-500 to-red-500 rounded-xl transition-all duration-500"
                              style={{ height: `${Math.max(pctHeight, 2)}%` }}
                            ></div>
                          </div>
                          
                          {/* Etiqueta del día */}
                          <span className="text-[10px] md:text-xs text-slate-600 font-semibold truncate max-w-[45px] md:max-w-none">
                            {diaInfo.dia.substring(0, 3)}
                          </span>
                          <span className="text-[9px] text-slate-500 font-medium">
                            {diaInfo.porcentaje.toFixed(0)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
