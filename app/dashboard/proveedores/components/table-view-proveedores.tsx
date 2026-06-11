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
import { Proveedor } from '@/interfaces/proveedor.interface';
import { SquarePen, Trash2 } from "lucide-react";
import { ConfirmDeletionProveedor } from "./confirm-deletion-proveedor";
import CreateUpdateProveedorForm from "./create-update-proveedor.form";

export default function TableViewProveedores({
  proveedores,
  getProveedoresAction,
  deleteProveedor,
  isLoading,
}: {
  proveedores: Proveedor[];
  getProveedoresAction: () => Promise<void>;
  deleteProveedor: (proveedor: Proveedor) => Promise<void>;
  isLoading: boolean;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>RIF</TableHead>
          <TableHead>Teléfono</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Dirección</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Opciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {!isLoading &&
          proveedores &&
          proveedores.map((prov) => (
            <TableRow key={prov.id}>
              <TableCell>{prov.nombre}</TableCell>
              <TableCell>{prov.rif}</TableCell>
              <TableCell>{prov.telefono}</TableCell>
              <TableCell>{prov.email}</TableCell>
              <TableCell>{prov.direccion}</TableCell>
              <TableCell className={!prov.activo ? "text-red-600 font-semibold" : ""}>
                {prov.activo ? "ACTIVO" : "INACTIVO"}
              </TableCell>
              <TableCell>
                <CreateUpdateProveedorForm
                  proveedorToUpdate={prov}
                  getProveedoresAction={getProveedoresAction}
                >
                  <Button className="p-0.5 mx-1 border-0" variant="outline">
                    <SquarePen className="w-4 h-4" />
                  </Button>
                </CreateUpdateProveedorForm>
                <ConfirmDeletionProveedor deleteProveedor={deleteProveedor} proveedor={prov}>
                  <Button
                    variant="outline"
                    className="p-0.5 border-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </ConfirmDeletionProveedor>
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
            </TableRow>
          ))}
      </TableBody>
      <TableFooter />
    </Table>
  );
}
