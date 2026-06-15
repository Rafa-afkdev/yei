"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Users,
  Shield,
  UserCheck,
  Crown,
  KeyRound,
  Mail,
  Phone,
  Trash2,
  Edit,
  MoreHorizontal,
  Briefcase,
  Package,
  Calendar,
  AlertCircle
} from "lucide-react";
import { showToast } from "nextjs-toast-notify";
import { User } from "@/interfaces/user.interface";
import { deleteDocument, getCollection, sentResetEmail } from "@/lib/firebase";
import { useUser } from "@/hooks/use-user";
import CreateUpdateUserForm from "./components/create-update-user-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function UsuariosPage() {
  const currentUser = useUser() as any;
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("TODOS");
  const [isLoading, setIsLoading] = useState(true);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    sellers: 0,
    inventory: 0,
  });

  const getUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getCollection("users");
      const usersArray = (data as any[]).map((u) => ({
        ...u,
        email: u.email || u.correo || "",
        rol: u.rol === "ADMIN" ? "ADMINISTRADOR" : u.rol,
        uid: u.uid || u.id || ""
      })) as User[];
      setUsers(usersArray);
      setFilteredUsers(usersArray);
      calculateStats(usersArray);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      showToast.error("Error al cargar los usuarios");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (usersData: User[]) => {
    setStats({
      total: usersData.length,
      admins: usersData.filter((u) => u.rol === "ADMINISTRADOR").length,
      sellers: usersData.filter((u) => u.rol === "VENDEDOR").length,
      inventory: usersData.filter((u) => u.rol === "INVENTARIO").length,
    });
  };

  useEffect(() => {
    if (currentUser) {
      getUsers();
    }
  }, [currentUser]);

  useEffect(() => {
    let filtered = users;

    // Filtro por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.nombre?.toLowerCase().includes(term) ||
          u.apellido?.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term) ||
          u.telefono?.includes(term)
      );
    }

    // Filtro por Rol
    if (roleFilter !== "TODOS") {
      filtered = filtered.filter((u) => u.rol === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [searchTerm, roleFilter, users]);

  const handleDeleteUser = async (user: User) => {
    if (!user.uid) return;
    try {
      await deleteDocument(`users/${user.uid}`);
      showToast.success("Usuario eliminado exitosamente de la base de datos");
      getUsers();
      setUserToDelete(null);
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      showToast.error("Error al eliminar el usuario");
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      await sentResetEmail(email);
      showToast.success(`Correo de restablecimiento enviado a ${email}`);
    } catch (error: any) {
      console.error("Error al restablecer contraseña:", error);
      showToast.error(error.message || "Error al enviar el correo de restablecimiento");
    }
  };

  const getRoleBadge = (rol: string) => {
    switch (rol) {
      case "ADMINISTRADOR":
        return (
          <Badge className="bg-gradient-to-r from-rose-500 to-red-600 text-white border-0 shadow-sm flex items-center gap-1">
            <Crown className="w-3 h-3" /> Admin
          </Badge>
        );
      case "VENDEDOR":
        return (
          <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 shadow-sm flex items-center gap-1">
            <Briefcase className="w-3 h-3" /> Vendedor
          </Badge>
        );
      case "INVENTARIO":
        return (
          <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 shadow-sm flex items-center gap-1">
            <Package className="w-3 h-3" /> Inventario
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-slate-600 border-slate-300">
            {rol}
          </Badge>
        );
    }
  };

  // Validar si el usuario actual tiene rol de Administrador
  // Si no está cargado aún, mostrar skeleton
  if (!currentUser) {
    return (
      <div className="p-6 space-y-6 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Si no es ADMINISTRADOR, mostrar pantalla de acceso denegado
  if (currentUser.rol !== "ADMINISTRADOR") {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-600 shadow-md">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Acceso Denegado</h1>
        <p className="text-slate-600 max-w-md">
          Lo sentimos, solo los usuarios con el rol de <strong>Administrador</strong> tienen permisos para acceder y gestionar este panel.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Control de Usuarios
            </span>
          </h1>
          <p className="text-slate-600">Gestiona las cuentas y accesos del personal en el sistema</p>
        </div>

        <CreateUpdateUserForm getUsersAction={getUsers}>
          <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-purple-500/25 transition-all duration-300 flex items-center gap-2 rounded-xl py-5 px-4">
            <Plus className="w-5 h-5" />
            Nuevo Usuario
          </Button>
        </CreateUpdateUserForm>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: "Total Personal",
            value: stats.total,
            icon: Users,
            color: "from-purple-500 to-indigo-500",
            desc: "Usuarios activos"
          },
          {
            title: "Administradores",
            value: stats.admins,
            icon: Crown,
            color: "from-rose-500 to-red-500",
            desc: "Acceso y control total"
          },
          {
            title: "Vendedores",
            value: stats.sellers,
            icon: Briefcase,
            color: "from-blue-500 to-cyan-500",
            desc: "Facturación y ventas"
          },
          {
            title: "Encargados Inventario",
            value: stats.inventory,
            icon: Package,
            color: "from-emerald-500 to-teal-500",
            desc: "Stock y categorías"
          }
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <Card className="bg-white/70 backdrop-blur-xl border border-slate-200 shadow-xl overflow-hidden relative">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`}></div>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-slate-500 font-medium">{stat.title}</p>
                    <h3 className="text-3xl font-bold text-slate-900 mt-1">{isLoading ? "..." : stat.value}</h3>
                    <p className="text-xs text-slate-500 mt-1">{stat.desc}</p>
                  </div>
                  <div className={`p-4 bg-gradient-to-r ${stat.color} rounded-2xl shadow-lg text-white`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Buscador e Identificación */}
      <Card className="bg-white/70 backdrop-blur-xl border border-slate-200 shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Buscar por nombre, email o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 pr-4 py-6 border-slate-200 rounded-xl focus:border-purple-500 focus:ring-purple-500"
              />
            </div>

            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              {[
                { label: "Todos", value: "TODOS" },
                { label: "Administradores", value: "ADMINISTRADOR" },
                { label: "Vendedores", value: "VENDEDOR" },
                { label: "Inventario", value: "INVENTARIO" }
              ].map((roleOpt) => (
                <Button
                  key={roleOpt.value}
                  variant={roleFilter === roleOpt.value ? "default" : "outline"}
                  onClick={() => setRoleFilter(roleOpt.value)}
                  className={`rounded-xl px-4 py-2 ${
                    roleFilter === roleOpt.value
                      ? "bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/20"
                      : "text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {roleOpt.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Usuarios */}
      {isLoading ? (
        <div className="flex flex-col justify-center items-center py-20 space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="text-slate-600 text-sm font-medium">Obteniendo personal...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-16 bg-white/50 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-sm">
          <Users className="mx-auto h-16 w-16 text-slate-300" />
          <h3 className="mt-4 text-lg font-bold text-slate-900">No se encontraron usuarios</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
            {searchTerm || roleFilter !== "TODOS"
              ? "Prueba ajustando los filtros de búsqueda o el rol seleccionado."
              : "Comienza agregando tu primer usuario del equipo."}
          </p>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredUsers.map((user) => (
              <motion.div
                layout
                key={user.uid}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25 }}
                className="group relative"
              >
                <Card className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-lg group-hover:shadow-2xl hover:border-purple-300 transition-all duration-300 rounded-3xl overflow-hidden flex flex-col h-full">
                  <CardContent className="p-6 flex-1 flex flex-col">
                    {/* Header de la Tarjeta */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-4">
                        {/* Avatar */}
                        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-purple-200 bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center shadow-inner">
                          {user.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={user.image}
                              alt={`${user.nombre} avatar`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                              {user.nombre?.charAt(0)}
                              {user.apellido?.charAt(0)}
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className="font-bold text-slate-900 text-lg leading-tight group-hover:text-purple-700 transition-colors">
                            {user.nombre} {user.apellido}
                          </h3>
                          <div className="mt-1">{getRoleBadge(user.rol)}</div>
                        </div>
                      </div>

                      {/* Botón de opciones */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full">
                            <MoreHorizontal className="w-5 h-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl border-slate-200 shadow-xl">
                          <CreateUpdateUserForm
                            userToUpdate={user}
                            getUsersAction={getUsers}
                          >
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                              <Edit className="w-4 h-4 mr-2 text-slate-600" />
                              Editar Información
                            </DropdownMenuItem>
                          </CreateUpdateUserForm>

                          <DropdownMenuItem
                            onClick={() => handleResetPassword(user.email)}
                            className="cursor-pointer"
                          >
                            <KeyRound className="w-4 h-4 mr-2 text-slate-600" />
                            Enviar Correo de Contraseña
                          </DropdownMenuItem>

                          {currentUser.uid !== user.uid && (
                            <DropdownMenuItem
                              className="text-red-600 cursor-pointer focus:bg-red-50 focus:text-red-700"
                              onClick={() => setUserToDelete(user)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Eliminar Usuario
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Información de contacto */}
                    <div className="mt-6 space-y-2 border-t pt-4 border-slate-100 flex-1">
                      <div className="flex items-center text-sm text-slate-600 gap-2.5">
                        <Mail className="w-4 h-4 text-purple-500 flex-shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>

                      {user.telefono && (
                        <div className="flex items-center text-sm text-slate-600 gap-2.5">
                          <Phone className="w-4 h-4 text-purple-500 flex-shrink-0" />
                          <span>{user.telefono}</span>
                        </div>
                      )}
                    </div>

                    {/* Footer de la tarjeta */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Miembro del equipo</span>
                      </div>
                      {currentUser.uid === user.uid && (
                        <Badge variant="outline" className="text-slate-600 bg-slate-50 border-slate-300">
                          Tú
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Alerta de confirmación para eliminar */}
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">¿Eliminar este usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el registro de{" "}
              <strong>{userToDelete?.nombre} {userToDelete?.apellido}</strong> de la base de datos de Firestore. 
              El usuario ya no podrá iniciar sesión en el panel del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl border-slate-200">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => userToDelete && handleDeleteUser(userToDelete)}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
            >
              Confirmar Eliminación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
