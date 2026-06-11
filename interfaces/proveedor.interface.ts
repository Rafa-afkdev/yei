export interface Proveedor {
  id: string;
  nombre: string;
  rif: string;
  telefono: string;
  email: string;
  direccion: string;
  activo: boolean;
  createdAt: string;
  updatedAt?: string;
}
