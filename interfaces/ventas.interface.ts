export interface VentaItem {
  producto_id: string;
  nombre: string;
  precio_usd: number;
  precio_bs: number;
  cantidad: number;
  subtotal_usd: number;
  subtotal_bs: number;
  categoria?: string;
  imagen?: string;
}

export interface Venta {
  id?: string;
  numero_venta: string;
  cliente_id?: string;
  cliente_nombre?: string;
  cliente_email?: string;
  cliente_telefono?: string;
  items: VentaItem[];
  subtotal_usd: number;
  subtotal_bs: number;
  descuento_porcentaje: number;
  descuento_usd: number;
  descuento_bs: number;
  impuesto_porcentaje: number;
  impuesto_usd: number;
  impuesto_bs: number;
  total_usd: number;
  total_bs: number;
  tasa_dolar: number;
  metodo_pago: 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA' | 'MIXTO';
  estado: 'PENDIENTE' | 'PAGADA' | 'CANCELADA';
  notas?: string;
  vendedor?: string;
  fecha_venta: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VentaFormData {
  cliente_id?: string;
  items: VentaItem[];
  descuento_porcentaje: number;
  impuesto_porcentaje: number;
  metodo_pago: 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA' | 'MIXTO';
  notas?: string;
}

export interface VentaStats {
  total_ventas: number;
  ventas_hoy: number;
  ingresos_usd: number;
  ingresos_bs: number;
  productos_vendidos: number;
}
