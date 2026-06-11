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

import { Factura, EmpresaConfig } from "@/interfaces/facturas.interface";
import { Venta } from "@/interfaces/ventas.interface";
import { addDocument } from "@/lib/firebase";
import * as React from "react";

interface CreateFacturaFormProps {
    children: React.ReactNode;
    ventas: Venta[];
    getFacturasAction: () => Promise<void>;
}

export default function CreateFacturaForm({ 
    children, 
    ventas,
    getFacturasAction 
}: CreateFacturaFormProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedVenta, setSelectedVenta] = useState<Venta | null>(null);

    // Configuración por defecto de la empresa
    const empresaDefault: EmpresaConfig = {
        nombre: "YEI PROJECT",
        rif: "J-12345678-9",
        direccion: "Caracas, Venezuela",
        telefono: "+58 412-1234567",
        email: "info@yeiproject.com"
    };

    const formSchema = z.object({
        venta_id: z.string().min(1, "Debe seleccionar una venta"),
        empresa_nombre: z.string().min(2, "El nombre de la empresa es requerido"),
        empresa_rif: z.string().min(10, "El RIF debe tener al menos 10 caracteres"),
        empresa_direccion: z.string().min(10, "La dirección debe tener al menos 10 caracteres"),
        empresa_telefono: z.string().optional(),
        empresa_email: z.string().email("Email inválido").optional().or(z.literal("")),
        fecha_vencimiento: z.string().optional(),
        notas: z.string().optional(),
        terminos_condiciones: z.string().optional(),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            venta_id: "",
            empresa_nombre: empresaDefault.nombre,
            empresa_rif: empresaDefault.rif,
            empresa_direccion: empresaDefault.direccion,
            empresa_telefono: empresaDefault.telefono || "",
            empresa_email: empresaDefault.email || "",
            fecha_vencimiento: "",
            notas: "",
            terminos_condiciones: "Pago a 30 días. Después de la fecha de vencimiento se aplicarán intereses moratorios.",
        },
    });

    const { register, handleSubmit, formState, reset, setValue, watch } = form;
    const { errors } = formState;

    const ventaSeleccionada = watch("venta_id");

    React.useEffect(() => {
        if (ventaSeleccionada) {
            const venta = ventas.find(v => v.id === ventaSeleccionada);
            setSelectedVenta(venta || null);
        } else {
            setSelectedVenta(null);
        }
    }, [ventaSeleccionada, ventas]);

    React.useEffect(() => {
        if (open) {
            reset({
                venta_id: "",
                empresa_nombre: empresaDefault.nombre,
                empresa_rif: empresaDefault.rif,
                empresa_direccion: empresaDefault.direccion,
                empresa_telefono: empresaDefault.telefono || "",
                empresa_email: empresaDefault.email || "",
                fecha_vencimiento: "",
                notas: "",
                terminos_condiciones: "Pago a 30 días. Después de la fecha de vencimiento se aplicarán intereses moratorios.",
            });
            setSelectedVenta(null);
        }
    }, [open, reset]);

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        if (!selectedVenta) {
            showToast.error("Debe seleccionar una venta válida");
            return;
        }

        setIsLoading(true);
        try {
            const numeroFactura = `F-${Date.now()}`;
            const fechaEmision = new Date().toISOString();
            
            // Calcular fecha de vencimiento si no se especifica
            let fechaVencimiento = data.fecha_vencimiento;
            if (!fechaVencimiento) {
                const vencimiento = new Date();
                vencimiento.setDate(vencimiento.getDate() + 30); // 30 días por defecto
                fechaVencimiento = vencimiento.toISOString().split('T')[0];
            }

            const factura: Omit<Factura, 'id'> = {
                numero_factura: numeroFactura,
                venta_id: selectedVenta.id,
                numero_venta: selectedVenta.numero_venta,
                
                // Información del cliente (de la venta)
                cliente_id: selectedVenta.cliente_id,
                cliente_nombre: selectedVenta.cliente_nombre,
                cliente_email: selectedVenta.cliente_email,
                cliente_telefono: selectedVenta.cliente_telefono,
                
                // Información de la empresa
                empresa_nombre: data.empresa_nombre,
                empresa_rif: data.empresa_rif,
                empresa_direccion: data.empresa_direccion,
                empresa_telefono: data.empresa_telefono,
                empresa_email: data.empresa_email,
                
                // Items (copiados de la venta)
                items: selectedVenta.items,
                
                // Cálculos (copiados de la venta)
                subtotal_usd: selectedVenta.subtotal_usd,
                subtotal_bs: selectedVenta.subtotal_bs,
                descuento_porcentaje: selectedVenta.descuento_porcentaje,
                descuento_usd: selectedVenta.descuento_usd,
                descuento_bs: selectedVenta.descuento_bs,
                impuesto_porcentaje: selectedVenta.impuesto_porcentaje,
                impuesto_usd: selectedVenta.impuesto_usd,
                impuesto_bs: selectedVenta.impuesto_bs,
                total_usd: selectedVenta.total_usd,
                total_bs: selectedVenta.total_bs,
                tasa_dolar: selectedVenta.tasa_dolar,
                
                // Información adicional
                metodo_pago: selectedVenta.metodo_pago,
                estado: 'EMITIDA',
                fecha_emision: fechaEmision,
                fecha_vencimiento: fechaVencimiento,
                
                // Notas y términos
                notas: data.notas,
                terminos_condiciones: data.terminos_condiciones,
                
                // Control
                vendedor: selectedVenta.vendedor,
            };

            // Limpiar campos undefined
            const facturaLimpia = Object.fromEntries(
                Object.entries(factura).filter(([_, value]) => value !== undefined && value !== "")
            );

            await addDocument("facturas", facturaLimpia);
            showToast.success(`Factura ${numeroFactura} creada exitosamente`);
            getFacturasAction();
            setOpen(false);
            reset();
        } catch (error: any) {
            showToast.error(error.message || "Error al crear la factura");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>Crear Nueva Factura</DialogTitle>
                        <DialogDescription>
                            Genera una factura a partir de una venta existente.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* Selección de Venta */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                                Seleccionar Venta
                            </h3>
                            
                            <div>
                                <Label htmlFor="venta_id">Venta *</Label>
                                <Select onValueChange={(value) => setValue("venta_id", value)}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Seleccionar venta..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ventas.map((venta) => (
                                            <SelectItem key={venta.id} value={venta.id!}>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{venta.numero_venta}</span>
                                                    <span className="text-sm text-gray-500">
                                                        {venta.cliente_nombre || "Cliente no especificado"} - 
                                                        ${venta.total_usd.toFixed(2)}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.venta_id && (
                                    <p className="text-red-500 text-sm mt-1">{errors.venta_id.message}</p>
                                )}
                            </div>

                            {/* Resumen de la venta seleccionada */}
                            {selectedVenta && (
                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <h4 className="font-medium text-blue-900 mb-2">Resumen de la Venta</h4>
                                    <div className="text-sm text-blue-800 space-y-1">
                                        <p><strong>Número:</strong> {selectedVenta.numero_venta}</p>
                                        <p><strong>Cliente:</strong> {selectedVenta.cliente_nombre || "No especificado"}</p>
                                        <p><strong>Fecha:</strong> {new Date(selectedVenta.fecha_venta).toLocaleDateString()}</p>
                                        <p><strong>Total:</strong> ${selectedVenta.total_usd.toFixed(2)} ({selectedVenta.total_bs.toFixed(2)} Bs)</p>
                                        <p><strong>Items:</strong> {selectedVenta.items.length} productos</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Información de la Empresa */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                                Información de la Empresa
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="empresa_nombre">Nombre de la Empresa *</Label>
                                    <Input
                                        id="empresa_nombre"
                                        {...register("empresa_nombre")}
                                        placeholder="Nombre de la empresa"
                                        className="mt-1"
                                    />
                                    {errors.empresa_nombre && (
                                        <p className="text-red-500 text-sm mt-1">{errors.empresa_nombre.message}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="empresa_rif">RIF *</Label>
                                    <Input
                                        id="empresa_rif"
                                        {...register("empresa_rif")}
                                        placeholder="J-12345678-9"
                                        className="mt-1"
                                    />
                                    {errors.empresa_rif && (
                                        <p className="text-red-500 text-sm mt-1">{errors.empresa_rif.message}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="empresa_telefono">Teléfono</Label>
                                    <Input
                                        id="empresa_telefono"
                                        {...register("empresa_telefono")}
                                        placeholder="+58 412-1234567"
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="empresa_email">Email</Label>
                                    <Input
                                        id="empresa_email"
                                        type="email"
                                        {...register("empresa_email")}
                                        placeholder="info@empresa.com"
                                        className="mt-1"
                                    />
                                    {errors.empresa_email && (
                                        <p className="text-red-500 text-sm mt-1">{errors.empresa_email.message}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="empresa_direccion">Dirección *</Label>
                                <Textarea
                                    id="empresa_direccion"
                                    {...register("empresa_direccion")}
                                    placeholder="Dirección completa de la empresa"
                                    className="mt-1"
                                    rows={2}
                                />
                                {errors.empresa_direccion && (
                                    <p className="text-red-500 text-sm mt-1">{errors.empresa_direccion.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Configuración de la Factura */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                                Configuración de la Factura
                            </h3>
                            
                            <div>
                                <Label htmlFor="fecha_vencimiento">Fecha de Vencimiento</Label>
                                <Input
                                    id="fecha_vencimiento"
                                    type="date"
                                    {...register("fecha_vencimiento")}
                                    className="mt-1"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Si no se especifica, se usará 30 días desde hoy
                                </p>
                            </div>

                            <div>
                                <Label htmlFor="notas">Notas</Label>
                                <Textarea
                                    id="notas"
                                    {...register("notas")}
                                    placeholder="Notas adicionales para la factura..."
                                    className="mt-1"
                                    rows={2}
                                />
                            </div>

                            <div>
                                <Label htmlFor="terminos_condiciones">Términos y Condiciones</Label>
                                <Textarea
                                    id="terminos_condiciones"
                                    {...register("terminos_condiciones")}
                                    placeholder="Términos y condiciones de la factura..."
                                    className="mt-1"
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && (
                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Crear Factura
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
