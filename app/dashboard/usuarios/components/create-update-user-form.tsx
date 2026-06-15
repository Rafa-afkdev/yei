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
import { Camera, LoaderCircle, Eye, EyeOff, User as UserIcon } from "lucide-react";
import { showToast } from "nextjs-toast-notify";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { User } from "@/interfaces/user.interface";
import { setDocument, updateDocument, createUserByAdmin } from "@/lib/firebase";
import { fileToBase64 } from "@/actions/convert-file-to-base64";
import * as React from "react";

interface CreateUpdateUserFormProps {
  children: React.ReactNode;
  userToUpdate?: User;
  getUsersAction: () => Promise<void>;
}

export default function CreateUpdateUserForm({
  children,
  userToUpdate,
  getUsersAction,
}: CreateUpdateUserFormProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const formSchema = z.object({
    nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    apellido: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    telefono: z.string().min(10, "El teléfono debe tener al menos 10 dígitos").optional().or(z.literal("")),
    rol: z.enum(["ADMINISTRADOR", "VENDEDOR", "INVENTARIO"]),
    password: userToUpdate
      ? z.string().optional()
      : z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    image: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: userToUpdate
      ? {
          nombre: userToUpdate.nombre || "",
          apellido: userToUpdate.apellido || "",
          email: userToUpdate.email || "",
          telefono: userToUpdate.telefono || "",
          rol: (userToUpdate.rol as any) || "VENDEDOR",
          password: "",
          image: userToUpdate.image || "",
        }
      : {
          nombre: "",
          apellido: "",
          email: "",
          telefono: "",
          rol: "VENDEDOR",
          password: "",
          image: "",
        },
  });

  const { register, handleSubmit, formState, reset, setValue, watch } = form;
  const { errors } = formState;

  useEffect(() => {
    if (open) {
      if (userToUpdate) {
        reset({
          nombre: userToUpdate.nombre || "",
          apellido: userToUpdate.apellido || "",
          email: userToUpdate.email || "",
          telefono: userToUpdate.telefono || "",
          rol: (userToUpdate.rol as any) || "VENDEDOR",
          password: "",
          image: userToUpdate.image || "",
        });
        setImagePreview(userToUpdate.image || null);
      } else {
        reset({
          nombre: "",
          apellido: "",
          email: "",
          telefono: "",
          rol: "VENDEDOR",
          password: "",
          image: "",
        });
        setImagePreview(null);
      }
    }
  }, [open, userToUpdate, reset]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        const dataUrl = `data:${file.type};base64,${base64}`;
        setValue("image", dataUrl);
        setImagePreview(dataUrl);
      } catch (error) {
        console.error("Error al convertir archivo a base64:", error);
        showToast.error("Error al procesar la imagen");
      }
    }
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (userToUpdate) {
      ActualizarUsuario(data);
    } else {
      CrearUsuario(data);
    }
  };

  const CrearUsuario = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      // 1. Crear usuario en Firebase Auth usando la app temporal
      const uid = await createUserByAdmin({
        email: data.email.trim().toLowerCase(),
        password: data.password!,
      });

      // 2. Guardar los datos en la base de datos de Firestore: users/{uid}
      const userData: User = {
        uid,
        email: data.email.trim().toLowerCase(),
        nombre: data.nombre.trim(),
        apellido: data.apellido.trim(),
        telefono: data.telefono?.trim() || "",
        rol: data.rol,
        image: data.image || "",
      };

      await setDocument(`users/${uid}`, userData);

      showToast.success("Usuario registrado exitosamente");
      await getUsersAction();
      setOpen(false);
      reset();
    } catch (error: any) {
      console.error("Error al crear usuario:", error);
      showToast.error(error.message || "Error al registrar el usuario");
    } finally {
      setIsLoading(false);
    }
  };

  const ActualizarUsuario = async (data: z.infer<typeof formSchema>) => {
    if (!userToUpdate?.uid) return;
    setIsLoading(true);
    try {
      const userData: Partial<User> = {
        nombre: data.nombre.trim(),
        apellido: data.apellido.trim(),
        telefono: data.telefono?.trim() || "",
        rol: data.rol,
        image: data.image || "",
      };

      await updateDocument(`users/${userToUpdate.uid}`, userData);

      showToast.success("Usuario actualizado exitosamente");
      await getUsersAction();
      setOpen(false);
      reset();
    } catch (error: any) {
      console.error("Error al actualizar usuario:", error);
      showToast.error(error.message || "Error al actualizar el usuario");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md max-h-[95vh] overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader className="items-center text-center">
            <DialogTitle className="text-xl font-bold">
              {userToUpdate ? "Actualizar Usuario" : "Crear Nuevo Usuario"}
            </DialogTitle>
            <DialogDescription>
              {userToUpdate
                ? "Actualiza los datos del perfil y rol del usuario."
                : "Registra un nuevo usuario con credenciales y rol de acceso."}
            </DialogDescription>
          </DialogHeader>

          {/* Selector de Imagen / Avatar */}
          <div className="flex flex-col items-center justify-center my-6 relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-purple-500 bg-slate-100 flex items-center justify-center relative shadow-inner">
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imagePreview}
                  alt="Vista previa del avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon className="w-12 h-12 text-slate-400" />
              )}
              <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-300">
                <Camera className="w-6 h-6 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs text-slate-600 mt-2 font-medium">Foto de Perfil</p>
          </div>

          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  {...register("nombre")}
                  placeholder="Ej: Juan"
                  className="mt-1"
                />
                {errors.nombre && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.nombre.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="apellido">Apellido *</Label>
                <Input
                  id="apellido"
                  {...register("apellido")}
                  placeholder="Ej: Pérez"
                  className="mt-1"
                />
                {errors.apellido && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.apellido.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="email">Correo Electrónico *</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="usuario@yei.com"
                className="mt-1"
                disabled={!!userToUpdate} // Correo electrónico inmutable por seguridad
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {!userToUpdate && (
              <div>
                <Label htmlFor="password">Contraseña *</Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    placeholder="Contraseña inicial"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                {...register("telefono")}
                placeholder="Ej: 04141234567"
                className="mt-1"
              />
              {errors.telefono && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.telefono.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="rol">Rol de Acceso *</Label>
              <Select
                onValueChange={(value) =>
                  setValue(
                    "rol",
                    value as "ADMINISTRADOR" | "VENDEDOR" | "INVENTARIO"
                  )
                }
                defaultValue={watch("rol")}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecciona el rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMINISTRADOR">⚙️ Administrador</SelectItem>
                  <SelectItem value="VENDEDOR">💼 Vendedor</SelectItem>
                  <SelectItem value="INVENTARIO">📦 Encargado de Inventario</SelectItem>
                </SelectContent>
              </Select>
              {errors.rol && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.rol.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && (
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
              )}
              {userToUpdate ? "Guardar Cambios" : "Registrar Usuario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
