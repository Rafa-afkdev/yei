import { Button } from "@/components/ui/button";
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
import { Productos } from '@/interfaces/productos.interface';
import { SquarePen, Trash2 } from "lucide-react";
import CreateUpdateProductosForm from "./create-update-pruductos-form";

export default function TableViewProductos({
    productos,
    getProductosAction,
    deleteProducto,
    isLoading,
    categorias,
}: {
    productos: Productos[];
    getProductosAction: () => Promise<void>;
    deleteProducto: (producto: Productos) => Promise<void>;
    isLoading: boolean;
    categorias: { id: string; nombre: string }[];
}) {
    // Función para obtener el nombre de la categoría
    const getCategoryName = (categoriaId: string) => {
        const categoria = categorias.find(cat => cat.id === categoriaId);
        return categoria ? categoria.nombre : 'Sin categoría';
    };

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Precio Venta USD</TableHead>
                    <TableHead>Precio Venta Bs</TableHead>
                    <TableHead>Stock Actual</TableHead>
                    <TableHead>Stock Mínimo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Opciones</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {!isLoading &&
                    productos &&
                    productos.map((producto) => (
                        <TableRow key={producto.id}>
                            <TableCell>{producto.nombre}</TableCell>
                            <TableCell>{producto.descripcion}</TableCell>
                            <TableCell>{getCategoryName(producto.categoriaId)}</TableCell>
                            <TableCell>${producto.precio_venta_usd}</TableCell>
                            <TableCell>{producto.precio_venta_bs} Bs</TableCell>
                            <TableCell className={producto.stock_actual <= producto.stock_minimo ? "text-red-600 font-semibold" : ""}>
                                {producto.stock_actual}
                            </TableCell>
                            <TableCell>{producto.stock_minimo}</TableCell>
                            <TableCell className={!producto.activa ? "text-red-600 font-semibold" : ""}>
                                {producto.activa ? "ACTIVO" : "INACTIVO"}
                            </TableCell>
                            <TableCell>
                                <CreateUpdateProductosForm
                                    productoToUpdate={producto}
                                    getProductosAction={getProductosAction}
                                    categorias={categorias}
                                >
                                    <Button className="p-0.5 mx-1 border-0" variant="outline">
                                        <SquarePen className="w-4 h-4" />
                                    </Button>
                                </CreateUpdateProductosForm>

                                <Button
                                    variant="outline"
                                    className="p-0.5 border-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                                    onClick={() => deleteProducto(producto)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                {isLoading &&
                    [1, 2, 3].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell>
                                <Skeleton className="w-full h-4" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="w-full h-4" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="w-full h-4" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="w-full h-4" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="w-full h-4" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="w-full h-4" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="w-full h-4" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="w-full h-4" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="w-full h-4" />
                            </TableCell>
                        </TableRow>
                    ))}
            </TableBody>
            <TableFooter />
        </Table>
    );
}