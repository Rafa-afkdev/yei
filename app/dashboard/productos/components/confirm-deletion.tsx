import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"  
import { Productos } from "@/interfaces/productos.interface";
import React from "react";



  export function ConfirmDeletionProductos({children, deleteProducto, producto}: {children: React.ReactNode, deleteProducto: (producto: Productos) => Promise<void>; producto: Productos}) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
        {children}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Estas seguro que deseas eliminar este producto?</AlertDialogTitle>
            <AlertDialogDescription>
          Presiona En Confirmar Para Eliminar El Producto {producto.nombre} de forma permanente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-red-500 text-white hover:bg-red-600"
            onClick={() => deleteProducto(producto)}
            >
            Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }
  