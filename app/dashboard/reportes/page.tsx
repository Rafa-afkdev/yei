"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Download,
  Calendar,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  FileText,
  Filter
} from "lucide-react";
import { showToast } from "nextjs-toast-notify";
import { 
  DashboardStats, 
  ReporteVentas, 
  ReporteProductos, 
  ReporteClientes,
  FiltroReporte 
} from "@/interfaces/reportes.interface";
import { Venta } from "@/interfaces/ventas.interface";
import { Productos } from "@/interfaces/productos.interface";
import { Cliente } from "@/interfaces/clientes.interface";
import { getCollection } from "@/lib/firebase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ReportesPage() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [productos, setProductos] = useState<Productos[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtro, setFiltro] = useState<FiltroReporte>({
    fecha_inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    fecha_fin: new Date().toISOString().split('T')[0]
  });

  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    ventas_hoy: 0,
    ventas_mes: 0,
    ingresos_hoy_usd: 0,
    ingresos_hoy_bs: 0,
    ingresos_mes_usd: 0,
    ingresos_mes_bs: 0,
    productos_vendidos_hoy: 0,
    productos_vendidos_mes: 0,
    clientes_nuevos_mes: 0,
    productos_bajo_stock: 0,
    crecimiento_ventas: 0,
    crecimiento_ingresos: 0
  });

  const [reporteVentas, setReporteVentas] = useState<ReporteVentas[]>([]);
  const [reporteProductos, setReporteProductos] = useState<ReporteProductos[]>([]);
  const [reporteClientes, setReporteClientes] = useState<ReporteClientes[]>([]);

  // Cargar datos
  const cargarDatos = async () => {
    setIsLoading(true);
    try {
      const [ventasData, productosData, clientesData] = await Promise.all([
        getCollection("ventas"),
        getCollection("productos"),
        getCollection("clientes")
      ]);

      setVentas(ventasData as Venta[]);
      setProductos(productosData as Productos[]);
      setClientes(clientesData as Cliente[]);
      
      calcularEstadisticas(ventasData as Venta[], productosData as Productos[], clientesData as Cliente[]);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      showToast.error("Error al cargar los datos");
    } finally {
      setIsLoading(false);
    }
  };

  // Calcular estadísticas del dashboard
  const calcularEstadisticas = (ventasData: Venta[], productosData: Productos[], clientesData: Cliente[]) => {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const mesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
    const finMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0);

    // Ventas de hoy
    const ventasHoy = ventasData.filter(v => {
      const fechaVenta = new Date(v.fecha_venta);
      return fechaVenta.toDateString() === hoy.toDateString();
    });

    // Ventas del mes actual
    const ventasMes = ventasData.filter(v => {
      const fechaVenta = new Date(v.fecha_venta);
      return fechaVenta >= inicioMes;
    });

    // Ventas del mes anterior para comparación
    const ventasMesAnterior = ventasData.filter(v => {
      const fechaVenta = new Date(v.fecha_venta);
      return fechaVenta >= mesAnterior && fechaVenta <= finMesAnterior;
    });

    // Clientes nuevos este mes
    const clientesNuevosMes = clientesData.filter(c => {
      if (!c.createdAt) return false;
      const fechaCreacion = new Date(c.createdAt);
      return fechaCreacion >= inicioMes;
    }).length;

    // Productos bajo stock
    const productosBajoStock = productosData.filter(p => 
      p.stock_actual <= p.stock_minimo
    ).length;

    // Cálculos
    const ingresosHoyUsd = ventasHoy.reduce((sum, v) => sum + v.total_usd, 0);
    const ingresosHoyBs = ventasHoy.reduce((sum, v) => sum + v.total_bs, 0);
    const ingresosMesUsd = ventasMes.reduce((sum, v) => sum + v.total_usd, 0);
    const ingresosMesBs = ventasMes.reduce((sum, v) => sum + v.total_bs, 0);
    const ingresosMesAnteriorUsd = ventasMesAnterior.reduce((sum, v) => sum + v.total_usd, 0);

    const productosVendidosHoy = ventasHoy.reduce((sum, v) => 
      sum + v.items.reduce((itemSum, item) => itemSum + item.cantidad, 0), 0
    );
    const productosVendidosMes = ventasMes.reduce((sum, v) => 
      sum + v.items.reduce((itemSum, item) => itemSum + item.cantidad, 0), 0
    );

    const crecimientoVentas = ventasMesAnterior.length > 0 
      ? ((ventasMes.length - ventasMesAnterior.length) / ventasMesAnterior.length) * 100 
      : 0;
    
    const crecimientoIngresos = ingresosMesAnteriorUsd > 0 
      ? ((ingresosMesUsd - ingresosMesAnteriorUsd) / ingresosMesAnteriorUsd) * 100 
      : 0;

    setDashboardStats({
      ventas_hoy: ventasHoy.length,
      ventas_mes: ventasMes.length,
      ingresos_hoy_usd: ingresosHoyUsd,
      ingresos_hoy_bs: ingresosHoyBs,
      ingresos_mes_usd: ingresosMesUsd,
      ingresos_mes_bs: ingresosMesBs,
      productos_vendidos_hoy: productosVendidosHoy,
      productos_vendidos_mes: productosVendidosMes,
      clientes_nuevos_mes: clientesNuevosMes,
      productos_bajo_stock: productosBajoStock,
      crecimiento_ventas: crecimientoVentas,
      crecimiento_ingresos: crecimientoIngresos
    });

    generarReportes(ventasData, productosData, clientesData);
  };

  // Generar reportes detallados
  const generarReportes = (ventasData: Venta[], productosData: Productos[], clientesData: Cliente[]) => {
    const fechaInicio = new Date(filtro.fecha_inicio);
    const fechaFin = new Date(filtro.fecha_fin);

    // Filtrar ventas por período
    const ventasFiltradas = ventasData.filter(v => {
      const fechaVenta = new Date(v.fecha_venta);
      return fechaVenta >= fechaInicio && fechaVenta <= fechaFin;
    });

    // Reporte de productos más vendidos
    const productosVendidos: { [key: string]: ReporteProductos } = {};
    
    ventasFiltradas.forEach(venta => {
      venta.items.forEach(item => {
        if (!productosVendidos[item.producto_id]) {
          const producto = productosData.find(p => p.id === item.producto_id);
          productosVendidos[item.producto_id] = {
            producto_id: item.producto_id,
            nombre: item.nombre,
            categoria: item.categoria || 'Sin categoría',
            cantidad_vendida: 0,
            ingresos_usd: 0,
            ingresos_bs: 0,
            stock_actual: producto?.stock_actual || 0,
            rotacion: 0
          };
        }
        
        productosVendidos[item.producto_id].cantidad_vendida += item.cantidad;
        productosVendidos[item.producto_id].ingresos_usd += item.subtotal_usd;
        productosVendidos[item.producto_id].ingresos_bs += item.subtotal_bs;
      });
    });

    const reporteProductosArray = Object.values(productosVendidos)
      .sort((a, b) => b.cantidad_vendida - a.cantidad_vendida)
      .slice(0, 10);

    // Reporte de clientes
    const clientesCompras: { [key: string]: ReporteClientes } = {};
    
    ventasFiltradas.forEach(venta => {
      if (venta.cliente_id) {
        if (!clientesCompras[venta.cliente_id]) {
          const cliente = clientesData.find(c => c.id === venta.cliente_id);
          clientesCompras[venta.cliente_id] = {
            cliente_id: venta.cliente_id,
            nombre: venta.cliente_nombre || 'Cliente desconocido',
            email: venta.cliente_email || '',
            tipo_cliente: cliente?.tipo_cliente || 'REGULAR',
            total_compras: 0,
            total_gastado_usd: 0,
            total_gastado_bs: 0,
            ultima_compra: venta.fecha_venta,
            frecuencia_compra: 0
          };
        }
        
        clientesCompras[venta.cliente_id].total_compras += 1;
        clientesCompras[venta.cliente_id].total_gastado_usd += venta.total_usd;
        clientesCompras[venta.cliente_id].total_gastado_bs += venta.total_bs;
        
        if (new Date(venta.fecha_venta) > new Date(clientesCompras[venta.cliente_id].ultima_compra)) {
          clientesCompras[venta.cliente_id].ultima_compra = venta.fecha_venta;
        }
      }
    });

    const reporteClientesArray = Object.values(clientesCompras)
      .sort((a, b) => b.total_gastado_usd - a.total_gastado_usd)
      .slice(0, 10);

    setReporteProductos(reporteProductosArray);
    setReporteClientes(reporteClientesArray);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (ventas.length > 0) {
      generarReportes(ventas, productos, clientes);
    }
  }, [filtro, ventas, productos, clientes]);

  const exportarReporte = () => {
    showToast.info("Función de exportación en desarrollo");
  };

  const formatCurrency = (amount: number, currency: 'USD' | 'BS' = 'USD') => {
    if (currency === 'USD') {
      return `$${amount.toFixed(2)}`;
    }
    return `${amount.toFixed(2)} Bs`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-VE');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-600">Análisis y estadísticas del negocio</p>
        </div>
        <Button onClick={exportarReporte} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Exportar Reporte
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros de Período
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="fecha_inicio">Fecha Inicio</Label>
              <Input
                id="fecha_inicio"
                type="date"
                value={filtro.fecha_inicio}
                onChange={(e) => setFiltro({...filtro, fecha_inicio: e.target.value})}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="fecha_fin">Fecha Fin</Label>
              <Input
                id="fecha_fin"
                type="date"
                value={filtro.fecha_fin}
                onChange={(e) => setFiltro({...filtro, fecha_fin: e.target.value})}
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={() => generarReportes(ventas, productos, clientes)}
                className="w-full"
              >
                Actualizar Reportes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Hoy</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.ventas_hoy}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats.ventas_mes} este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Hoy</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(dashboardStats.ingresos_hoy_usd)}
            </div>
            <p className="text-xs text-green-600">
              {formatCurrency(dashboardStats.ingresos_mes_usd)} este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos Vendidos</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {dashboardStats.productos_vendidos_hoy}
            </div>
            <p className="text-xs text-blue-600">
              {dashboardStats.productos_vendidos_mes} este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bajo Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {dashboardStats.productos_bajo_stock}
            </div>
            <p className="text-xs text-red-600">productos</p>
          </CardContent>
        </Card>
      </div>

      {/* Crecimiento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Crecimiento en Ventas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className={`text-2xl font-bold ${dashboardStats.crecimiento_ventas >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {dashboardStats.crecimiento_ventas >= 0 ? '+' : ''}{dashboardStats.crecimiento_ventas.toFixed(1)}%
              </div>
              {dashboardStats.crecimiento_ventas >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-600" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">vs mes anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Crecimiento en Ingresos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className={`text-2xl font-bold ${dashboardStats.crecimiento_ingresos >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {dashboardStats.crecimiento_ingresos >= 0 ? '+' : ''}{dashboardStats.crecimiento_ingresos.toFixed(1)}%
              </div>
              {dashboardStats.crecimiento_ingresos >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-600" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">vs mes anterior</p>
          </CardContent>
        </Card>
      </div>

      {/* Reportes Detallados */}
      <Tabs defaultValue="productos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="productos">Productos Más Vendidos</TabsTrigger>
          <TabsTrigger value="clientes">Mejores Clientes</TabsTrigger>
        </TabsList>

        <TabsContent value="productos">
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Productos Más Vendidos</CardTitle>
              <CardDescription>
                Productos con mayor volumen de ventas en el período seleccionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : reporteProductos.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay datos</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No se encontraron ventas en el período seleccionado
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reporteProductos.map((producto, index) => (
                    <div key={producto.producto_id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-medium">{producto.nombre}</h3>
                          <p className="text-sm text-gray-500">{producto.categoria}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Cantidad</p>
                            <p className="font-semibold">{producto.cantidad_vendida}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Ingresos</p>
                            <p className="font-semibold text-green-600">
                              {formatCurrency(producto.ingresos_usd)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Stock</p>
                            <p className={`font-semibold ${producto.stock_actual <= 10 ? 'text-red-600' : 'text-gray-900'}`}>
                              {producto.stock_actual}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clientes">
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Mejores Clientes</CardTitle>
              <CardDescription>
                Clientes con mayor volumen de compras en el período seleccionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : reporteClientes.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay datos</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No se encontraron clientes con compras en el período seleccionado
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reporteClientes.map((cliente, index) => (
                    <div key={cliente.cliente_id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-medium">{cliente.nombre}</h3>
                          <p className="text-sm text-gray-500">{cliente.email}</p>
                          <Badge className="text-xs mt-1">
                            {cliente.tipo_cliente === 'VIP' && '👑 VIP'}
                            {cliente.tipo_cliente === 'MAYORISTA' && '🏢 Mayorista'}
                            {cliente.tipo_cliente === 'REGULAR' && '👤 Regular'}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Compras</p>
                            <p className="font-semibold">{cliente.total_compras}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Total Gastado</p>
                            <p className="font-semibold text-green-600">
                              {formatCurrency(cliente.total_gastado_usd)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Última Compra</p>
                            <p className="text-sm">{formatDate(cliente.ultima_compra)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
