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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { showToast } from "nextjs-toast-notify";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Ingreso } from "@/interfaces/ingresos.interface";
import { addDocument } from "@/lib/firebase";
import { fetchDollarRate, convertUsdToBs } from "@/lib/dollar-rate";
import * as React from "react";

interface CreateIngresoFormProps {
    children: React.ReactNode;
    getIngresosAction: () => Promise<void>;
}

export default function CreateIngresoForm({ 
    children, 
    getIngresosAction 
}: CreateIngresoFormProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [dollarRate, setDollarRate] = useState<number>(0);

    const formSchema = z.object({
        fecha: z.string().min(1, "La fecha es requerida"),
        concepto: z.string().min(3, "El concepto debe tener al menos 3 caracteres"),
        categoria: z.enum(["VENTA", "SERVICIO", "OTRO"]),
        monto_usd: z.number().min(0.01, "El monto debe ser mayor a 0"),
        metodo_pago: z.enum(["EFECTIVO", "TRANSFERENCIA", "TARJETA", "MIXTO"]),
        referencia: z.string().optional(),
        descripcion: z.string().optional(),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fecha: new Date().toISOString().split('T')[0],
            concepto: "",
            categoria: "OTRO",
            monto_usd: 0,
            metodo_pago: "EFECTIVO",
            referencia: "",
            descripcion: "",
        },
    });

    const { register, handleSubmit, formState, reset, setValue, watch } = form;
    const { errors } = formState;

    // Obtener tasa del dólar al abrir el modal
    React.useEffect(() => {
        if (open) {
            const loadDollarRate = async () => {
                try {
                    const rateData = await fetchDollarRate();
                    if (rateData.success) {
                        setDollarRate(rateData.rate);
                    }
                } catch (error) {
                    console.error("Error al obtener tasa del dólar:", error);
                }
            };
            loadDollarRate();
        }
    }, [open]);

    React.useEffect(() => {
        if (open) {
            reset({
                fecha: new Date().toISOString().split('T')[0],
                concepto: "",
                categoria: "OTRO",
                monto_usd: 0,
                metodo_pago: "EFECTIVO",
                referencia: "",
                descripcion: "",
            });
        }
    }, [open, reset]);

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        if (dollarRate === 0) {
            showToast.error("No se pudo obtener la tasa del dólar");
            return;
        }

        setIsLoading(true);
        try {
            const monto_bs = convertUsdToBs(data.monto_usd, dollarRate);

            const ingreso: Omit<Ingreso, 'id'> = {
                fecha: data.fecha,
                concepto: data.concepto,
                categoria: data.categoria,
                monto_usd: data.monto_usd,
                monto_bs: monto_bs,
                tasa_dolar: dollarRate,
                metodo_pago: data.metodo_pago,
                referencia: data.referencia,
                descripcion: data.descripcion,
                estado: 'CONFIRMADO'
            };

            // Limpiar campos undefined
            const ingresoLimpio = Object.fromEntries(
                Object.entries(ingreso).filter(([_, value]) => value !== undefined && value !== "")
            );

            await addDocument("ingresos", ingresoLimpio);
            showToast.success("Ingreso registrado exitosamente");
            getIngresosAction();
            setOpen(false);
            reset();
        } catch (error: any) {
            showToast.error(error.message || "Error al registrar el ingreso");
        } finally {
            setIsLoading(false);
        }
    };

    const montoUsd = watch("monto_usd");
    const montoBs = dollarRate > 0 ? convertUsdToBs(montoUsd || 0, dollarRate) : 0;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-lg">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Registrar Nuevo Ingreso</DialogTitle>
                        <DialogDescription>
                            Registra un ingreso adicional al sistema.
                        </DialogDescription>
                        {dollarRate > 0 && (
                            <div className="bg-green-50 p-2 rounded-md border border-green-200">
                                <p className="text-sm text-green-700">
                                    💰 Tasa actual: {dollarRate.toFixed(2)} Bs/$
                                </p>
                            </div>
                        )}
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="fecha">Fecha *</Label>
                                <Input
                                    id="fecha"
                                    type="date"
                                    {...register("fecha")}
                                    className="mt-1"
                                />
                                {errors.fecha && (
                                    <p className="text-red-500 text-sm mt-1">{errors.fecha.message}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="categoria">Categoría *</Label>
                                <Select onValueChange={(value) => setValue("categoria", value as any)}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Seleccionar..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="VENTA">🛒 Venta</SelectItem>
                                        <SelectItem value="SERVICIO">⚙️ Servicio</SelectItem>
                                        <SelectItem value="OTRO">📋 Otro</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.categoria && (
                                    <p className="text-red-500 text-sm mt-1">{errors.categoria.message}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="concepto">Concepto *</Label>
                            <Input
                                id="concepto"
                                {...register("concepto")}
                                placeholder="Ej: Venta de producto, Servicio técnico..."
                                className="mt-1"
                            />
                            {errors.concepto && (
                                <p className="text-red-500 text-sm mt-1">{errors.concepto.message}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="monto_usd">Monto (USD) *</Label>
                                <Input
                                    id="monto_usd"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    {...register("monto_usd", { valueAsNumber: true })}
                                    placeholder="0.00"
                                    className="mt-1"
                                />
                                {errors.monto_usd && (
                                    <p className="text-red-500 text-sm mt-1">{errors.monto_usd.message}</p>
                                )}
                            </div>

                            <div>
                                <Label>Equivalente (Bs)</Label>
                                <div className="mt-1 p-2 bg-gray-50 border rounded-md">
                                    <span className="text-sm font-medium">
                                        {montoBs.toFixed(2)} Bs
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="metodo_pago">Método de Pago *</Label>
                                <Select onValueChange={(value) => setValue("metodo_pago", value as any)}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Seleccionar..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="EFECTIVO">💵 Efectivo</SelectItem>
                                        <SelectItem value="TRANSFERENCIA">🏦 Transferencia</SelectItem>
                                        <SelectItem value="TARJETA">💳 Tarjeta</SelectItem>
                                        <SelectItem value="MIXTO">🔄 Mixto</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.metodo_pago && (
                                    <p className="text-red-500 text-sm mt-1">{errors.metodo_pago.message}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="referencia">Referencia</Label>
                                <Input
                                    id="referencia"
                                    {...register("referencia")}
                                    placeholder="Número de referencia..."
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="descripcion">Descripción</Label>
                            <Textarea
                                id="descripcion"
                                {...register("descripcion")}
                                placeholder="Descripción adicional del ingreso..."
                                className="mt-1"
                                rows={2}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && (
                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Registrar Ingreso
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
