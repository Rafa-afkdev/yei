"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Download, 
  Printer, 
  Mail,
  Building,
  User,
  Calendar,
  DollarSign,
  FileText
} from "lucide-react";
import { Factura } from "@/interfaces/facturas.interface";

interface FacturaDetailModalProps {
  factura: Factura;
  isOpen: boolean;
  onClose: () => void;
}

export default function FacturaDetailModal({ 
  factura, 
  isOpen, 
  onClose 
}: FacturaDetailModalProps) {
  
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
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // Aquí implementarías la lógica para generar y descargar el PDF
    console.log("Descargar PDF de factura:", factura.numero_factura);
  };

  const handleSendEmail = () => {
    // Aquí implementarías la lógica para enviar por email
    console.log("Enviar factura por email:", factura.numero_factura);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Factura {factura.numero_factura}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {getEstadoBadge(factura.estado)}
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <Printer className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                  <Download className="w-4 h-4" />
                </Button>
                {factura.cliente_email && (
                  <Button variant="outline" size="sm" onClick={handleSendEmail}>
                    <Mail className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header de la factura */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información de la empresa */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Building className="w-5 h-5" />
                Información de la Empresa
              </div>
              <div className="bg-gray-50 p-4 rounded-lg space-y-1">
                <p className="font-semibold text-lg">{factura.empresa_nombre}</p>
                <p className="text-sm text-gray-600">RIF: {factura.empresa_rif}</p>
                <p className="text-sm text-gray-600">{factura.empresa_direccion}</p>
                {factura.empresa_telefono && (
                  <p className="text-sm text-gray-600">📞 {factura.empresa_telefono}</p>
                )}
                {factura.empresa_email && (
                  <p className="text-sm text-gray-600">📧 {factura.empresa_email}</p>
                )}
              </div>
            </div>

            {/* Información del cliente */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <User className="w-5 h-5" />
                Información del Cliente
              </div>
              <div className="bg-blue-50 p-4 rounded-lg space-y-1">
                {factura.cliente_nombre ? (
                  <>
                    <p className="font-semibold">{factura.cliente_nombre}</p>
                    {factura.cliente_email && (
                      <p className="text-sm text-gray-600">📧 {factura.cliente_email}</p>
                    )}
                    {factura.cliente_telefono && (
                      <p className="text-sm text-gray-600">📞 {factura.cliente_telefono}</p>
                    )}
                    {factura.cliente_direccion && (
                      <p className="text-sm text-gray-600">📍 {factura.cliente_direccion}</p>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500 italic">Cliente no especificado</p>
                )}
              </div>
            </div>
          </div>

          {/* Información de fechas y números */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1">
                <Calendar className="w-4 h-4" />
                Fecha de Emisión
              </div>
              <p className="font-semibold">{formatDate(factura.fecha_emision)}</p>
            </div>

            {factura.fecha_vencimiento && (
              <div className="bg-yellow-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1">
                  <Calendar className="w-4 h-4" />
                  Fecha de Vencimiento
                </div>
                <p className="font-semibold">{formatDate(factura.fecha_vencimiento)}</p>
              </div>
            )}

            {factura.numero_venta && (
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1">
                  <FileText className="w-4 h-4" />
                  Venta Asociada
                </div>
                <p className="font-semibold">{factura.numero_venta}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Detalles de los items */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Detalles de la Factura</h3>
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 grid grid-cols-12 gap-4 text-sm font-medium text-gray-600">
                <div className="col-span-5">Producto</div>
                <div className="col-span-2 text-center">Cantidad</div>
                <div className="col-span-2 text-right">Precio Unit.</div>
                <div className="col-span-3 text-right">Subtotal</div>
              </div>
              
              {factura.items.map((item, index) => (
                <div key={index} className="px-4 py-3 grid grid-cols-12 gap-4 border-t text-sm">
                  <div className="col-span-5">
                    <p className="font-medium">{item.nombre}</p>
                    {item.categoria && (
                      <p className="text-xs text-gray-500">{item.categoria}</p>
                    )}
                  </div>
                  <div className="col-span-2 text-center">{item.cantidad}</div>
                  <div className="col-span-2 text-right">
                    <div>${item.precio_usd.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">{item.precio_bs.toFixed(2)} Bs</div>
                  </div>
                  <div className="col-span-3 text-right">
                    <div className="font-medium">${item.subtotal_usd.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">{item.subtotal_bs.toFixed(2)} Bs</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totales */}
          <div className="flex justify-end">
            <div className="w-full max-w-md space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <div className="text-right">
                  <div>${factura.subtotal_usd.toFixed(2)}</div>
                  <div className="text-xs text-gray-500">{factura.subtotal_bs.toFixed(2)} Bs</div>
                </div>
              </div>

              {factura.descuento_porcentaje > 0 && (
                <div className="flex justify-between text-sm text-red-600">
                  <span>Descuento ({factura.descuento_porcentaje}%):</span>
                  <div className="text-right">
                    <div>-${factura.descuento_usd.toFixed(2)}</div>
                    <div className="text-xs">-{factura.descuento_bs.toFixed(2)} Bs</div>
                  </div>
                </div>
              )}

              {factura.impuesto_porcentaje > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Impuesto ({factura.impuesto_porcentaje}%):</span>
                  <div className="text-right">
                    <div>${factura.impuesto_usd.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">{factura.impuesto_bs.toFixed(2)} Bs</div>
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <div className="text-right">
                  <div className="text-green-600">${factura.total_usd.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">{factura.total_bs.toFixed(2)} Bs</div>
                </div>
              </div>

              <div className="text-xs text-gray-500 text-right">
                Tasa: {factura.tasa_dolar.toFixed(2)} Bs/$
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Método de Pago</h4>
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="inline-flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  {factura.metodo_pago === 'EFECTIVO' && '💵 Efectivo'}
                  {factura.metodo_pago === 'TRANSFERENCIA' && '🏦 Transferencia'}
                  {factura.metodo_pago === 'TARJETA' && '💳 Tarjeta'}
                  {factura.metodo_pago === 'MIXTO' && '🔄 Mixto'}
                </span>
              </div>
            </div>

            {factura.vendedor && (
              <div>
                <h4 className="font-medium mb-2">Vendedor</h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span>{factura.vendedor}</span>
                </div>
              </div>
            )}
          </div>

          {/* Notas */}
          {factura.notas && (
            <div>
              <h4 className="font-medium mb-2">Notas</h4>
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <p className="text-sm">{factura.notas}</p>
              </div>
            </div>
          )}

          {/* Términos y condiciones */}
          {factura.terminos_condiciones && (
            <div>
              <h4 className="font-medium mb-2">Términos y Condiciones</h4>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">{factura.terminos_condiciones}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
