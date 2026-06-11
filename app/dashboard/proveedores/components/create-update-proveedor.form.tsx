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
import { Proveedor } from "@/interfaces/proveedor.interface";
import { addDocument, updateDocument } from "@/lib/firebase";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { showToast } from "nextjs-toast-notify";
import * as React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

interface CreateUpdateProveedorFormProps {
  children: React.ReactNode;
  proveedorToUpdate?: Proveedor;
  getProveedoresAction: () => Promise<void>;
}

export default function CreateUpdateProveedorForm({ children, proveedorToUpdate, getProveedoresAction }: CreateUpdateProveedorFormProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const formSchema = z.object({
    nombre: z.string().min(1, "El nombre es requerido"),
    rif: z.string().min(1, "El RIF es requerido"),
    telefono: z.string().min(1, "El teléfono es requerido"),
    email: z.string().email("Email inválido"),
    direccion: z.string().min(1, "La dirección es requerida"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: proveedorToUpdate ? proveedorToUpdate : {
      nombre: "",
      rif: "",
      telefono: "",
      email: "",
      direccion: "",
    },
  });

  const { register, handleSubmit, formState, reset } = form;
  const { errors } = formState;

  React.useEffect(() => {
    if (open) {
      if (proveedorToUpdate) {
        reset(proveedorToUpdate);
      } else {
        reset({
          nombre: "",
          rif: "",
          telefono: "",
          email: "",
          direccion: "",
        });
      }
    }
  }, [open, proveedorToUpdate, reset]);

  const onSubmit = async (proveedor: z.infer<typeof formSchema>) => {
    if (proveedorToUpdate) {
      ActualizarProveedor(proveedor);
    } else {
      CrearProveedor(proveedor);
    }
  };

  const CrearProveedor = async (proveedor: z.infer<typeof formSchema>) => {
    const path = `proveedores`;
    setIsLoading(true);
    const normalizedProveedor = {
      ...proveedor,
      nombre: proveedor.nombre.trim().toUpperCase(),
      rif: proveedor.rif.trim().toUpperCase(),
      activo: true,
      createdAt: new Date().toISOString(),
    };
    try {
      await addDocument(path, normalizedProveedor);
      showToast.success("El proveedor fue registrado exitosamente");
      getProveedoresAction();
      setOpen(false);
      reset();
    } catch (error: any) {
      showToast.error(error.message, { duration: 2500 });
    } finally {
      setIsLoading(false);
    }
  };

  const ActualizarProveedor = async (proveedor: z.infer<typeof formSchema>) => {
    const path = `proveedores/${proveedorToUpdate?.id}`;
    setIsLoading(true);
    const normalizedProveedor = {
      ...proveedor,
      nombre: proveedor.nombre.trim().toUpperCase(),
      rif: proveedor.rif.trim().toUpperCase(),
      updatedAt: new Date().toISOString(),
    };
    try {
      await updateDocument(path, normalizedProveedor);
      showToast.success("El proveedor fue actualizado exitosamente");
      getProveedoresAction();
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
              {proveedorToUpdate ? "Actualizar Proveedor" : "Crear Proveedor"}
            </DialogTitle>
            <DialogDescription>
              {proveedorToUpdate
                ? "Actualiza los datos del proveedor."
                : "Ingresa los datos del nuevo proveedor."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" {...register("nombre")} placeholder="Nombre del proveedor" className="mt-1" />
              {errors.nombre && (
                <p className="text-red-500 text-sm mt-1">{errors.nombre.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="rif">RIF</Label>
              <Input id="rif" {...register("rif")} placeholder="RIF del proveedor" className="mt-1" />
              {errors.rif && (
                <p className="text-red-500 text-sm mt-1">{errors.rif.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" {...register("telefono")} placeholder="Teléfono" className="mt-1" />
              {errors.telefono && (
                <p className="text-red-500 text-sm mt-1">{errors.telefono.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" {...register("email")} placeholder="Email" className="mt-1" />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="direccion">Dirección</Label>
              <Input id="direccion" {...register("direccion")} placeholder="Dirección" className="mt-1" />
              {errors.direccion && (
                <p className="text-red-500 text-sm mt-1">{errors.direccion.message}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading && (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              )}
              {proveedorToUpdate ? "Actualizar Proveedor" : "Agregar Proveedor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
