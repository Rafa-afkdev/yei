
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
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { showToast } from "nextjs-toast-notify";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Productos } from "@/interfaces/productos.interface";
import { addDocument, updateDocument } from "@/lib/firebase";
import {  fetchDollarRate, setManualDollarRate, convertUsdToBs } from "@/lib/dollar-rate";
import * as React from "react";

interface CreateUpdateProductosFormProps {
    children: React.ReactNode;
    productoToUpdate?: Productos;
    getProductosAction: () => Promise<void>;
    categorias: { id: string; nombre: string }[];
}

// Interface para la respuesta de la API del dólar
interface DollarRateResponse {
    success: boolean;
    rate: number;
    date: string;
    source: string;
    error?: string;
}

export default function CreateUpdateProductosForm({ children, productoToUpdate, getProductosAction, categorias }: CreateUpdateProductosFormProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [dollarRate, setDollarRate] = useState<number>(0);
    const [rateSource, setRateSource] = useState<string>('');
    const [showManualInput, setShowManualInput] = useState(false);
    const [manualRate, setManualRate] = useState<string>('');

    // Función para obtener la tasa del dólar desde el BCV
    const getDollarRate = async () => {
        const data = await fetchDollarRate();
        
        if (data.success && data.rate > 0) {
            setDollarRate(data.rate);
            setRateSource(data.source);
            setShowManualInput(false);
            
            // Mostrar mensaje apropiado según la fuente
            if (data.source === 'BCV') {
                showToast.success(`✅ Tasa obtenida del BCV: ${data.rate.toFixed(2)} Bs/$`);
            } else if (data.source === 'Fallback') {
                showToast.warning(`⚠️ BCV no disponible. Usando tasa de referencia: ${data.rate.toFixed(2)} Bs/$`);
            } else {
                showToast.success(`Tasa obtenida (${data.source}): ${data.rate.toFixed(2)} Bs/$`);
            }
            
            return data.rate;
        } else {
            showToast.error('Error al obtener la tasa. Puede ingresar manualmente.');
            setShowManualInput(true);
            return 0;
        }
    };

    // Función para establecer tasa manual
    const handleManualDollarRate = async () => {
        const rate = parseFloat(manualRate);
        if (isNaN(rate) || rate <= 0) {
            showToast.error('Por favor ingrese una tasa válida');
            return;
        }

        const data = await setManualDollarRate(rate);
        
        if (data.success) {
            setDollarRate(data.rate);
            setRateSource(data.source);
            setShowManualInput(false);
            setManualRate('');
            showToast.success(`Tasa manual establecida: ${data.rate.toFixed(2)} Bs/$`);
        } else {
            showToast.error(data.error || 'Error al establecer la tasa manual');
        }
    };

    // Obtener la tasa al abrir el modal
    React.useEffect(() => {
        if (open) {
            getDollarRate();
        }
    }, [open]);

    const formSchema = z.object({
        nombre: z.string().min(1, "El nombre es requerido"),
        descripcion: z.string().min(1, "La descripción es requerida"),
        precio_compra_usd: z.number().min(0, "Requerido"),
        precio_compra_bs: z.number().min(0, "Requerido"),
        precio_venta_usd: z.number().min(0, "Requerido"),
        precio_venta_bs: z.number().min(0, "Requerido"),
        categoriaId: z.string().min(1, "Selecciona una categoría"),
        stock_actual: z.number().min(0, "Requerido"),
        stock_minimo: z.number().min(0, "Requerido"),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: productoToUpdate ? {
            ...productoToUpdate,
        } : {
            nombre: "",
            descripcion: "",
            precio_compra_usd: 0,
            precio_compra_bs: 0,
            precio_venta_usd: 0,
            precio_venta_bs: 0,
            categoriaId: "",
            stock_actual: 0,
            stock_minimo: 0,
        },
    });

    const { register, handleSubmit, formState, reset, watch, setValue } = form;
    const { errors } = formState;

    // Watch para los precios en USD para calcular automáticamente los precios en BS
    const precioCompraUsd = watch("precio_compra_usd");
    const precioVentaUsd = watch("precio_venta_usd");

    // Efecto para calcular automáticamente los precios en bolívares
    React.useEffect(() => {
        if (dollarRate > 0) {
            if (precioCompraUsd > 0) {
                const precioBs = convertUsdToBs(precioCompraUsd, dollarRate);
                setValue("precio_compra_bs", precioBs);
            }
            if (precioVentaUsd > 0) {
                const precioBs = convertUsdToBs(precioVentaUsd, dollarRate);
                setValue("precio_venta_bs", precioBs);
            }
        }
    }, [precioCompraUsd, precioVentaUsd, dollarRate, setValue]);

    React.useEffect(() => {
        if (open) {
            if (productoToUpdate) {
                reset(productoToUpdate);
            } else {
                reset({
                    nombre: "",
                    descripcion: "",
                    precio_compra_usd: 0,
                    precio_compra_bs: 0,
                    precio_venta_usd: 0,
                    precio_venta_bs: 0,
                    categoriaId: "",
                    stock_actual: 0,
                    stock_minimo: 0,
                });
            }
        }
    }, [open, productoToUpdate, reset]);

    const onSubmit = async (producto: z.infer<typeof formSchema>) => {
        if (productoToUpdate) {
            ActualizarProducto(producto);
        } else {
            CrearProducto(producto);
        }
    };

    // Crear producto
    const CrearProducto = async (producto: z.infer<typeof formSchema>) => {
        const path = `productos`;
        setIsLoading(true);
        const normalizedProducto = {
            ...producto,
            nombre: producto.nombre.trim().toUpperCase(),
            descripcion: producto.descripcion.trim().toUpperCase(),
            activa: true,
            createdAt: new Date().toISOString(),
        };
        try {
            await addDocument(path, normalizedProducto);
            showToast.success("El producto fue registrado exitosamente");
            getProductosAction();
            setOpen(false);
            reset();
        } catch (error: any) {
            showToast.error(error.message, { duration: 2500 });
        } finally {
            setIsLoading(false);
        }
    };

    // Actualizar producto
    const ActualizarProducto = async (producto: z.infer<typeof formSchema>) => {
        const path = `productos/${productoToUpdate?.id}`;
        setIsLoading(true);
        const normalizedProducto = {
            ...producto,
            nombre: producto.nombre.trim().toUpperCase(),
            descripcion: producto.descripcion.trim().toUpperCase(),
            updatedAt: new Date().toISOString(),
        };
        try {
            await updateDocument(path, normalizedProducto);
            showToast.success("El producto fue actualizado exitosamente");
            getProductosAction();
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
                            {productoToUpdate ? "Actualizar Producto" : "Crear Producto"}
                        </DialogTitle>
                        <DialogDescription>
                            {productoToUpdate
                                ? "Actualiza los datos del producto."
                                : "Ingresa los datos del nuevo producto."}
                        </DialogDescription>
                        {dollarRate > 0 && (
                            <div className={`mt-2 p-2 rounded-md border ${
                                rateSource === 'BCV' ? 'bg-green-50 border-green-200' :
                                rateSource === 'Fallback' ? 'bg-yellow-50 border-yellow-200' :
                                rateSource === 'Manual' ? 'bg-blue-50 border-blue-200' :
                                'bg-gray-50 border-gray-200'
                            }`}>
                                <p className={`text-sm ${
                                    rateSource === 'BCV' ? 'text-green-700' :
                                    rateSource === 'Fallback' ? 'text-yellow-700' :
                                    rateSource === 'Manual' ? 'text-blue-700' :
                                    'text-gray-700'
                                }`}>
                                    {rateSource === 'BCV' && '✅'} 
                                    {rateSource === 'Fallback' && '⚠️'} 
                                    {rateSource === 'Manual' && '✏️'} 
                                    Tasa del día: <strong>{dollarRate.toFixed(2)} Bs/$</strong>
                                    {rateSource && <span className="ml-2 text-xs">({rateSource})</span>}
                                </p>
                                <p className={`text-xs ${
                                    rateSource === 'BCV' ? 'text-green-600' :
                                    rateSource === 'Fallback' ? 'text-yellow-600' :
                                    rateSource === 'Manual' ? 'text-blue-600' :
                                    'text-gray-600'
                                }`}>
                                    {rateSource === 'Fallback' ? 
                                        'BCV no disponible - Usando tasa de referencia' :
                                        'Los precios en Bs se calculan automáticamente'
                                    }
                                </p>
                                <div className="flex gap-2 mt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="text-xs"
                                        onClick={() => setShowManualInput(true)}
                                    >
                                        Cambiar manualmente
                                    </Button>
                                    {rateSource !== 'BCV' && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                            onClick={getDollarRate}
                                        >
                                            Reintentar BCV
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        {showManualInput && (
                            <div className="mt-2 p-3 bg-yellow-50 rounded-md border border-yellow-200">
                                <p className="text-sm text-yellow-700 mb-2">
                                    ⚠️ Ingrese la tasa del dólar manualmente:
                                </p>
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="Ej: 36.25"
                                        value={manualRate}
                                        onChange={(e) => setManualRate(e.target.value)}
                                        className="flex-1"
                                    />
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={handleManualDollarRate}
                                        disabled={!manualRate || parseFloat(manualRate) <= 0}
                                    >
                                        Aplicar
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setShowManualInput(false);
                                            setManualRate('');
                                            getDollarRate();
                                        }}
                                    >
                                        Reintentar BCV
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogHeader>

                    <div className="grid gap-4">
                        <div>
                            <Label htmlFor="nombre">Nombre</Label>
                            <Input
                                id="nombre"
                                {...register("nombre")}
                                placeholder="Nombre del producto"
                                className="mt-1"
                            />
                            {errors.nombre && (
                                <p className="text-red-500 text-sm mt-1">{errors.nombre.message}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="descripcion">Descripción</Label>
                            <Input
                                id="descripcion"
                                {...register("descripcion")}
                                placeholder="Descripción del producto"
                                className="mt-1"
                            />
                            {errors.descripcion && (
                                <p className="text-red-500 text-sm mt-1">{errors.descripcion.message}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="precio_compra_usd">Precio compra USD</Label>
                            <Input
                                id="precio_compra_usd"
                                type="number"
                                step="0.01"
                                {...register("precio_compra_usd")}
                                placeholder="0.00"
                                className="mt-1"
                            />
                            {errors.precio_compra_usd && (
                                <p className="text-red-500 text-sm mt-1">{errors.precio_compra_usd.message}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="precio_compra_bs">Precio compra Bs (Calculado automáticamente)</Label>
                            <Input
                                id="precio_compra_bs"
                                type="number"
                                step="0.01"
                                {...register("precio_compra_bs")}
                                placeholder="0.00"
                                className="mt-1 bg-gray-50"
                                readOnly
                            />
                            {errors.precio_compra_bs && (
                                <p className="text-red-500 text-sm mt-1">{errors.precio_compra_bs.message}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="precio_venta_usd">Precio venta USD</Label>
                            <Input
                                id="precio_venta_usd"
                                type="number"
                                step="0.01"
                                {...register("precio_venta_usd")}
                                placeholder="0.00"
                                className="mt-1"
                            />
                            {errors.precio_venta_usd && (
                                <p className="text-red-500 text-sm mt-1">{errors.precio_venta_usd.message}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="precio_venta_bs">Precio venta Bs (Calculado automáticamente)</Label>
                            <Input
                                id="precio_venta_bs"
                                type="number"
                                step="0.01"
                                {...register("precio_venta_bs")}
                                placeholder="0.00"
                                className="mt-1 bg-gray-50"
                                readOnly
                            />
                            {errors.precio_venta_bs && (
                                <p className="text-red-500 text-sm mt-1">{errors.precio_venta_bs.message}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="categoriaId">Categoría</Label>
                            <Select onValueChange={(value) => setValue("categoriaId", value)} defaultValue={watch("categoriaId")}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Selecciona una categoría" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categorias.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            {cat.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.categoriaId && (
                                <p className="text-red-500 text-sm mt-1">{errors.categoriaId.message}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="stock_actual">Stock actual</Label>
                            <Input
                                id="stock_actual"
                                type="number"
                                {...register("stock_actual")}
                                placeholder="0"
                                className="mt-1"
                            />
                            {errors.stock_actual && (
                                <p className="text-red-500 text-sm mt-1">{errors.stock_actual.message}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="stock_minimo">Stock mínimo</Label>
                            <Input
                                id="stock_minimo"
                                type="number"
                                {...register("stock_minimo")}
                                placeholder="0"
                                className="mt-1"
                            />
                            {errors.stock_minimo && (
                                <p className="text-red-500 text-sm mt-1">{errors.stock_minimo.message}</p>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && (
                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {productoToUpdate ? "Actualizar Producto" : "Agregar Producto"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
