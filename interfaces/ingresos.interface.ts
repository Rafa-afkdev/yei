export interface Ingreso {
  id?: string;
  fecha: string;
  concepto: string;
  categoria: 'VENTA' | 'SERVICIO' | 'OTRO';
  monto_usd: number;
  monto_bs: number;
  tasa_dolar: number;
  metodo_pago: 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA' | 'MIXTO';
  referencia?: string;
  venta_id?: string;
  factura_id?: string;
  cliente_id?: string;
  cliente_nombre?: string;
  descripcion?: string;
  estado: 'CONFIRMADO' | 'PENDIENTE' | 'CANCELADO';
  createdAt?: string;
  updatedAt?: string;
}

export interface IngresoFormData {
  fecha: string;
  concepto: string;
  categoria: 'VENTA' | 'SERVICIO' | 'OTRO';
  monto_usd: number;
  metodo_pago: 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA' | 'MIXTO';
  referencia?: string;
  cliente_id?: string;
  descripcion?: string;
}

export interface IngresoStats {
  total_ingresos_usd: number;
  total_ingresos_bs: number;
  ingresos_hoy_usd: number;
  ingresos_hoy_bs: number;
  ingresos_mes_usd: number;
  ingresos_mes_bs: number;
  ingresos_por_ventas_usd: number;
  ingresos_por_ventas_bs: number;
  ingresos_por_servicios_usd: number;
  ingresos_por_servicios_bs: number;
  ingresos_otros_usd: number;
  ingresos_otros_bs: number;
  crecimiento_mensual: number;
  promedio_diario_usd: number;
  promedio_diario_bs: number;
}

export interface IngresosPorPeriodo {
  periodo: string;
  ingresos_usd: number;
  ingresos_bs: number;
  cantidad_transacciones: number;
  promedio_transaccion_usd: number;
  promedio_transaccion_bs: number;
}

export interface IngresosPorCategoria {
  categoria: string;
  ingresos_usd: number;
  ingresos_bs: number;
  porcentaje: number;
  cantidad: number;
}

export interface IngresosPorMetodo {
  metodo_pago: string;
  ingresos_usd: number;
  ingresos_bs: number;
  porcentaje: number;
  cantidad: number;
}

export interface FiltroIngresos {
  fecha_inicio: string;
  fecha_fin: string;
  categoria?: string;
  metodo_pago?: string;
  cliente_id?: string;
  estado?: string;
}
