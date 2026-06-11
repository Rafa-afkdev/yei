export interface ReporteVentas {
  periodo: string;
  total_ventas: number;
  cantidad_ventas: number;
  ingresos_usd: number;
  ingresos_bs: number;
  productos_vendidos: number;
  clientes_atendidos: number;
  ticket_promedio_usd: number;
  ticket_promedio_bs: number;
}

export interface ReporteProductos {
  producto_id: string;
  nombre: string;
  categoria: string;
  cantidad_vendida: number;
  ingresos_usd: number;
  ingresos_bs: number;
  stock_actual: number;
  rotacion: number;
}

export interface ReporteClientes {
  cliente_id: string;
  nombre: string;
  email: string;
  tipo_cliente: string;
  total_compras: number;
  total_gastado_usd: number;
  total_gastado_bs: number;
  ultima_compra: string;
  frecuencia_compra: number;
}

export interface ReporteInventario {
  producto_id: string;
  nombre: string;
  categoria: string;
  stock_actual: number;
  stock_minimo: number;
  valor_inventario_usd: number;
  valor_inventario_bs: number;
  estado_stock: 'NORMAL' | 'BAJO' | 'AGOTADO' | 'EXCESO';
  dias_sin_movimiento: number;
}

export interface ReporteFinanciero {
  periodo: string;
  ingresos_totales_usd: number;
  ingresos_totales_bs: number;
  costos_productos_usd: number;
  costos_productos_bs: number;
  ganancia_bruta_usd: number;
  ganancia_bruta_bs: number;
  margen_ganancia: number;
  impuestos_usd: number;
  impuestos_bs: number;
}

export interface FiltroReporte {
  fecha_inicio: string;
  fecha_fin: string;
  categoria?: string;
  cliente_id?: string;
  tipo_cliente?: string;
  producto_id?: string;
  metodo_pago?: string;
}

export interface DashboardStats {
  ventas_hoy: number;
  ventas_mes: number;
  ingresos_hoy_usd: number;
  ingresos_hoy_bs: number;
  ingresos_mes_usd: number;
  ingresos_mes_bs: number;
  productos_vendidos_hoy: number;
  productos_vendidos_mes: number;
  clientes_nuevos_mes: number;
  productos_bajo_stock: number;
  crecimiento_ventas: number;
  crecimiento_ingresos: number;
}
