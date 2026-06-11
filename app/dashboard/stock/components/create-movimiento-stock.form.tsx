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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addDocument } from "@/lib/firebase";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { showToast } from "nextjs-toast-notify";
import * as React from "react";
import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import * as z from "zod";

interface CreateMovimientoStockFormProps {
  children: React.ReactNode;
  productos: { id: string; nombre: string }[];
  getMovimientosAction: () => Promise<void>;
}

export default function CreateMovimientoStockForm({ children, productos, getMovimientosAction }: CreateMovimientoStockFormProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const formSchema = z.object({
    productoId: z.string().min(1, "Selecciona un producto"),
    tipo: z.enum(["entrada", "salida"]),
    cantidad: z.number().min(1, "Cantidad debe ser mayor a 0"),
    motivo: z.string().min(1, "El motivo es requerido"),
  });

  type MovimientoFormValues = z.infer<typeof formSchema>;

  const form = useForm<MovimientoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productoId: "",
      tipo: "entrada",
      cantidad: 1,
      motivo: "",
    },
  });

  const { register, handleSubmit, formState, reset, setValue, watch } = form;
  const { errors } = formState;

  React.useEffect(() => {
    if (open) {
      reset({
        productoId: "",
        tipo: "entrada",
        cantidad: 1,
        motivo: "",
      });
    }
  }, [open, reset]);

  const onSubmit: SubmitHandler<MovimientoFormValues> = async (movimiento) => {
    await CrearMovimiento(movimiento);
  };

  const CrearMovimiento = async (movimiento: MovimientoFormValues) => {
    const path = `stock_movimientos`;
    setIsLoading(true);
    const normalizedMovimiento = {
      ...movimiento,
      cantidad: Number(movimiento.cantidad),
      fecha: new Date().toISOString(),
      usuario: "admin", // Puedes cambiar esto por el usuario real
    };
    try {
      await addDocument(path, normalizedMovimiento);
      showToast.success("Movimiento registrado exitosamente");
      getMovimientosAction();
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
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Registrar Movimiento de Stock</DialogTitle>
            <DialogDescription>
              Ingresa los datos del movimiento de stock.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="productoId">Producto</Label>
              <Select onValueChange={value => setValue("productoId", value)} defaultValue={watch("productoId") || ""}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecciona un producto" />
                </SelectTrigger>
                <SelectContent>
                  {productos.map((prod) => (
                    <SelectItem key={prod.id} value={prod.id}>{prod.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.productoId && (
                <p className="text-red-500 text-sm mt-1">{errors.productoId.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="tipo">Tipo de movimiento</Label>
              <Select onValueChange={value => setValue("tipo", value as "entrada" | "salida")} defaultValue={watch("tipo") || "entrada"}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="salida">Salida</SelectItem>
                </SelectContent>
              </Select>
              {errors.tipo && (
                <p className="text-red-500 text-sm mt-1">{errors.tipo.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="cantidad">Cantidad</Label>
              <Input id="cantidad" type="number" {...register("cantidad", { valueAsNumber: true })} min={1} className="mt-1" />
              {errors.cantidad && (
                <p className="text-red-500 text-sm mt-1">{errors.cantidad.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="motivo">Motivo</Label>
              <Input id="motivo" {...register("motivo")} placeholder="Motivo del movimiento" className="mt-1" />
              {errors.motivo && (
                <p className="text-red-500 text-sm mt-1">{errors.motivo.message}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading && (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              )}
              Registrar Movimiento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
