"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Plus, 
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from "lucide-react";
import { showToast } from "nextjs-toast-notify";
import { Factura, FacturaStats } from "@/interfaces/facturas.interface";
import { Venta } from "@/interfaces/ventas.interface";
import { getCollection, deleteDocument } from "@/lib/firebase";
import CreateFacturaForm from "./components/create-factura-form";
import FacturaDetailModal from "./components/factura-detail-modal";
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

export default function FacturasPage() {
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [filteredFacturas, setFilteredFacturas] = useState<Factura[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("TODAS");
  const [isLoading, setIsLoading] = useState(true);
  const [facturaToDelete, setFacturaToDelete] = useState<Factura | null>(null);
  const [selectedFactura, setSelectedFactura] = useState<Factura | null>(null);
  const [stats, setStats] = useState<FacturaStats>({
    total_facturas: 0,
    facturas_emitidas: 0,
    facturas_pagadas: 0,
    facturas_vencidas: 0,
    ingresos_facturados_usd: 0,
    ingresos_facturados_bs: 0,
    facturas_este_mes: 0
  });

  // Obtener facturas y ventas
  const getFacturasAction = async () => {
    setIsLoading(true);
    try {
      const [facturasData, ventasData] = await Promise.all([
        getCollection("facturas"),
        getCollection("ventas")
      ]);
      
      const facturasArray = facturasData as Factura[];
      const ventasArray = ventasData as Venta[];
      
      setFacturas(facturasArray);
      setVentas(ventasArray);
      setFilteredFacturas(facturasArray);
      calculateStats(facturasArray);
    } catch (error) {
      console.error("Error al obtener facturas:", error);
      showToast.error("Error al cargar las facturas");
    } finally {
      setIsLoading(false);
    }
  };

  // Calcular estadísticas
  const calculateStats = (facturasData: Factura[]) => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const stats: FacturaStats = {
      total_facturas: facturasData.length,
      facturas_emitidas: facturasData.filter(f => f.estado === 'EMITIDA').length,
      facturas_pagadas: facturasData.filter(f => f.estado === 'PAGADA').length,
      facturas_vencidas: facturasData.filter(f => f.estado === 'VENCIDA').length,
      ingresos_facturados_usd: facturasData
        .filter(f => f.estado === 'PAGADA')
        .reduce((sum, f) => sum + f.total_usd, 0),
      ingresos_facturados_bs: facturasData
        .filter(f => f.estado === 'PAGADA')
        .reduce((sum, f) => sum + f.total_bs, 0),
      facturas_este_mes: facturasData.filter(f => {
        if (!f.fecha_emision) return false;
        const fechaEmision = new Date(f.fecha_emision);
        return fechaEmision >= thisMonth;
      }).length
    };

    setStats(stats);
  };

  // Filtrar facturas
  useEffect(() => {
    let filtered = facturas;

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(factura =>
        factura.numero_factura.toLowerCase().includes(searchTerm.toLowerCase()) ||
        factura.cliente_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        factura.cliente_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        factura.numero_venta?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado
    if (filterEstado !== "TODAS") {
      filtered = filtered.filter(factura => factura.estado === filterEstado);
    }

    setFilteredFacturas(filtered);
  }, [searchTerm, filterEstado, facturas]);

  // Eliminar factura
  const handleDeleteFactura = async (factura: Factura) => {
    if (!factura.id) return;
    
    try {
      await deleteDocument(`facturas/${factura.id}`);
      showToast.success("Factura eliminada exitosamente");
      getFacturasAction();
      setFacturaToDelete(null);
    } catch (error) {
      console.error("Error al eliminar factura:", error);
      showToast.error("Error al eliminar la factura");
    }
  };

  useEffect(() => {
    getFacturasAction();
  }, []);

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'EMITIDA':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">📄 Emitida</Badge>;
      case 'PAGADA':
        return <Badge className="bg-green-100 text-green-800 border-green-300">✅ Pagada</Badge>;
      case 'VENCIDA':
        return <Badge className="bg-red-100 text-red-800 border-red-300">⚠️ Vencida</Badge>;
      case 'ANULADA':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">❌ Anulada</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">{estado}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-VE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Facturas</h1>
          <p className="text-gray-600">Gestiona las facturas del sistema</p>
        </div>
        <CreateFacturaForm 
          ventas={ventas.filter(v => v.estado === 'PAGADA')} 
          getFacturasAction={getFacturasAction}
        >
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nueva Factura
          </Button>
        </CreateFacturaForm>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Facturas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_facturas}</div>
            <p className="text-xs text-muted-foreground">
              {stats.facturas_este_mes} este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.facturas_pagadas}</div>
            <p className="text-xs text-green-600">
              ${stats.ingresos_facturados_usd.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emitidas</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.facturas_emitidas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.facturas_vencidas}</div>
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
                placeholder="Buscar por número, cliente o venta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterEstado === "TODAS" ? "default" : "outline"}
                onClick={() => setFilterEstado("TODAS")}
                size="sm"
              >
                Todas
              </Button>
              <Button
                variant={filterEstado === "EMITIDA" ? "default" : "outline"}
                onClick={() => setFilterEstado("EMITIDA")}
                size="sm"
              >
                Emitidas
              </Button>
              <Button
                variant={filterEstado === "PAGADA" ? "default" : "outline"}
                onClick={() => setFilterEstado("PAGADA")}
                size="sm"
              >
                Pagadas
              </Button>
              <Button
                variant={filterEstado === "VENCIDA" ? "default" : "outline"}
                onClick={() => setFilterEstado("VENCIDA")}
                size="sm"
              >
                Vencidas
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Facturas */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Facturas ({filteredFacturas.length})</CardTitle>
          <CardDescription>
            Gestiona las facturas emitidas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : filteredFacturas.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay facturas</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterEstado !== "TODAS" 
                  ? "No se encontraron facturas con los filtros aplicados"
                  : "Comienza creando tu primera factura"
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFacturas.map((factura) => (
                <div
                  key={factura.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">
                          {factura.numero_factura}
                        </h3>
                        {getEstadoBadge(factura.estado)}
                      </div>
                      <div className="text-sm text-gray-500 space-y-1">
                        {factura.cliente_nombre && (
                          <p>👤 {factura.cliente_nombre}</p>
                        )}
                        <p>📅 {formatDate(factura.fecha_emision)}</p>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold text-green-600">
                            ${factura.total_usd.toFixed(2)}
                          </span>
                          <span className="text-xs">
                            {factura.total_bs.toFixed(2)} Bs
                          </span>
                        </div>
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
                      <DropdownMenuItem onClick={() => setSelectedFactura(factura)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalles
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="w-4 h-4 mr-2" />
                        Descargar PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => setFacturaToDelete(factura)}
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

      {/* Modal de detalles de factura */}
      {selectedFactura && (
        <FacturaDetailModal
          factura={selectedFactura}
          isOpen={!!selectedFactura}
          onClose={() => setSelectedFactura(null)}
        />
      )}

      {/* Dialog de confirmación para eliminar */}
      <AlertDialog open={!!facturaToDelete} onOpenChange={() => setFacturaToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la factura{" "}
              <strong>{facturaToDelete?.numero_factura}</strong> del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => facturaToDelete && handleDeleteFactura(facturaToDelete)}
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
