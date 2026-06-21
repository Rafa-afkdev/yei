"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Search,
  User,
  DollarSign,
  Calculator,
  Receipt,
  Save,
  X
} from "lucide-react";
import { showToast } from "nextjs-toast-notify";
import { VentaItem, Venta } from "@/interfaces/ventas.interface";
import { Productos } from "@/interfaces/productos.interface";
import { Cliente } from "@/interfaces/clientes.interface";
import { getCollection, addDocument, updateDocument } from "@/lib/firebase";
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

export default function NuevaVentaPage() {
  // Estados principales
  const [productos, setProductos] = useState<Productos[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [carrito, setCarrito] = useState<VentaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dollarRate, setDollarRate] = useState<number>(0);

  // Estados del formulario
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState<number>(0);
  const [impuestoPorcentaje, setImpuestoPorcentaje] = useState<number>(16); // IVA Venezuela
  const [metodoPago, setMetodoPago] = useState<'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA' | 'MIXTO'>('EFECTIVO');
  const [notas, setNotas] = useState<string>("");

  // Obtener datos iniciales
  const loadData = async () => {
    try {
      const [productosData, clientesData, rateData] = await Promise.all([
        getCollection("productos"),
        getCollection("clientes"),
        fetchDollarRate()
      ]);

      setProductos(productosData as Productos[]);
      setClientes(clientesData as Cliente[]);
      
      if (rateData.success) {
        setDollarRate(rateData.rate);
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
      showToast.error("Error al cargar los datos");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Productos filtrados
  const productosFiltrados = productos.filter(producto =>
    producto.activa &&
    producto.stock_actual > 0 &&
    (producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
     producto.categoriaId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Agregar producto al carrito
  const agregarAlCarrito = (producto: Productos) => {
    const itemExistente = carrito.find(item => item.producto_id === producto.id);
    
    if (itemExistente) {
      if (itemExistente.cantidad < producto.stock_actual) {
        setCarrito(carrito.map(item =>
          item.producto_id === producto.id
            ? {
                ...item,
                cantidad: item.cantidad + 1,
                subtotal_usd: (item.cantidad + 1) * item.precio_usd,
                subtotal_bs: convertUsdToBs((item.cantidad + 1) * item.precio_usd, dollarRate)
              }
            : item
        ));
      } else {
        showToast.warning("No hay suficiente stock disponible");
      }
    } else {
      const nuevoItem: VentaItem = {
        producto_id: producto.id!,
        nombre: producto.nombre,
        precio_usd: producto.precio_venta_usd,
        precio_bs: convertUsdToBs(producto.precio_venta_usd, dollarRate),
        cantidad: 1,
        subtotal_usd: producto.precio_venta_usd,
        subtotal_bs: convertUsdToBs(producto.precio_venta_usd, dollarRate),
        categoria: producto.categoriaId
      };
      setCarrito([...carrito, nuevoItem]);
    }
  };

  // Actualizar cantidad en carrito
  const actualizarCantidad = (producto_id: string, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      eliminarDelCarrito(producto_id);
      return;
    }

    const producto = productos.find(p => p.id === producto_id);
    if (producto && nuevaCantidad > producto.stock_actual) {
      showToast.warning("No hay suficiente stock disponible");
      return;
    }

    setCarrito(carrito.map(item =>
      item.producto_id === producto_id
        ? {
            ...item,
            cantidad: nuevaCantidad,
            subtotal_usd: nuevaCantidad * item.precio_usd,
            subtotal_bs: convertUsdToBs(nuevaCantidad * item.precio_usd, dollarRate)
          }
        : item
    ));
  };

  // Eliminar del carrito
  const eliminarDelCarrito = (producto_id: string) => {
    setCarrito(carrito.filter(item => item.producto_id !== producto_id));
  };

  // Calcular totales
  const calcularTotales = () => {
    const subtotal_usd = carrito.reduce((sum, item) => sum + item.subtotal_usd, 0);
    const subtotal_bs = convertUsdToBs(subtotal_usd, dollarRate);
    
    const descuento_usd = (subtotal_usd * descuentoPorcentaje) / 100;
    const descuento_bs = convertUsdToBs(descuento_usd, dollarRate);
    
    const base_impuesto_usd = subtotal_usd - descuento_usd;
    const impuesto_usd = (base_impuesto_usd * impuestoPorcentaje) / 100;
    const impuesto_bs = convertUsdToBs(impuesto_usd, dollarRate);
    
    const total_usd = base_impuesto_usd + impuesto_usd;
    const total_bs = convertUsdToBs(total_usd, dollarRate);

    return {
      subtotal_usd,
      subtotal_bs,
      descuento_usd,
      descuento_bs,
      impuesto_usd,
      impuesto_bs,
      total_usd,
      total_bs
    };
  };

  // Procesar venta
  const procesarVenta = async () => {
    if (carrito.length === 0) {
      showToast.error("Agregue productos al carrito");
      return;
    }

    if (dollarRate === 0) {
      showToast.error("No se pudo obtener la tasa del dólar");
      return;
    }

    setIsLoading(true);
    try {
      const totales = calcularTotales();
      const numeroVenta = `V-${Date.now()}`;

      // Limpiar items para evitar valores undefined
      const itemsLimpios = carrito.map(({ imagen, ...rest }) => rest);

      // Construir objeto de venta omitiendo campos undefined
      const ventaBase: Venta = {
        numero_venta: numeroVenta,
        items: itemsLimpios,
        subtotal_usd: totales.subtotal_usd,
        subtotal_bs: totales.subtotal_bs,
        descuento_porcentaje: descuentoPorcentaje,
        descuento_usd: totales.descuento_usd,
        descuento_bs: totales.descuento_bs,
        impuesto_porcentaje: impuestoPorcentaje,
        impuesto_usd: totales.impuesto_usd,
        impuesto_bs: totales.impuesto_bs,
        total_usd: totales.total_usd,
        total_bs: totales.total_bs,
        tasa_dolar: dollarRate,
        metodo_pago: metodoPago,
        estado: 'PAGADA',
        notas: notas,
        vendedor: 'Sistema', // Aquí podrías usar el usuario actual
        fecha_venta: new Date().toISOString()
      };

      if (selectedCliente) {
        ventaBase.cliente_id = selectedCliente.id;
        ventaBase.cliente_nombre = `${selectedCliente.nombre} ${selectedCliente.apellido}`;
        if (selectedCliente.email) ventaBase.cliente_email = selectedCliente.email;
        if (selectedCliente.telefono) ventaBase.cliente_telefono = selectedCliente.telefono;
      }

      await addDocument("ventas", ventaBase);
      
      // Descontar del stock de los productos vendidos
      for (const item of itemsLimpios) {
        const productoLocal = productos.find(p => p.id === item.producto_id);
        if (productoLocal) {
          const nuevoStock = Math.max(0, (productoLocal.stock_actual || 0) - item.cantidad);
          await updateDocument(`productos/${item.producto_id}`, {
            stock_actual: nuevoStock
          });
        }
      }

      showToast.success(`Venta ${numeroVenta} procesada exitosamente`);
      
      // Limpiar formulario y recargar datos
      setCarrito([]);
      setSelectedCliente(null);
      setDescuentoPorcentaje(0);
      setNotas("");
      setSearchTerm("");
      await loadData();

    } catch (error) {
      console.error("Error procesando venta:", error);
      showToast.error("Error al procesar la venta");
    } finally {
      setIsLoading(false);
    }
  };

  const totales = calcularTotales();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nueva Venta</h1>
          <p className="text-gray-600">Procesa una nueva venta</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-100 text-green-800">
            💰 Tasa: {dollarRate.toFixed(2)} Bs/$
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel Izquierdo - Productos y Cliente */}
        <div className="lg:col-span-2 space-y-6">
          {/* Selección de Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Cliente (Opcional)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedCliente ? (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border">
                  <div>
                    <p className="font-medium">{selectedCliente.nombre} {selectedCliente.apellido}</p>
                    <p className="text-sm text-gray-600">{selectedCliente.email}</p>
                    <p className="text-sm text-gray-600">{selectedCliente.telefono}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCliente(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Combobox
                  items={clientes
                    .filter(c => c.activo)
                    .map((c) => ({
                      value: c.id!,
                      label: `${c.nombre} ${c.apellido}`,
                      description: `${c.email}${c.telefono ? ` · ${c.telefono}` : ""}`,
                    }))}
                  value={null}
                  onChange={(value) => {
                    if (!value) {
                      setSelectedCliente(null);
                      return;
                    }
                    const cliente = clientes.find((c) => c.id === value);
                    if (cliente) {
                      setSelectedCliente(cliente);
                      if (cliente.descuento_porcentaje && cliente.descuento_porcentaje > 0) {
                        setDescuentoPorcentaje(cliente.descuento_porcentaje);
                      }
                    }
                  }}
                  placeholder="Buscar y seleccionar cliente..."
                />
              )}
            </CardContent>
          </Card>

          {/* Búsqueda de Productos */}
          <Card>
            <CardHeader>
              <CardTitle>Productos</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {productosFiltrados.map((producto) => (
                  <div
                    key={producto.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => agregarAlCarrito(producto)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-sm">{producto.nombre}</h3>
                      <Badge variant="outline" className="text-xs">
                        Stock: {producto.stock_actual}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{producto.categoriaId}</p>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-green-600">
                          ${producto.precio_venta_usd.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {convertUsdToBs(producto.precio_venta_usd, dollarRate).toFixed(2)} Bs
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel Derecho - Carrito y Totales */}
        <div className="space-y-6">
          {/* Carrito */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Carrito ({carrito.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {carrito.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  El carrito está vacío
                </p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {carrito.map((item) => (
                    <div key={item.producto_id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm">{item.nombre}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => eliminarDelCarrito(item.producto_id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => actualizarCantidad(item.producto_id, item.cantidad - 1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center">{item.cantidad}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => actualizarCantidad(item.producto_id, item.cantidad + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            ${item.subtotal_usd.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.subtotal_bs.toFixed(2)} Bs
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Configuración de Venta */}
          {carrito.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Configuración
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="descuento">Descuento (%)</Label>
                  <Input
                    id="descuento"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={descuentoPorcentaje}
                    onChange={(e) => setDescuentoPorcentaje(Number(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="impuesto">Impuesto (%)</Label>
                  <Input
                    id="impuesto"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={impuestoPorcentaje}
                    onChange={(e) => setImpuestoPorcentaje(Number(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor="metodo_pago">Método de Pago</Label>
                  <Select value={metodoPago} onValueChange={(value) => setMetodoPago(value as 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA' | 'MIXTO')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EFECTIVO">💵 Efectivo</SelectItem>
                      <SelectItem value="TRANSFERENCIA">🏦 Transferencia</SelectItem>
                      <SelectItem value="TARJETA">💳 Tarjeta</SelectItem>
                      <SelectItem value="MIXTO">🔄 Mixto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notas">Notas</Label>
                  <Textarea
                    id="notas"
                    placeholder="Notas adicionales..."
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resumen de Totales */}
          {carrito.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="w-5 h-5" />
                  Resumen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <div className="text-right">
                    <div>${totales.subtotal_usd.toFixed(2)}</div>
                    <div className="text-sm text-gray-500">{totales.subtotal_bs.toFixed(2)} Bs</div>
                  </div>
                </div>

                {descuentoPorcentaje > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Descuento ({descuentoPorcentaje}%):</span>
                    <div className="text-right">
                      <div>-${totales.descuento_usd.toFixed(2)}</div>
                      <div className="text-sm">-{totales.descuento_bs.toFixed(2)} Bs</div>
                    </div>
                  </div>
                )}

                {impuestoPorcentaje > 0 && (
                  <div className="flex justify-between">
                    <span>Impuesto ({impuestoPorcentaje}%):</span>
                    <div className="text-right">
                      <div>${totales.impuesto_usd.toFixed(2)}</div>
                      <div className="text-sm text-gray-500">{totales.impuesto_bs.toFixed(2)} Bs</div>
                    </div>
                  </div>
                )}

                <hr />
                
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <div className="text-right">
                    <div className="text-green-600">${totales.total_usd.toFixed(2)}</div>
                    <div className="text-sm text-gray-600">{totales.total_bs.toFixed(2)} Bs</div>
                  </div>
                </div>

                <Button
                  className="w-full mt-4"
                  onClick={procesarVenta}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Procesar Venta
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
