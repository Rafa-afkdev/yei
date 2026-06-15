import { Timestamp } from "firebase/firestore";

export interface PedidoItem {
  producto_id: string;
  nombre: string;
  precio_usd: number;
  precio_bs: number;
  cantidad: number;
  subtotal_usd: number;
  subtotal_bs: number;
  categoria?: string;
}

export interface Pedido {
  id?: string;
  numero_pedido: string;
  cliente_id?: string;
  cliente_nombre: string;
  cliente_email?: string;
  cliente_telefono?: string;
  items: PedidoItem[];
  subtotal_usd: number;
  subtotal_bs: number;
  descuento_porcentaje: number;
  descuento_usd: number;
  descuento_bs: number;
  total_usd: number;
  total_bs: number;
  tasa_dolar: number;
  metodo_pago?: 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA' | 'MIXTO';
  tipo_entrega: 'DELIVERY' | 'RETIRO';
  direccion_entrega?: string;
  estado: 'PENDIENTE' | 'PREPARANDO' | 'EN_CAMINO' | 'ENTREGADO' | 'CANCELADO';
  notas?: string;
  fecha_pedido: string;
  createdAt?: any;
  updatedAt?: any;
}
