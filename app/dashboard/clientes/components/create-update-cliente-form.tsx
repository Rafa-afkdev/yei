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

import { Cliente } from "@/interfaces/clientes.interface";
import { addDocument, updateDocument } from "@/lib/firebase";
import * as React from "react";

interface CreateUpdateClienteFormProps {
    children: React.ReactNode;
    clienteToUpdate?: Cliente;
    getClientesAction: () => Promise<void>;
}

export default function CreateUpdateClienteForm({ 
    children, 
    clienteToUpdate, 
    getClientesAction 
}: CreateUpdateClienteFormProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const formSchema = z.object({
        nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
        apellido: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
        email: z.string().email("Email inválido"),
        telefono: z.string().min(10, "El teléfono debe tener al menos 10 dígitos"),
        cedula: z.string().min(7, "La cédula debe tener al menos 7 dígitos"),
        direccion: z.string().min(10, "La dirección debe tener al menos 10 caracteres"),
        ciudad: z.string().min(2, "La ciudad es requerida"),
        estado: z.string().min(2, "El estado es requerido"),
        codigo_postal: z.string().optional(),
        fecha_nacimiento: z.string().optional(),
        tipo_cliente: z.enum(["REGULAR", "VIP", "MAYORISTA"]),
        descuento_porcentaje: z.number().min(0).max(100).optional(),
        limite_credito: z.number().min(0).optional(),
        notas: z.string().optional(),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: clienteToUpdate ? {
            nombre: clienteToUpdate.nombre,
            apellido: clienteToUpdate.apellido,
            email: clienteToUpdate.email,
            telefono: clienteToUpdate.telefono,
            cedula: clienteToUpdate.cedula,
            direccion: clienteToUpdate.direccion,
            ciudad: clienteToUpdate.ciudad,
            estado: clienteToUpdate.estado,
            codigo_postal: clienteToUpdate.codigo_postal || "",
            fecha_nacimiento: clienteToUpdate.fecha_nacimiento || "",
            tipo_cliente: clienteToUpdate.tipo_cliente,
            descuento_porcentaje: clienteToUpdate.descuento_porcentaje || 0,
            limite_credito: clienteToUpdate.limite_credito || 0,
            notas: clienteToUpdate.notas || "",
        } : {
            nombre: "",
            apellido: "",
            email: "",
            telefono: "",
            cedula: "",
            direccion: "",
            ciudad: "",
            estado: "",
            codigo_postal: "",
            fecha_nacimiento: "",
            tipo_cliente: "REGULAR",
            descuento_porcentaje: 0,
            limite_credito: 0,
            notas: "",
        },
    });

    const { register, handleSubmit, formState, reset, setValue, watch } = form;
    const { errors } = formState;

    const tipoCliente = watch("tipo_cliente");

    React.useEffect(() => {
        if (open) {
            if (clienteToUpdate) {
                reset({
                    nombre: clienteToUpdate.nombre,
                    apellido: clienteToUpdate.apellido,
                    email: clienteToUpdate.email,
                    telefono: clienteToUpdate.telefono,
                    cedula: clienteToUpdate.cedula,
                    direccion: clienteToUpdate.direccion,
                    ciudad: clienteToUpdate.ciudad,
                    estado: clienteToUpdate.estado,
                    codigo_postal: clienteToUpdate.codigo_postal || "",
                    fecha_nacimiento: clienteToUpdate.fecha_nacimiento || "",
                    tipo_cliente: clienteToUpdate.tipo_cliente,
                    descuento_porcentaje: clienteToUpdate.descuento_porcentaje || 0,
                    limite_credito: clienteToUpdate.limite_credito || 0,
                    notas: clienteToUpdate.notas || "",
                });
            } else {
                reset({
                    nombre: "",
                    apellido: "",
                    email: "",
                    telefono: "",
                    cedula: "",
                    direccion: "",
                    ciudad: "",
                    estado: "",
                    codigo_postal: "",
                    fecha_nacimiento: "",
                    tipo_cliente: "REGULAR",
                    descuento_porcentaje: 0,
                    limite_credito: 0,
                    notas: "",
                });
            }
        }
    }, [open, clienteToUpdate, reset]);

    const onSubmit = async (cliente: z.infer<typeof formSchema>) => {
        if (clienteToUpdate) {
            ActualizarCliente(cliente);
        } else {
            CrearCliente(cliente);
        }
    };

    // Crear cliente
    const CrearCliente = async (cliente: z.infer<typeof formSchema>) => {
        const path = `clientes`;
        setIsLoading(true);
        const normalizedCliente = {
            ...cliente,
            nombre: cliente.nombre.trim().toUpperCase(),
            apellido: cliente.apellido.trim().toUpperCase(),
            email: cliente.email.trim().toLowerCase(),
            ciudad: cliente.ciudad.trim().toUpperCase(),
            estado: cliente.estado.trim().toUpperCase(),
            direccion: cliente.direccion.trim(),
            activo: true,
            createdAt: new Date().toISOString(),
        };
        try {
            await addDocument(path, normalizedCliente);
            showToast.success("El cliente fue registrado exitosamente");
            getClientesAction();
            setOpen(false);
            reset();
        } catch (error: any) {
            showToast.error(error.message, { duration: 2500 });
        } finally {
            setIsLoading(false);
        }
    };

    // Actualizar cliente
    const ActualizarCliente = async (cliente: z.infer<typeof formSchema>) => {
        const path = `clientes/${clienteToUpdate?.id}`;
        setIsLoading(true);
        const normalizedCliente = {
            ...cliente,
            nombre: cliente.nombre.trim().toUpperCase(),
            apellido: cliente.apellido.trim().toUpperCase(),
            email: cliente.email.trim().toLowerCase(),
            ciudad: cliente.ciudad.trim().toUpperCase(),
            estado: cliente.estado.trim().toUpperCase(),
            direccion: cliente.direccion.trim(),
            updatedAt: new Date().toISOString(),
        };
        try {
            await updateDocument(path, normalizedCliente);
            showToast.success("El cliente fue actualizado exitosamente");
            getClientesAction();
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
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>
                            {clienteToUpdate ? "Actualizar Cliente" : "Crear Cliente"}
                        </DialogTitle>
                        <DialogDescription>
                            {clienteToUpdate
                                ? "Actualiza los datos del cliente."
                                : "Ingresa los datos del nuevo cliente."}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* Información Personal */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                                Información Personal
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="nombre">Nombre *</Label>
                                    <Input
                                        id="nombre"
                                        {...register("nombre")}
                                        placeholder="Nombre del cliente"
                                        className="mt-1"
                                    />
                                    {errors.nombre && (
                                        <p className="text-red-500 text-sm mt-1">{errors.nombre.message}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="apellido">Apellido *</Label>
                                    <Input
                                        id="apellido"
                                        {...register("apellido")}
                                        placeholder="Apellido del cliente"
                                        className="mt-1"
                                    />
                                    {errors.apellido && (
                                        <p className="text-red-500 text-sm mt-1">{errors.apellido.message}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="cedula">Cédula *</Label>
                                    <Input
                                        id="cedula"
                                        {...register("cedula")}
                                        placeholder="V-12345678"
                                        className="mt-1"
                                    />
                                    {errors.cedula && (
                                        <p className="text-red-500 text-sm mt-1">{errors.cedula.message}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
                                    <Input
                                        id="fecha_nacimiento"
                                        type="date"
                                        {...register("fecha_nacimiento")}
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Información de Contacto */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                                Información de Contacto
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="email">Email *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        {...register("email")}
                                        placeholder="cliente@email.com"
                                        className="mt-1"
                                    />
                                    {errors.email && (
                                        <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="telefono">Teléfono *</Label>
                                    <Input
                                        id="telefono"
                                        {...register("telefono")}
                                        placeholder="0412-1234567"
                                        className="mt-1"
                                    />
                                    {errors.telefono && (
                                        <p className="text-red-500 text-sm mt-1">{errors.telefono.message}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="direccion">Dirección *</Label>
                                <Textarea
                                    id="direccion"
                                    {...register("direccion")}
                                    placeholder="Dirección completa del cliente"
                                    className="mt-1"
                                    rows={2}
                                />
                                {errors.direccion && (
                                    <p className="text-red-500 text-sm mt-1">{errors.direccion.message}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="ciudad">Ciudad *</Label>
                                    <Input
                                        id="ciudad"
                                        {...register("ciudad")}
                                        placeholder="Caracas"
                                        className="mt-1"
                                    />
                                    {errors.ciudad && (
                                        <p className="text-red-500 text-sm mt-1">{errors.ciudad.message}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="estado">Estado *</Label>
                                    <Input
                                        id="estado"
                                        {...register("estado")}
                                        placeholder="Miranda"
                                        className="mt-1"
                                    />
                                    {errors.estado && (
                                        <p className="text-red-500 text-sm mt-1">{errors.estado.message}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="codigo_postal">Código Postal</Label>
                                    <Input
                                        id="codigo_postal"
                                        {...register("codigo_postal")}
                                        placeholder="1010"
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Información Comercial */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                                Información Comercial
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="tipo_cliente">Tipo de Cliente *</Label>
                                    <Select 
                                        onValueChange={(value) => setValue("tipo_cliente", value as "REGULAR" | "VIP" | "MAYORISTA")} 
                                        defaultValue={watch("tipo_cliente")}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Selecciona el tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="REGULAR">👤 Regular</SelectItem>
                                            <SelectItem value="VIP">👑 VIP</SelectItem>
                                            <SelectItem value="MAYORISTA">🏢 Mayorista</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.tipo_cliente && (
                                        <p className="text-red-500 text-sm mt-1">{errors.tipo_cliente.message}</p>
                                    )}
                                </div>

                                {(tipoCliente === "VIP" || tipoCliente === "MAYORISTA") && (
                                    <div>
                                        <Label htmlFor="descuento_porcentaje">Descuento (%)</Label>
                                        <Input
                                            id="descuento_porcentaje"
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.1"
                                            {...register("descuento_porcentaje", { valueAsNumber: true })}
                                            placeholder="0"
                                            className="mt-1"
                                        />
                                    </div>
                                )}

                                {tipoCliente === "MAYORISTA" && (
                                    <div>
                                        <Label htmlFor="limite_credito">Límite de Crédito ($)</Label>
                                        <Input
                                            id="limite_credito"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            {...register("limite_credito", { valueAsNumber: true })}
                                            placeholder="0.00"
                                            className="mt-1"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Notas */}
                        <div>
                            <Label htmlFor="notas">Notas</Label>
                            <Textarea
                                id="notas"
                                {...register("notas")}
                                placeholder="Notas adicionales sobre el cliente..."
                                className="mt-1"
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && (
                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {clienteToUpdate ? "Actualizar Cliente" : "Crear Cliente"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
