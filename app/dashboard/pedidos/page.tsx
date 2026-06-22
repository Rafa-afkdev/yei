"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  ShoppingBag,
  Plus,
  Search,
  User,
  DollarSign,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Eye,
  Trash2,
  Calendar,
  ChevronRight,
  Package,
  MapPin,
  FileText,
  Save,
  Minus,
  X
} from "lucide-react";
import { showToast } from "nextjs-toast-notify";
import { Pedido, PedidoItem } from "@/interfaces/pedidos.interface";
import { Productos } from "@/interfaces/productos.interface";
import { Cliente } from "@/interfaces/clientes.interface";
import { getCollection, addDocument, updateDocument, deleteDocument } from "@/lib/firebase";
import { fetchDollarRate, convertUsdToBs } from "@/lib/dollar-rate";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function PedidosPage() {
  // Datos
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [filteredPedidos, setFilteredPedidos] = useState<Pedido[]>([]);
  const [productos, setProductos] = useState<Productos[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  
  // Estados de carga e interfaz
  const [isLoading, setIsLoading] = useState(true);
  const [dollarRate, setDollarRate] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("TODOS");
  const [deliveryFilter, setDeliveryFilter] = useState<string>("TODOS");
  
  // Modales
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [selectedPedidoDetails, setSelectedPedidoDetails] = useState<Pedido | null>(null);
  const [pedidoToDelete, setPedidoToDelete] = useState<Pedido | null>(null);
  
  // Formulario Nuevo Pedido
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [carrito, setCarrito] = useState<PedidoItem[]>([]);
  const [tipoEntrega, setTipoEntrega] = useState<'DELIVERY' | 'RETIRO'>('DELIVERY');
  const [direccionEntrega, setDireccionEntrega] = useState("");
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState<number>(0);
  const [notas, setNotas] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estadísticas
  const [stats, setStats] = useState({
    total: 0,
    pendiente: 0,
    preparando: 0,
    enCamino: 0,
    entregado: 0,
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [pedidosData, productosData, clientesData, rateData] = await Promise.all([
        getCollection("pedidos"),
        getCollection("productos"),
        getCollection("clientes"),
        fetchDollarRate(),
      ]);

      const sortedPedidos = (pedidosData as Pedido[]).sort(
        (a, b) => new Date(b.fecha_pedido || b.createdAt || "").getTime() - new Date(a.fecha_pedido || a.createdAt || "").getTime()
      );

      setPedidos(sortedPedidos);
      setFilteredPedidos(sortedPedidos);
      setProductos(productosData as Productos[]);
      setClientes(clientesData as Cliente[]);
      
      if (rateData.success) {
        setDollarRate(rateData.rate);
      }

      calculateStats(sortedPedidos);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      showToast.error("Error al cargar los datos de pedidos");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (pedidosData: Pedido[]) => {
    setStats({
      total: pedidosData.length,
      pendiente: pedidosData.filter((p) => p.estado === "PENDIENTE").length,
      preparando: pedidosData.filter((p) => p.estado === "PREPARANDO").length,
      enCamino: pedidosData.filter((p) => p.estado === "EN_CAMINO").length,
      entregado: pedidosData.filter((p) => p.estado === "ENTREGADO").length,
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtrado de Pedidos
  useEffect(() => {
    let filtered = pedidos;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.numero_pedido.toLowerCase().includes(term) ||
          p.cliente_nombre.toLowerCase().includes(term) ||
          p.cliente_telefono?.includes(term)
      );
    }

    if (statusFilter !== "TODOS") {
      filtered = filtered.filter((p) => p.estado === statusFilter);
    }

    if (deliveryFilter !== "TODOS") {
      filtered = filtered.filter((p) => p.tipo_entrega === deliveryFilter);
    }

    setFilteredPedidos(filtered);
  }, [searchTerm, statusFilter, deliveryFilter, pedidos]);

  // Agregar al Carrito (Nuevo Pedido)
  const agregarAlCarrito = (producto: Productos) => {
    const itemExistente = carrito.find((item) => item.producto_id === producto.id);
    if (itemExistente) {
      if (itemExistente.cantidad < producto.stock_actual) {
        setCarrito(
          carrito.map((item) =>
            item.producto_id === producto.id
              ? {
                  ...item,
                  cantidad: item.cantidad + 1,
                  subtotal_usd: (item.cantidad + 1) * item.precio_usd,
                  subtotal_bs: convertUsdToBs((item.cantidad + 1) * item.precio_usd, dollarRate),
                }
              : item
          )
        );
      } else {
        showToast.warning("No hay suficiente stock disponible");
      }
    } else {
      const nuevoItem: PedidoItem = {
        producto_id: producto.id!,
        nombre: producto.nombre,
        precio_usd: producto.precio_venta_usd,
        precio_bs: convertUsdToBs(producto.precio_venta_usd, dollarRate),
        cantidad: 1,
        subtotal_usd: producto.precio_venta_usd,
        subtotal_bs: convertUsdToBs(producto.precio_venta_usd, dollarRate),
        categoria: producto.categoriaId,
      };
      setCarrito([...carrito, nuevoItem]);
    }
  };

  // Cantidad en Carrito
  const actualizarCantidad = (producto_id: string, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      setCarrito(carrito.filter((item) => item.producto_id !== producto_id));
      return;
    }
    const prod = productos.find((p) => p.id === producto_id);
    if (prod && nuevaCantidad > prod.stock_actual) {
      showToast.warning("No hay suficiente stock disponible");
      return;
    }
    setCarrito(
      carrito.map((item) =>
        item.producto_id === producto_id
          ? {
              ...item,
              cantidad: nuevaCantidad,
              subtotal_usd: nuevaCantidad * item.precio_usd,
              subtotal_bs: convertUsdToBs(nuevaCantidad * item.precio_usd, dollarRate),
            }
          : item
      )
    );
  };

  const calcularTotales = () => {
    const subtotal_usd = carrito.reduce((sum, item) => sum + item.subtotal_usd, 0);
    const subtotal_bs = convertUsdToBs(subtotal_usd, dollarRate);
    const descuento_usd = (subtotal_usd * descuentoPorcentaje) / 100;
    const descuento_bs = convertUsdToBs(descuento_usd, dollarRate);
    const total_usd = subtotal_usd - descuento_usd;
    const total_bs = subtotal_bs - descuento_bs;

    return { subtotal_usd, subtotal_bs, descuento_usd, descuento_bs, total_usd, total_bs };
  };

  const handleCrearPedido = async () => {
    if (!selectedCliente) {
      showToast.error("Por favor, seleccione un cliente");
      return;
    }
    if (carrito.length === 0) {
      showToast.error("Agregue al menos un producto al pedido");
      return;
    }
    if (tipoEntrega === "DELIVERY" && !direccionEntrega.trim()) {
      showToast.error("Escriba la dirección de entrega");
      return;
    }

    setIsSubmitting(true);
    try {
      const totales = calcularTotales();
      const numPedido = `PED-${Date.now().toString().slice(-6)}`;

      const nuevoPedido: Pedido = {
        numero_pedido: numPedido,
        cliente_id: selectedCliente.id,
        cliente_nombre: `${selectedCliente.nombre} ${selectedCliente.apellido}`,
        cliente_email: selectedCliente.email || "",
        cliente_telefono: selectedCliente.telefono || "",
        items: carrito,
        subtotal_usd: totales.subtotal_usd,
        subtotal_bs: totales.subtotal_bs,
        descuento_porcentaje: descuentoPorcentaje,
        descuento_usd: totales.descuento_usd,
        descuento_bs: totales.descuento_bs,
        total_usd: totales.total_usd,
        total_bs: totales.total_bs,
        tasa_dolar: dollarRate,
        tipo_entrega: tipoEntrega,
        direccion_entrega: tipoEntrega === "DELIVERY" ? direccionEntrega.trim() : "",
        estado: "PENDIENTE",
        notas,
        fecha_pedido: new Date().toISOString(),
      };

      await addDocument("pedidos", nuevoPedido);
      showToast.success(`Pedido ${numPedido} registrado con éxito`);
      
      // Limpiar Formulario
      setIsNewOrderOpen(false);
      setSelectedCliente(null);
      setCarrito([]);
      setDireccionEntrega("");
      setDescuentoPorcentaje(0);
      setNotas("");
      setProductSearch("");

      loadData();
    } catch (error) {
      console.error("Error al guardar pedido:", error);
      showToast.error("Error al registrar el pedido");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (pedido: Pedido, nuevoEstado: Pedido["estado"]) => {
    if (!pedido.id) return;
    try {
      await updateDocument(`pedidos/${pedido.id}`, {
        estado: nuevoEstado,
        updatedAt: new Date().toISOString(),
      });
      showToast.success(`Pedido ${pedido.numero_pedido} actualizado a ${nuevoEstado}`);
      loadData();
    } catch (error) {
      console.error("Error al actualizar estado del pedido:", error);
      showToast.error("Error al actualizar estado");
    }
  };

  const handleDeletePedido = async (pedido: Pedido) => {
    if (!pedido.id) return;
    try {
      await deleteDocument(`pedidos/${pedido.id}`);
      showToast.success("Pedido eliminado exitosamente");
      loadData();
      setPedidoToDelete(null);
    } catch (error) {
      console.error("Error al eliminar pedido:", error);
      showToast.error("Error al eliminar pedido");
    }
  };

  const getStatusBadge = (estado: Pedido["estado"]) => {
    switch (estado) {
      case "PENDIENTE":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-300">⏳ Pendiente</Badge>;
      case "PREPARANDO":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">📦 Preparando</Badge>;
      case "EN_CAMINO":
        return <Badge className="bg-purple-100 text-purple-800 border-purple-300">🚚 En camino</Badge>;
      case "ENTREGADO":
        return <Badge className="bg-green-100 text-green-800 border-green-300">✅ Entregado</Badge>;
      case "CANCELADO":
        return <Badge className="bg-red-100 text-red-800 border-red-300">❌ Cancelado</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  const getNextStatusAction = (pedido: Pedido) => {
    switch (pedido.estado) {
      case "PENDIENTE":
        return (
          <Button
            size="sm"
            onClick={() => handleUpdateStatus(pedido, "PREPARANDO")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-1 rounded-xl"
          >
            Iniciar preparación <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        );
      case "PREPARANDO":
        return (
          <Button
            size="sm"
            onClick={() => handleUpdateStatus(pedido, "EN_CAMINO")}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium flex items-center gap-1 rounded-xl"
          >
            Enviar pedido <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        );
      case "EN_CAMINO":
        return (
          <Button
            size="sm"
            onClick={() => handleUpdateStatus(pedido, "ENTREGADO")}
            className="bg-green-600 hover:bg-green-700 text-white font-medium flex items-center gap-1 rounded-xl"
          >
            Entregado <CheckCircle className="w-3.5 h-3.5" />
          </Button>
        );
      default:
        return null;
    }
  };

  const cleanCarrito = () => {
    setCarrito([]);
  };

  const prodsFiltrados = productos.filter(
    (p) =>
      p.activa &&
      p.nombre.toLowerCase().includes(productSearch.toLowerCase())
  );

  const totales = calcularTotales();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Pedidos de Clientes
            </span>
          </h1>
          <p className="text-slate-600">Monitorea despachos, entregas y la logística del negocio</p>
        </div>

        <Dialog open={isNewOrderOpen} onOpenChange={setIsNewOrderOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-purple-500/25 transition-all duration-300 flex items-center gap-2 rounded-xl py-5 px-4">
              <Plus className="w-5 h-5" />
              Nuevo Pedido
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Registrar Nuevo Pedido</DialogTitle>
              <DialogDescription>
                Añade artículos y define el tipo de entrega para tu cliente.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
              {/* Sección izquierda: Cliente y Productos */}
              <div className="space-y-4">
                {/* Selector Cliente */}
                <div className="space-y-1">
                  <Label>Cliente *</Label>
                  {selectedCliente ? (
                    <div className="flex justify-between items-center bg-purple-50 border border-purple-200 rounded-xl p-3 text-slate-700">
                      <div>
                        <p className="font-bold text-sm">
                          {selectedCliente.nombre} {selectedCliente.apellido}
                        </p>
                        <p className="text-xs text-slate-500">{selectedCliente.telefono || "Sin teléfono"}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600" onClick={() => setSelectedCliente(null)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Combobox
                      placeholder="Seleccionar cliente..."
                      items={clientes
                        .filter((c) => c.activo)
                        .map((c) => ({
                          value: c.id!,
                          label: `${c.nombre} ${c.apellido}`,
                          description: `${c.email || ""} ${c.telefono ? `· ${c.telefono}` : ""}`,
                        }))}
                      value={null}
                      onChange={(value) => {
                        const cliente = clientes.find((c) => c.id === value);
                        if (cliente) {
                          setSelectedCliente(cliente);
                          if (cliente.descuento_porcentaje) {
                            setDescuentoPorcentaje(cliente.descuento_porcentaje);
                          }
                        }
                      }}
                    />
                  )}
                </div>

                {/* Selección Productos */}
                <div className="space-y-2">
                  <Label>Buscar Artículos</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Escribe el nombre del producto..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="pl-10 rounded-xl"
                    />
                  </div>
                  <div className="border border-slate-200 rounded-xl max-h-52 overflow-y-auto divide-y divide-slate-100">
                    {prodsFiltrados.length === 0 ? (
                      <p className="text-center text-xs text-slate-500 py-4">No se encontraron productos activos</p>
                    ) : (
                      prodsFiltrados.map((prod) => (
                        <div key={prod.id} className="flex justify-between items-center p-3 hover:bg-slate-50 transition-colors">
                          <div>
                            <p className="font-semibold text-xs text-slate-700">{prod.nombre}</p>
                            <p className="text-[10px] text-green-600 font-bold">${prod.precio_venta_usd.toFixed(2)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-500 bg-slate-100 rounded px-1.5 py-0.5">
                              Stock: {prod.stock_actual}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 w-7 p-0 rounded-lg border-purple-200 hover:bg-purple-50 text-purple-600"
                              onClick={() => agregarAlCarrito(prod)}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Sección derecha: Carrito y Entrega */}
              <div className="space-y-4">
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
                  <h3 className="font-bold text-sm text-slate-800 flex justify-between items-center">
                    Artículos en Pedido ({carrito.length})
                    {carrito.length > 0 && (
                      <Button variant="ghost" size="sm" onClick={cleanCarrito} className="text-red-500 hover:text-red-700 h-auto p-0 font-semibold text-xs">
                        Vaciar
                      </Button>
                    )}
                  </h3>
                  
                  {carrito.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-xs">
                      Selecciona productos de la lista.
                    </div>
                  ) : (
                    <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                      {carrito.map((item) => (
                        <div key={item.producto_id} className="flex justify-between items-center bg-white p-2 rounded-xl border border-slate-150">
                          <div className="truncate max-w-[150px]">
                            <p className="font-bold text-xs text-slate-700 truncate">{item.nombre}</p>
                            <p className="text-[10px] text-slate-500">${item.precio_usd.toFixed(2)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="h-6 w-6 p-0 rounded" onClick={() => actualizarCantidad(item.producto_id, item.cantidad - 1)}>
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-xs font-semibold w-5 text-center">{item.cantidad}</span>
                            <Button variant="outline" size="sm" className="h-6 w-6 p-0 rounded" onClick={() => actualizarCantidad(item.producto_id, item.cantidad + 1)}>
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <span className="text-xs font-bold text-slate-700 min-w-[50px] text-right">
                            ${item.subtotal_usd.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Ajustes de Entrega */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Tipo de Entrega</Label>
                      <Select value={tipoEntrega} onValueChange={(value) => setTipoEntrega(value as "DELIVERY" | "RETIRO")}>
                        <SelectTrigger className="mt-1 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DELIVERY">🚚 Delivery</SelectItem>
                          <SelectItem value="RETIRO">🏪 Retiro en Tienda</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Descuento (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={descuentoPorcentaje}
                        onChange={(e) => setDescuentoPorcentaje(Number(e.target.value))}
                        className="mt-1 rounded-xl"
                      />
                    </div>
                  </div>

                  {tipoEntrega === "DELIVERY" && (
                    <div>
                      <Label htmlFor="dir">Dirección de Entrega *</Label>
                      <Input
                        id="dir"
                        placeholder="Ej: Av. Principal, Apto 4B"
                        value={direccionEntrega}
                        onChange={(e) => setDireccionEntrega(e.target.value)}
                        className="mt-1 rounded-xl"
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="notes">Notas del Pedido</Label>
                    <Textarea
                      id="notes"
                      placeholder="Instrucciones especiales..."
                      value={notas}
                      onChange={(e) => setNotas(e.target.value)}
                      rows={2}
                      className="mt-1 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Resumen Final */}
            {carrito.length > 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-center md:text-left">
                  <p className="text-xs text-slate-500">Total a pagar</p>
                  <p className="text-2xl font-extrabold text-green-600">
                    ${totales.total_usd.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-slate-500">
                    {totales.total_bs.toLocaleString("es-VE", { minimumFractionDigits: 2 })} Bs
                  </p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <Button variant="outline" className="rounded-xl flex-1 md:flex-initial" onClick={() => setIsNewOrderOpen(false)}>
                    Cancelar
                  </Button>
                  <Button disabled={isSubmitting} className="rounded-xl flex-1 md:flex-initial bg-purple-600 hover:bg-purple-700 text-white font-semibold" onClick={handleCrearPedido}>
                    {isSubmitting ? "Procesando..." : "Confirmar Pedido"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { title: "Total Pedidos", value: stats.total, icon: ShoppingBag, color: "from-purple-500 to-indigo-500" },
          { title: "Pendientes", value: stats.pendiente, icon: Clock, color: "from-amber-500 to-orange-500" },
          { title: "En Preparación", value: stats.preparando, icon: Package, color: "from-blue-500 to-cyan-500" },
          { title: "En Camino", value: stats.enCamino, icon: Truck, color: "from-indigo-500 to-purple-500" },
          { title: "Entregados", value: stats.entregado, icon: CheckCircle, color: "from-emerald-500 to-teal-500" }
        ].map((stat, idx) => (
          <motion.div key={idx} whileHover={{ y: -2 }}>
            <Card className="bg-white/75 backdrop-blur-xl border border-slate-200 shadow-md overflow-hidden relative">
              <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${stat.color}`}></div>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">{isLoading ? "..." : stat.value}</h3>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl text-slate-600 shadow-sm border border-slate-100">
                  <stat.icon className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filtros */}
      <Card className="bg-white/70 backdrop-blur-xl border border-slate-200 shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-col xl:flex-row gap-4 items-center justify-between">
            <div className="relative w-full xl:max-w-md">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Buscar por nro. pedido o cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 pr-4 py-6 border-slate-200 rounded-xl"
              />
            </div>

            <div className="flex flex-wrap gap-4 w-full xl:w-auto items-center">
              {/* Filtro estado */}
              <div className="flex flex-wrap gap-1">
                {[
                  { label: "Todos", value: "TODOS" },
                  { label: "Pendientes", value: "PENDIENTE" },
                  { label: "Preparando", value: "PREPARANDO" },
                  { label: "En Camino", value: "EN_CAMINO" },
                  { label: "Entregados", value: "ENTREGADO" },
                  { label: "Cancelados", value: "CANCELADO" }
                ].map((opt) => (
                  <Button
                    key={opt.value}
                    variant={statusFilter === opt.value ? "default" : "outline"}
                    onClick={() => setStatusFilter(opt.value)}
                    size="sm"
                    className={`rounded-lg ${
                      statusFilter === opt.value
                        ? "bg-purple-600 hover:bg-purple-700 text-white"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>

              {/* Filtro entrega */}
              <Select value={deliveryFilter} onValueChange={setDeliveryFilter}>
                <SelectTrigger className="w-40 rounded-xl">
                  <SelectValue placeholder="Tipo Entrega" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">📦 Todas las entregas</SelectItem>
                  <SelectItem value="DELIVERY">🚚 Delivery</SelectItem>
                  <SelectItem value="RETIRO">🏪 Retiro tienda</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Listado de Pedidos */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : filteredPedidos.length === 0 ? (
        <div className="text-center py-16 bg-white/50 border border-slate-200 rounded-3xl">
          <ShoppingBag className="mx-auto h-16 w-16 text-slate-300" />
          <h3 className="mt-4 text-lg font-bold text-slate-900">No se encontraron pedidos</h3>
          <p className="mt-2 text-sm text-slate-500">Ajusta los filtros de búsqueda o registra un nuevo pedido.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredPedidos.map((pedido) => (
              <motion.div
                key={pedido.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group"
              >
                <Card className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-md group-hover:shadow-xl hover:border-purple-300 transition-all duration-300 rounded-3xl overflow-hidden flex flex-col h-full relative">
                  <CardContent className="p-6 flex-1 flex flex-col">
                    {/* Header pedido */}
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs text-slate-400 font-medium">
                          {new Date(pedido.fecha_pedido || "").toLocaleDateString("es-VE")}
                        </span>
                        <h3 className="font-extrabold text-slate-800 text-lg mt-0.5">
                          {pedido.numero_pedido}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1">
                        {getStatusBadge(pedido.estado)}
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 rounded-full hover:bg-slate-50">
                              <MoreHorizontal className="w-4.5 h-4.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl">
                            <DropdownMenuItem onClick={() => setSelectedPedidoDetails(pedido)} className="cursor-pointer">
                              <Eye className="w-4 h-4 mr-2 text-slate-600" /> Ver Detalle
                            </DropdownMenuItem>
                            
                            {pedido.estado !== "CANCELADO" && pedido.estado !== "ENTREGADO" && (
                              <DropdownMenuItem
                                onClick={() => handleUpdateStatus(pedido, "CANCELADO")}
                                className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700"
                              >
                                <XCircle className="w-4 h-4 mr-2" /> Cancelar Pedido
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuItem
                              onClick={() => setPedidoToDelete(pedido)}
                              className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700"
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Eliminar Registro
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Contenido Cliente */}
                    <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 flex-1">
                      <div className="flex items-center gap-2 text-slate-700 text-sm font-semibold">
                        <User className="w-4 h-4 text-purple-500" />
                        <span>{pedido.cliente_nombre}</span>
                      </div>
                      <div className="text-xs text-slate-500 pl-6 space-y-1">
                        {pedido.cliente_telefono && <p>📱 {pedido.cliente_telefono}</p>}
                        <p>📍 {pedido.tipo_entrega === "DELIVERY" ? "Delivery" : "Retiro en tienda"}</p>
                      </div>

                      {pedido.tipo_entrega === "DELIVERY" && pedido.direccion_entrega && (
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 mt-2 flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                          <span className="text-[11px] text-slate-600 leading-tight">{pedido.direccion_entrega}</span>
                        </div>
                      )}

                      {pedido.notas && (
                        <p className="text-[11px] text-slate-400 bg-amber-50/50 rounded-lg p-2 italic mt-1 border border-amber-100">
                          📝 {pedido.notas}
                        </p>
                      )}
                    </div>

                    {/* Footer Pedido */}
                    <div className="border-t border-slate-100 pt-4 mt-4 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total a pagar</p>
                        <p className="font-extrabold text-green-600 text-lg leading-tight">
                          ${pedido.total_usd.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div>
                        {getNextStatusAction(pedido)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal Detalles Completos del Pedido */}
      <Dialog open={!!selectedPedidoDetails} onOpenChange={() => setSelectedPedidoDetails(null)}>
        {selectedPedidoDetails && (
          <DialogContent className="max-w-lg rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center justify-between">
                Pedido {selectedPedidoDetails.numero_pedido}
                {getStatusBadge(selectedPedidoDetails.estado)}
              </DialogTitle>
              <DialogDescription>
                Detalle y artículos del pedido registrado.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-3.5 rounded-2xl border">
                <div>
                  <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Cliente</p>
                  <p className="font-semibold text-slate-700 mt-0.5">{selectedPedidoDetails.cliente_nombre}</p>
                  {selectedPedidoDetails.cliente_telefono && <p className="text-xs text-slate-500 mt-0.5">{selectedPedidoDetails.cliente_telefono}</p>}
                </div>
                <div>
                  <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Detalles de Envío</p>
                  <p className="font-semibold text-slate-700 mt-0.5">
                    {selectedPedidoDetails.tipo_entrega === "DELIVERY" ? "🚚 Delivery" : "🏪 Retiro en tienda"}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Fecha: {new Date(selectedPedidoDetails.fecha_pedido).toLocaleDateString("es-VE")}
                  </p>
                </div>
              </div>

              {selectedPedidoDetails.tipo_entrega === "DELIVERY" && selectedPedidoDetails.direccion_entrega && (
                <div className="bg-slate-50/50 border rounded-2xl p-3 flex gap-2">
                  <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-semibold text-slate-700">Dirección de Entrega</p>
                    <p className="text-slate-600 mt-0.5">{selectedPedidoDetails.direccion_entrega}</p>
                  </div>
                </div>
              )}

              {/* Items List */}
              <div className="space-y-2">
                <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Artículos</p>
                <div className="border border-slate-200 rounded-2xl divide-y divide-slate-150 overflow-hidden">
                  {selectedPedidoDetails.items.map((item) => (
                    <div key={item.producto_id} className="flex justify-between items-center p-3 text-sm">
                      <div>
                        <p className="font-semibold text-slate-700">{item.nombre}</p>
                        <p className="text-xs text-slate-500">
                          {item.cantidad} x ${item.precio_usd.toFixed(2)}
                        </p>
                      </div>
                      <span className="font-bold text-slate-700">
                        ${item.subtotal_usd.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totales Resumen */}
              <div className="space-y-1.5 border-t pt-3 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>${selectedPedidoDetails.subtotal_usd.toFixed(2)}</span>
                </div>
                {selectedPedidoDetails.descuento_porcentaje > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Descuento ({selectedPedidoDetails.descuento_porcentaje}%):</span>
                    <span>-${selectedPedidoDetails.descuento_usd.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-base text-slate-800 border-t pt-2">
                  <span>Total:</span>
                  <div className="text-right">
                    <span className="text-green-600">${selectedPedidoDetails.total_usd.toFixed(2)}</span>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {selectedPedidoDetails.total_bs.toLocaleString("es-VE", { minimumFractionDigits: 2 })} Bs
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" className="rounded-xl w-full" onClick={() => setSelectedPedidoDetails(null)}>
                Cerrar Detalle
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Diálogo Confirmar Eliminación */}
      <AlertDialog open={!!pedidoToDelete} onOpenChange={() => setPedidoToDelete(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">¿Eliminar este registro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción borrará permanentemente la información del pedido{" "}
              <strong>{pedidoToDelete?.numero_pedido}</strong> de la base de datos del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl border-slate-200">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pedidoToDelete && handleDeletePedido(pedidoToDelete)}
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
