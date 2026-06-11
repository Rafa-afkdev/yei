export interface Cliente {
  id?: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  cedula: string;
  direccion: string;
  ciudad: string;
  estado: string;
  codigo_postal?: string;
  fecha_nacimiento?: string;
  tipo_cliente: 'REGULAR' | 'VIP' | 'MAYORISTA';
  descuento_porcentaje?: number;
  limite_credito?: number;
  activo: boolean;
  notas?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClienteFormData {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  cedula: string;
  direccion: string;
  ciudad: string;
  estado: string;
  codigo_postal?: string;
  fecha_nacimiento?: string;
  tipo_cliente: 'REGULAR' | 'VIP' | 'MAYORISTA';
  descuento_porcentaje?: number;
  limite_credito?: number;
  notas?: string;
}

export interface ClienteStats {
  total_clientes: number;
  clientes_activos: number;
  clientes_vip: number;
  clientes_mayoristas: number;
  nuevos_este_mes: number;
}
