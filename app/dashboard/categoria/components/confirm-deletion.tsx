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
import { Categoria } from "@/interfaces/categorias.interface";
import React from "react";



  export function ConfirmDeletionCategoria({children, deleteCategoria, categoria}: {children: React.ReactNode, deleteCategoria: (categoria: Categoria) => Promise<void>; categoria: Categoria }) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
        {children}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Estas seguro que deseas eliminar esta categoria?</AlertDialogTitle>
            <AlertDialogDescription>
          Presiona En Confirmar Para Eliminar La Categoria {categoria.nombre} de forma permanente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-red-500 text-white hover:bg-red-600"
            onClick={() => deleteCategoria(categoria)}
            >
            Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }
  