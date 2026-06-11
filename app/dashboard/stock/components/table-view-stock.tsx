import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { StockMovimiento } from '@/interfaces/stock.interface';

export default function TableViewStock({
  movimientos,
  productos,
  isLoading,
}: {
  movimientos: StockMovimiento[];
  productos: { id: string; nombre: string }[];
  isLoading: boolean;
}) {
  // Obtener nombre del producto
  const getNombreProducto = (id: string) => {
    const prod = productos.find(p => p.id === id);
    return prod ? prod.nombre : 'Producto eliminado';
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Producto</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Cantidad</TableHead>
          <TableHead>Motivo</TableHead>
          <TableHead>Usuario</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {!isLoading && movimientos && movimientos.map((mov) => (
          <TableRow key={mov.id}>
            <TableCell>{new Date(mov.fecha).toLocaleString()}</TableCell>
            <TableCell>{getNombreProducto(mov.productoId)}</TableCell>
            <TableCell className={mov.tipo === 'entrada' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
              {mov.tipo === 'entrada' ? 'Entrada' : 'Salida'}
            </TableCell>
            <TableCell>{mov.cantidad}</TableCell>
            <TableCell>{mov.motivo}</TableCell>
            <TableCell>{mov.usuario}</TableCell>
          </TableRow>
        ))}
        {isLoading && [1,2,3].map((_,i) => (
          <TableRow key={i}>
            <TableCell><Skeleton className="w-full h-4" /></TableCell>
            <TableCell><Skeleton className="w-full h-4" /></TableCell>
            <TableCell><Skeleton className="w-full h-4" /></TableCell>
            <TableCell><Skeleton className="w-full h-4" /></TableCell>
            <TableCell><Skeleton className="w-full h-4" /></TableCell>
            <TableCell><Skeleton className="w-full h-4" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter />
    </Table>
  );
}
