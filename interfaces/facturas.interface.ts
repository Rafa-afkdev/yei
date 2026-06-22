import { VentaItem } from "./ventas.interface";

export interface Factura {
  id?: string;
  idfactura?: string;
  numero_factura: string;
  venta_id?: string;
  numero_venta?: string;
  
  // Información del cliente
  cliente_id?: string;
  cliente_nombre?: string;
  cliente_email?: string;
  cliente_telefono?: string;
  cliente_cedula?: string;
  cliente_direccion?: string;
  
  // Información de la empresa
  empresa_nombre: string;
  empresa_rif: string;
  empresa_direccion: string;
  empresa_telefono?: string;
  empresa_email?: string;
  
  // Items de la factura
  items: VentaItem[];
  
  // Cálculos
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
  
  // Información adicional
  metodo_pago: 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA' | 'MIXTO';
  estado: 'EMITIDA' | 'PAGADA' | 'VENCIDA' | 'ANULADA';
  fecha_emision: string;
  fecha_vencimiento?: string;
  fecha_pago?: string;
  
  // Notas y observaciones
  notas?: string;
  terminos_condiciones?: string;
  
  // Control
  vendedor?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FacturaFormData {
  venta_id?: string;
  cliente_id?: string;
  empresa_nombre: string;
  empresa_rif: string;
  empresa_direccion: string;
  empresa_telefono?: string;
  empresa_email?: string;
  fecha_vencimiento?: string;
  notas?: string;
  terminos_condiciones?: string;
}

export interface FacturaStats {
  total_facturas: number;
  facturas_emitidas: number;
  facturas_pagadas: number;
  facturas_vencidas: number;
  ingresos_facturados_usd: number;
  ingresos_facturados_bs: number;
  facturas_este_mes: number;
}

export interface EmpresaConfig {
  nombre: string;
  rif: string;
  direccion: string;
  telefono?: string;
  email?: string;
  logo?: string;
  terminos_condiciones?: string;
}
