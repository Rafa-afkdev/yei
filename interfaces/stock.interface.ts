export interface StockMovimiento {
  id: string;
  productoId: string;
  tipo: 'entrada' | 'salida';
  cantidad: number;
  motivo: string;
  fecha: string;
  usuario: string;
}
