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
import { Categoria } from '@/interfaces/categorias.interface';
import { SquarePen, Trash2 } from "lucide-react";
import { ConfirmDeletionCategoria } from "./confirm-deletion";
import CreateUpdateCategoriaForm from "./create-update-categoria.form";

export default function TableViewCategorias({
    categoria,
    getCategoriasAction,
    deleteCategoria,
    isLoading,
}: {
    categoria: Categoria[];
    getCategoriasAction: () => Promise<void>;
    deleteCategoria: (categoria: Categoria) => Promise<void>;
    isLoading: boolean;
}) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Descripcion</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Opciones</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {!isLoading &&
                    categoria &&
                    categoria.map((cat) => (
                        <TableRow key={cat.id}>
                            <TableCell>{cat.nombre}</TableCell>
                            <TableCell>{cat.descripcion}</TableCell>
                            <TableCell className={!cat.activa ? "text-red-600 font-semibold" : ""}>
                                {cat.activa ? "ACTIVA" : "INACTIVA"}
                            </TableCell>
                            <TableCell>
                                <CreateUpdateCategoriaForm
                                    categoriaToUpdate={cat}
                                    getCategoriasAction={getCategoriasAction}
                                >
                                    <Button className="p-0.5 mx-1 border-0" variant="outline">
                                    {/* Agregar mx-1 para separación */}
                                        <SquarePen className="w-4 h-4" />
                                    </Button>
                                </CreateUpdateCategoriaForm>

                                <ConfirmDeletionCategoria
                                deleteCategoria={deleteCategoria}
                                categoria={cat}
                                >
                                    <Button
                                        variant="outline"
                                        className="p-0.5 border-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </ConfirmDeletionCategoria>

                                
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
                        </TableRow>
                    ))}
            </TableBody>
            <TableFooter />
        </Table>
    );
}
