"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  DollarSign, 
  Plus, 
  TrendingUp,
  Calendar,
  CreditCard,
  Banknote,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download
} from "lucide-react";
import { showToast } from "nextjs-toast-notify";
import { 
  Ingreso, 
  IngresoStats, 
  IngresosPorCategoria,
  IngresosPorMetodo,
  FiltroIngresos 
} from "@/interfaces/ingresos.interface";
import { Venta } from "@/interfaces/ventas.interface";
import { getCollection } from "@/lib/firebase";
import CreateIngresoForm from "./components/create-ingreso-form";

export default function IngresosPage() {
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [filteredIngresos, setFilteredIngresos] = useState<Ingreso[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtro, setFiltro] = useState<FiltroIngresos>({
    fecha_inicio: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    fecha_fin: new Date().toISOString().split('T')[0]
  });

  const [stats, setStats] = useState<IngresoStats>({
    total_ingresos_usd: 0,
    total_ingresos_bs: 0,
    ingresos_hoy_usd: 0,
    ingresos_hoy_bs: 0,
    ingresos_mes_usd: 0,
    ingresos_mes_bs: 0,
    ingresos_por_ventas_usd: 0,
    ingresos_por_ventas_bs: 0,
    ingresos_por_servicios_usd: 0,
    ingresos_por_servicios_bs: 0,
    ingresos_otros_usd: 0,
    ingresos_otros_bs: 0,
    crecimiento_mensual: 0,
    promedio_diario_usd: 0,
    promedio_diario_bs: 0
  });

  const [ingresosPorCategoria, setIngresosPorCategoria] = useState<IngresosPorCategoria[]>([]);
  const [ingresosPorMetodo, setIngresosPorMetodo] = useState<IngresosPorMetodo[]>([]);

  // Cargar datos
  const cargarDatos = async () => {
    setIsLoading(true);
    try {
      const [ventasData] = await Promise.all([
        getCollection("ventas")
      ]);

      setVentas(ventasData as Venta[]);
      
      // Generar ingresos desde ventas
      const ingresosGenerados = generarIngresosDesdeVentas(ventasData as Venta[]);
      setIngresos(ingresosGenerados);
      setFilteredIngresos(ingresosGenerados);
      
      calcularEstadisticas(ingresosGenerados);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      showToast.error("Error al cargar los datos");
    } finally {
      setIsLoading(false);
    }
  };

  // Generar ingresos desde ventas
  const generarIngresosDesdeVentas = (ventasData: Venta[]): Ingreso[] => {
    return ventasData.map(venta => ({
      id: `venta-${venta.id}`,
      fecha: venta.fecha_venta,
      concepto: `Venta ${venta.numero_venta}`,
      categoria: 'VENTA' as const,
      monto_usd: venta.total_usd,
      monto_bs: venta.total_bs,
      tasa_dolar: venta.tasa_dolar,
      metodo_pago: venta.metodo_pago,
      venta_id: venta.id,
      cliente_id: venta.cliente_id,
      cliente_nombre: venta.cliente_nombre,
      descripcion: `Venta de ${venta.items.length} productos`,
      estado: 'CONFIRMADO' as const,
      createdAt: venta.createdAt
    }));
  };

  // Calcular estadísticas
  const calcularEstadisticas = (ingresosData: Ingreso[]) => {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const mesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
    const finMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0);

    const ingresosHoy = ingresosData.filter(i => {
      const fechaIngreso = new Date(i.fecha);
      return fechaIngreso.toDateString() === hoy.toDateString() && i.estado === 'CONFIRMADO';
    });

    const ingresosMes = ingresosData.filter(i => {
      const fechaIngreso = new Date(i.fecha);
      return fechaIngreso >= inicioMes && i.estado === 'CONFIRMADO';
    });

    const ingresosMesAnterior = ingresosData.filter(i => {
      const fechaIngreso = new Date(i.fecha);
      return fechaIngreso >= mesAnterior && fechaIngreso <= finMesAnterior && i.estado === 'CONFIRMADO';
    });

    const totalIngresosUsd = ingresosData.filter(i => i.estado === 'CONFIRMADO').reduce((sum, i) => sum + i.monto_usd, 0);
    const totalIngresosBs = ingresosData.filter(i => i.estado === 'CONFIRMADO').reduce((sum, i) => sum + i.monto_bs, 0);
    const ingresosHoyUsd = ingresosHoy.reduce((sum, i) => sum + i.monto_usd, 0);
    const ingresosHoyBs = ingresosHoy.reduce((sum, i) => sum + i.monto_bs, 0);
    const ingresosMesUsd = ingresosMes.reduce((sum, i) => sum + i.monto_usd, 0);
    const ingresosMesBs = ingresosMes.reduce((sum, i) => sum + i.monto_bs, 0);
    const ingresosMesAnteriorUsd = ingresosMesAnterior.reduce((sum, i) => sum + i.monto_usd, 0);

    const ingresosPorVentasUsd = ingresosData.filter(i => i.categoria === 'VENTA' && i.estado === 'CONFIRMADO').reduce((sum, i) => sum + i.monto_usd, 0);
    const ingresosPorVentasBs = ingresosData.filter(i => i.categoria === 'VENTA' && i.estado === 'CONFIRMADO').reduce((sum, i) => sum + i.monto_bs, 0);
    const ingresosPorServiciosUsd = ingresosData.filter(i => i.categoria === 'SERVICIO' && i.estado === 'CONFIRMADO').reduce((sum, i) => sum + i.monto_usd, 0);
    const ingresosPorServiciosBs = ingresosData.filter(i => i.categoria === 'SERVICIO' && i.estado === 'CONFIRMADO').reduce((sum, i) => sum + i.monto_bs, 0);
    const ingresosOtrosUsd = ingresosData.filter(i => i.categoria === 'OTRO' && i.estado === 'CONFIRMADO').reduce((sum, i) => sum + i.monto_usd, 0);
    const ingresosOtrosBs = ingresosData.filter(i => i.categoria === 'OTRO' && i.estado === 'CONFIRMADO').reduce((sum, i) => sum + i.monto_bs, 0);

    const crecimientoMensual = ingresosMesAnteriorUsd > 0 
      ? ((ingresosMesUsd - ingresosMesAnteriorUsd) / ingresosMesAnteriorUsd) * 100 
      : 0;

    const diasMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();
    const promedioDiarioUsd = ingresosMesUsd / diasMes;
    const promedioDiarioBs = ingresosMesBs / diasMes;

    setStats({
      total_ingresos_usd: totalIngresosUsd,
      total_ingresos_bs: totalIngresosBs,
      ingresos_hoy_usd: ingresosHoyUsd,
      ingresos_hoy_bs: ingresosHoyBs,
      ingresos_mes_usd: ingresosMesUsd,
      ingresos_mes_bs: ingresosMesBs,
      ingresos_por_ventas_usd: ingresosPorVentasUsd,
      ingresos_por_ventas_bs: ingresosPorVentasBs,
      ingresos_por_servicios_usd: ingresosPorServiciosUsd,
      ingresos_por_servicios_bs: ingresosPorServiciosBs,
      ingresos_otros_usd: ingresosOtrosUsd,
      ingresos_otros_bs: ingresosOtrosBs,
      crecimiento_mensual: crecimientoMensual,
      promedio_diario_usd: promedioDiarioUsd,
      promedio_diario_bs: promedioDiarioBs
    });

    // Calcular distribución por categoría
    const categorias: IngresosPorCategoria[] = [
      {
        categoria: 'VENTA',
        ingresos_usd: ingresosPorVentasUsd,
        ingresos_bs: ingresosPorVentasBs,
        porcentaje: totalIngresosUsd > 0 ? (ingresosPorVentasUsd / totalIngresosUsd) * 100 : 0,
        cantidad: ingresosData.filter(i => i.categoria === 'VENTA' && i.estado === 'CONFIRMADO').length
      },
      {
        categoria: 'SERVICIO',
        ingresos_usd: ingresosPorServiciosUsd,
        ingresos_bs: ingresosPorServiciosBs,
        porcentaje: totalIngresosUsd > 0 ? (ingresosPorServiciosUsd / totalIngresosUsd) * 100 : 0,
        cantidad: ingresosData.filter(i => i.categoria === 'SERVICIO' && i.estado === 'CONFIRMADO').length
      },
      {
        categoria: 'OTRO',
        ingresos_usd: ingresosOtrosUsd,
        ingresos_bs: ingresosOtrosBs,
        porcentaje: totalIngresosUsd > 0 ? (ingresosOtrosUsd / totalIngresosUsd) * 100 : 0,
        cantidad: ingresosData.filter(i => i.categoria === 'OTRO' && i.estado === 'CONFIRMADO').length
      }
    ];

    setIngresosPorCategoria(categorias);

    // Calcular distribución por método de pago
    const metodos = ['EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'MIXTO'];
    const metodosData: IngresosPorMetodo[] = metodos.map(metodo => {
      const ingresosMetodo = ingresosData.filter(i => i.metodo_pago === metodo && i.estado === 'CONFIRMADO');
      const montoUsd = ingresosMetodo.reduce((sum, i) => sum + i.monto_usd, 0);
      const montoBs = ingresosMetodo.reduce((sum, i) => sum + i.monto_bs, 0);
      
      return {
        metodo_pago: metodo,
        ingresos_usd: montoUsd,
        ingresos_bs: montoBs,
        porcentaje: totalIngresosUsd > 0 ? (montoUsd / totalIngresosUsd) * 100 : 0,
        cantidad: ingresosMetodo.length
      };
    });

    setIngresosPorMetodo(metodosData);
  };

  // Filtrar ingresos
  useEffect(() => {
    let filtered = ingresos;

    if (filtro.fecha_inicio && filtro.fecha_fin) {
      const fechaInicio = new Date(filtro.fecha_inicio);
      const fechaFin = new Date(filtro.fecha_fin);
      
      filtered = filtered.filter(ingreso => {
        const fechaIngreso = new Date(ingreso.fecha);
        return fechaIngreso >= fechaInicio && fechaIngreso <= fechaFin;
      });
    }

    if (filtro.categoria) {
      filtered = filtered.filter(ingreso => ingreso.categoria === filtro.categoria);
    }

    if (filtro.metodo_pago) {
      filtered = filtered.filter(ingreso => ingreso.metodo_pago === filtro.metodo_pago);
    }

    if (filtro.estado) {
      filtered = filtered.filter(ingreso => ingreso.estado === filtro.estado);
    }

    setFilteredIngresos(filtered);
  }, [filtro, ingresos]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const formatCurrency = (amount: number, currency: 'USD' | 'BS' = 'USD') => {
    if (currency === 'USD') {
      return `$${amount.toFixed(2)}`;
    }
    return `${amount.toFixed(2)} Bs`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-VE');
  };

  const getCategoriaIcon = (categoria: string) => {
    switch (categoria) {
      case 'VENTA':
        return '🛒';
      case 'SERVICIO':
        return '⚙️';
      case 'OTRO':
        return '📋';
      default:
        return '💰';
    }
  };

  const getMetodoPagoIcon = (metodo: string) => {
    switch (metodo) {
      case 'EFECTIVO':
        return '💵';
      case 'TRANSFERENCIA':
        return '🏦';
      case 'TARJETA':
        return '💳';
      case 'MIXTO':
        return '🔄';
      default:
        return '💰';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ingresos</h1>
          <p className="text-gray-600">Control y análisis de ingresos</p>
        </div>
        <div className="flex gap-2">
          <CreateIngresoForm getIngresosAction={cargarDatos}>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Registrar Ingreso
            </Button>
          </CreateIngresoForm>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Hoy</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.ingresos_hoy_usd)}
            </div>
            <p className="text-xs text-green-600">
              {formatCurrency(stats.ingresos_hoy_bs, 'BS')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats.ingresos_mes_usd)}
            </div>
            <p className="text-xs text-blue-600">
              {formatCurrency(stats.ingresos_mes_bs, 'BS')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio Diario</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(stats.promedio_diario_usd)}
            </div>
            <p className="text-xs text-purple-600">
              {formatCurrency(stats.promedio_diario_bs, 'BS')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crecimiento</CardTitle>
            {stats.crecimiento_mensual >= 0 ? (
              <ArrowUpRight className="h-4 w-4 text-green-600" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.crecimiento_mensual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.crecimiento_mensual >= 0 ? '+' : ''}{stats.crecimiento_mensual.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">vs mes anterior</p>
          </CardContent>
        </Card>
      </div>

      {/* Distribución por categoría y método */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ingresos por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ingresosPorCategoria.map((categoria) => (
                <div key={categoria.categoria} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getCategoriaIcon(categoria.categoria)}</span>
                    <span className="font-medium">{categoria.categoria}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(categoria.ingresos_usd)}</div>
                    <div className="text-sm text-gray-500">{categoria.porcentaje.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ingresos por Método de Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ingresosPorMetodo.map((metodo) => (
                <div key={metodo.metodo_pago} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getMetodoPagoIcon(metodo.metodo_pago)}</span>
                    <span className="font-medium">{metodo.metodo_pago}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(metodo.ingresos_usd)}</div>
                    <div className="text-sm text-gray-500">{metodo.porcentaje.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <div>
              <Label>Categoría</Label>
              <Button
                variant={filtro.categoria ? "default" : "outline"}
                onClick={() => setFiltro({...filtro, categoria: filtro.categoria ? undefined : 'VENTA'})}
                className="w-full mt-1"
              >
                {filtro.categoria || 'Todas'}
              </Button>
            </div>
            <div>
              <Label>Estado</Label>
              <Button
                variant={filtro.estado ? "default" : "outline"}
                onClick={() => setFiltro({...filtro, estado: filtro.estado ? undefined : 'CONFIRMADO'})}
                className="w-full mt-1"
              >
                {filtro.estado || 'Todos'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de ingresos */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Ingresos ({filteredIngresos.length})</CardTitle>
          <CardDescription>
            Registro detallado de todos los ingresos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : filteredIngresos.length === 0 ? (
            <div className="text-center py-8">
              <PiggyBank className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay ingresos</h3>
              <p className="mt-1 text-sm text-gray-500">
                No se encontraron ingresos en el período seleccionado
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredIngresos.slice(0, 20).map((ingreso) => (
                <div
                  key={ingreso.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-lg">
                      {getCategoriaIcon(ingreso.categoria)}
                    </div>
                    <div>
                      <h3 className="font-medium">{ingreso.concepto}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{formatDate(ingreso.fecha)}</span>
                        <Badge variant="outline" className="text-xs">
                          {ingreso.categoria}
                        </Badge>
                        <span>{getMetodoPagoIcon(ingreso.metodo_pago)} {ingreso.metodo_pago}</span>
                      </div>
                      {ingreso.cliente_nombre && (
                        <p className="text-sm text-gray-500">Cliente: {ingreso.cliente_nombre}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-semibold text-green-600 text-lg">
                      {formatCurrency(ingreso.monto_usd)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatCurrency(ingreso.monto_bs, 'BS')}
                    </div>
                    <Badge 
                      className={`text-xs mt-1 ${
                        ingreso.estado === 'CONFIRMADO' ? 'bg-green-100 text-green-800' :
                        ingreso.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      {ingreso.estado}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
