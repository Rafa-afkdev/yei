/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { showToast } from "nextjs-toast-notify";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Categoria } from "@/interfaces/categorias.interface";
import {
    addDocument,
    updateDocument,
} from "@/lib/firebase";
import * as React from "react";

interface CreateUpdateCategoriaFormProps {
    children: React.ReactNode;
    categoriaToUpdate?: Categoria;
    getCategoriasAction: () => Promise<void>;
}


export default function CreateUpdateCategoriaForm({ children, categoriaToUpdate, getCategoriasAction }: CreateUpdateCategoriaFormProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const formSchema = z.object({
        nombre: z.string().min(1, "El nombre es requerido"),
        descripcion: z.string().min(1, "La descripción es requerida"),
        });

        const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: categoriaToUpdate ? categoriaToUpdate : {
            nombre: "",
            descripcion: "",
        },
        });

         const { register, handleSubmit, formState, reset } = form;
        const { errors } = formState;

        // Reset form when dialog opens/closes
        React.useEffect(() => {
            if (open) {
                if (categoriaToUpdate) {
                    reset(categoriaToUpdate);
                } else {
                    reset({
                        nombre: "",
                        descripcion: "",
                    });
                }
            }
        }, [open, categoriaToUpdate, reset]);

          //  TODO ====== FUNCION DE SUBMIT =========///
  const onSubmit = async (categoria: z.infer<typeof formSchema>) => {
    if (categoriaToUpdate) {
      ActualizarCategoria(categoria);
    } else {
      CrearCategoria(categoria);
    }
  };

    //TODO // CREAR UN CATEGORIA EN LA DATABASE ////

const CrearCategoria = async (categoria: z.infer<typeof formSchema>) => {
    const path = `categorias`;
    setIsLoading(true);

    // Normalizar los datos antes de enviar
    const normalizedCategoria = {
        ...categoria,
        nombre: categoria.nombre.trim().toUpperCase(),
        descripcion: categoria.descripcion.trim().toUpperCase(),
        activa: true, // Valor por defecto
        fechaCreacion: new Date().toISOString(),
    };

    try {
        await addDocument(path, normalizedCategoria);
        showToast.success("La categoría fue registrada exitosamente");
        getCategoriasAction();
        setOpen(false);
        reset();
    } catch (error: any) {
        showToast.error(error.message, { duration: 2500 });
    } finally {
        setIsLoading(false);
    }
};

// Normaliza el nombre antes de actualizar
const ActualizarCategoria = async (categoria: z.infer<typeof formSchema>) => {
    const path = `categorias/${categoriaToUpdate?.id}`;
    setIsLoading(true);

    // Normalizar el nombre (ejemplo: quitar espacios y pasar a minúsculas)
    const normalizedCategoria = {
        ...categoria,
        nombre: categoria.nombre.trim().toUpperCase(),
        descripcion: categoria.descripcion.trim().toUpperCase(),
        fechaActualizacion: new Date().toISOString(),
    };

    try {
        await updateDocument(path, normalizedCategoria);
        showToast.success("La categoría fue actualizada exitosamente");
        getCategoriasAction();
        setOpen(false);
        reset();
    } catch (error: any) {
        showToast.error(error.message, { duration: 2500 });
    } finally {
        setIsLoading(false);
    }
};

  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            {children}
        </DialogTrigger>
        <DialogContent className="max-w-md">
    <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
                <DialogTitle>
                    {categoriaToUpdate ? "Actualizar Categoría" : "Crear Categoría"}
                </DialogTitle>
                <DialogDescription>
                    {categoriaToUpdate
                        ? "Actualiza los datos de la categoría."
                        : "Ingresa los datos de la nueva categoría."}
                </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4">
                <div>
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input
                        id="nombre"
                        {...register("nombre")}
                        placeholder="Nombre de la categoría"
                        className="mt-1"
                    />
                    {errors.nombre && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.nombre.message}
                        </p>
                    )}
                </div>

                <div>
                    <Label htmlFor="descripcion">Descripción</Label>
                    <Input
                        id="descripcion"
                        {...register("descripcion")}
                        placeholder="Descripción de la categoría"
                        className="mt-1"
                    />
                    {errors.descripcion && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.descripcion.message}
                        </p>
                    )}
                </div>
                </div>

                <DialogFooter>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && (
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        )}
              {categoriaToUpdate ? "Actualizar Categoría" : "Agregar Categoría"}
            </Button>
          </DialogFooter>
        </form>
        </DialogContent>
    </Dialog>
  )
}
