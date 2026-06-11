"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Plus, 
  Users, 
  UserCheck, 
  Crown, 
  Building, 
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye
} from "lucide-react";
import { showToast } from "nextjs-toast-notify";
import { Cliente, ClienteStats } from "@/interfaces/clientes.interface";
import { deleteDocument, getCollection } from "@/lib/firebase";
import CreateUpdateClienteForm from "./components/create-update-cliente-form";
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

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("TODOS");
  const [isLoading, setIsLoading] = useState(true);
  const [clienteToDelete, setClienteToDelete] = useState<Cliente | null>(null);
  const [stats, setStats] = useState<ClienteStats>({
    total_clientes: 0,
    clientes_activos: 0,
    clientes_vip: 0,
    clientes_mayoristas: 0,
    nuevos_este_mes: 0
  });

  // Obtener clientes
  const getClientesAction = async () => {
    setIsLoading(true);
    try {
      const clientesData = await getCollection("clientes");
      const clientesArray = clientesData as Cliente[];
      
      setClientes(clientesArray);
      setFilteredClientes(clientesArray);
      calculateStats(clientesArray);
    } catch (error) {
      console.error("Error al obtener clientes:", error);
      showToast.error("Error al cargar los clientes");
    } finally {
      setIsLoading(false);
    }
  };

  // Calcular estadísticas
  const calculateStats = (clientesData: Cliente[]) => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const stats: ClienteStats = {
      total_clientes: clientesData.length,
      clientes_activos: clientesData.filter(c => c.activo).length,
      clientes_vip: clientesData.filter(c => c.tipo_cliente === 'VIP').length,
      clientes_mayoristas: clientesData.filter(c => c.tipo_cliente === 'MAYORISTA').length,
      nuevos_este_mes: clientesData.filter(c => {
        if (!c.createdAt) return false;
        const createdDate = new Date(c.createdAt);
        return createdDate >= thisMonth;
      }).length
    };

    setStats(stats);
  };

  // Filtrar clientes
  useEffect(() => {
    let filtered = clientes;

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(cliente =>
        cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.cedula.includes(searchTerm) ||
        cliente.telefono.includes(searchTerm)
      );
    }

    // Filtrar por tipo
    if (filterType !== "TODOS") {
      if (filterType === "ACTIVOS") {
        filtered = filtered.filter(cliente => cliente.activo);
      } else if (filterType === "INACTIVOS") {
        filtered = filtered.filter(cliente => !cliente.activo);
      } else {
        filtered = filtered.filter(cliente => cliente.tipo_cliente === filterType);
      }
    }

    setFilteredClientes(filtered);
  }, [searchTerm, filterType, clientes]);

  // Eliminar cliente
  const handleDeleteCliente = async (cliente: Cliente) => {
    if (!cliente.id) return;
    
    try {
      await deleteDocument(`clientes/${cliente.id}`);
      showToast.success("Cliente eliminado exitosamente");
      getClientesAction();
      setClienteToDelete(null);
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
      showToast.error("Error al eliminar el cliente");
    }
  };

  useEffect(() => {
    getClientesAction();
  }, []);

  const getTipoClienteBadge = (tipo: string) => {
    switch (tipo) {
      case 'VIP':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">👑 VIP</Badge>;
      case 'MAYORISTA':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">🏢 Mayorista</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">👤 Regular</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600">Gestiona tu base de clientes</p>
        </div>
        <CreateUpdateClienteForm getClientesAction={getClientesAction}>
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nuevo Cliente
          </Button>
        </CreateUpdateClienteForm>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_clientes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.clientes_activos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VIP</CardTitle>
            <Crown className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.clientes_vip}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mayoristas</CardTitle>
            <Building className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.clientes_mayoristas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nuevos (Mes)</CardTitle>
            <Plus className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.nuevos_este_mes}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y Búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por nombre, email, cédula o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterType === "TODOS" ? "default" : "outline"}
                onClick={() => setFilterType("TODOS")}
                size="sm"
              >
                Todos
              </Button>
              <Button
                variant={filterType === "ACTIVOS" ? "default" : "outline"}
                onClick={() => setFilterType("ACTIVOS")}
                size="sm"
              >
                Activos
              </Button>
              <Button
                variant={filterType === "VIP" ? "default" : "outline"}
                onClick={() => setFilterType("VIP")}
                size="sm"
              >
                VIP
              </Button>
              <Button
                variant={filterType === "MAYORISTA" ? "default" : "outline"}
                onClick={() => setFilterType("MAYORISTA")}
                size="sm"
              >
                Mayoristas
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Clientes */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes ({filteredClientes.length})</CardTitle>
          <CardDescription>
            Gestiona la información de tus clientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : filteredClientes.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay clientes</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterType !== "TODOS" 
                  ? "No se encontraron clientes con los filtros aplicados"
                  : "Comienza agregando tu primer cliente"
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredClientes.map((cliente) => (
                <div
                  key={cliente.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {cliente.nombre.charAt(0)}{cliente.apellido.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">
                          {cliente.nombre} {cliente.apellido}
                        </h3>
                        {getTipoClienteBadge(cliente.tipo_cliente)}
                        {!cliente.activo && (
                          <Badge variant="destructive">Inactivo</Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 space-y-1">
                        <p>📧 {cliente.email}</p>
                        <p>📱 {cliente.telefono} • 🆔 {cliente.cedula}</p>
                        <p>📍 {cliente.ciudad}, {cliente.estado}</p>
                      </div>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalles
                      </DropdownMenuItem>
                      <CreateUpdateClienteForm 
                        clienteToUpdate={cliente} 
                        getClientesAction={getClientesAction}
                      >
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                      </CreateUpdateClienteForm>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => setClienteToDelete(cliente)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de confirmación para eliminar */}
      <AlertDialog open={!!clienteToDelete} onOpenChange={() => setClienteToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el cliente{" "}
              <strong>{clienteToDelete?.nombre} {clienteToDelete?.apellido}</strong> del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => clienteToDelete && handleDeleteCliente(clienteToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
