"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Proveedor } from "@/interfaces/proveedor.interface";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";

interface ConfirmDeletionProveedorProps {
  children: React.ReactNode;
  proveedor: Proveedor;
  deleteProveedor: (proveedor: Proveedor) => Promise<void>;
}

export function ConfirmDeletionProveedor({ children, proveedor, deleteProveedor }: ConfirmDeletionProveedorProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    await deleteProveedor(proveedor);
    setIsLoading(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>¿Eliminar proveedor?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-600 mb-4">
          ¿Estás seguro que deseas eliminar el proveedor <span className="font-bold text-red-700">{proveedor.nombre}</span>? Esta acción no se puede deshacer.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
            Eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
