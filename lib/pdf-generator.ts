import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Factura } from "@/interfaces/facturas.interface";

export const downloadFacturaPDF = (factura: Factura) => {
  const doc = new jsPDF();

  // Color palette
  const primaryColor = [79, 70, 229]; // Indigo-600
  const darkTextColor = [30, 41, 59]; // Slate-800

  // 1. Header (Company Info)
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(factura.empresa_nombre, 14, 20);

  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`RIF: ${factura.empresa_rif}`, 14, 26);
  doc.text(factura.empresa_direccion, 14, 31);
  if (factura.empresa_telefono) {
    doc.text(`Tlf: ${factura.empresa_telefono}`, 14, 36);
  }
  if (factura.empresa_email) {
    doc.text(`Email: ${factura.empresa_email}`, 14, 41);
  }

  // 2. Invoice Details (Top Right)
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("FACTURA", 150, 20);

  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Número: ${factura.numero_factura}`, 150, 26);
  if (factura.idfactura || factura.id) {
    doc.text(`ID Factura: ${factura.idfactura || factura.id}`, 150, 31);
  }
  doc.text(`Fecha Emisión: ${new Date(factura.fecha_emision).toLocaleDateString('es-VE')}`, 150, 36);
  if (factura.fecha_vencimiento) {
    doc.text(`Vencimiento: ${new Date(factura.fecha_vencimiento).toLocaleDateString('es-VE')}`, 150, 41);
  }

  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.line(14, 48, 196, 48);

  // 3. Client Details
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("CLIENTE", 14, 56);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(factura.cliente_nombre || "Consumidor Final", 14, 62);
  if (factura.cliente_email) {
    doc.text(`Email: ${factura.cliente_email}`, 14, 67);
  }
  if (factura.cliente_telefono) {
    doc.text(`Teléfono: ${factura.cliente_telefono}`, 14, 72);
  }
  if (factura.cliente_direccion) {
    doc.text(`Dirección: ${factura.cliente_direccion}`, 14, 77);
  }

  // 4. Items Table
  const tableHeaders = [
    ["#", "Producto", "Categoría", "Cant.", "Precio (USD)", "Precio (Bs)", "Total (USD)", "Total (Bs)"]
  ];

  const tableData = factura.items.map((item, index) => [
    (index + 1).toString(),
    item.nombre,
    item.categoria || "-",
    item.cantidad.toString(),
    `$${item.precio_usd.toFixed(2)}`,
    `${item.precio_bs.toFixed(2)} Bs`,
    `$${item.subtotal_usd.toFixed(2)}`,
    `${item.subtotal_bs.toFixed(2)} Bs`
  ]);

  autoTable(doc, {
    startY: 85,
    head: tableHeaders,
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [79, 70, 229], // Indigo-600
      textColor: [255, 255, 255],
      fontStyle: "bold"
    },
    bodyStyles: {
      textColor: [30, 41, 59]
    },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 50 },
      2: { cellWidth: 25 },
      3: { cellWidth: 15, halign: "center" },
      4: { cellWidth: 25, halign: "right" },
      5: { cellWidth: 25, halign: "right" },
      6: { cellWidth: 25, halign: "right" },
      7: { cellWidth: 25, halign: "right" }
    }
  });

  // Get Y position after table
  let currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  // Check if we need a new page to draw summary and notes
  if (currentY > 240) {
    doc.addPage();
    currentY = 20;
  }

  // 5. Summary (Subtotal, Tax, Discount, Total)
  const summaryX = 120;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  
  doc.text("Subtotal:", summaryX, currentY);
  doc.text(`$${factura.subtotal_usd.toFixed(2)}`, 165, currentY, { align: "right" });
  doc.text(`${factura.subtotal_bs.toFixed(2)} Bs`, 196, currentY, { align: "right" });
  currentY += 6;

  if (factura.descuento_porcentaje > 0) {
    doc.text(`Descuento (${factura.descuento_porcentaje}%):`, summaryX, currentY);
    doc.text(`-$${factura.descuento_usd.toFixed(2)}`, 165, currentY, { align: "right" });
    doc.text(`-${factura.descuento_bs.toFixed(2)} Bs`, 196, currentY, { align: "right" });
    currentY += 6;
  }

  if (factura.impuesto_porcentaje > 0) {
    doc.text(`IVA (${factura.impuesto_porcentaje}%):`, summaryX, currentY);
    doc.text(`$${factura.impuesto_usd.toFixed(2)}`, 165, currentY, { align: "right" });
    doc.text(`${factura.impuesto_bs.toFixed(2)} Bs`, 196, currentY, { align: "right" });
    currentY += 6;
  }

  doc.line(summaryX, currentY - 2, 196, currentY - 2);

  doc.setFont("helvetica", "bold");
  doc.text("Total:", summaryX, currentY);
  doc.text(`$${factura.total_usd.toFixed(2)}`, 165, currentY, { align: "right" });
  doc.text(`${factura.total_bs.toFixed(2)} Bs`, 196, currentY, { align: "right" });

  // exchange rate
  currentY += 6;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.text(`Tasa de Referencia: ${factura.tasa_dolar.toFixed(2)} Bs/$`, 196, currentY, { align: "right" });

  currentY += 15;

  // 6. Payment method and notes
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Método de Pago:", 14, currentY - 20);
  doc.setFont("helvetica", "normal");
  doc.text(factura.metodo_pago, 14, currentY - 15);

  if (factura.vendedor) {
    doc.setFont("helvetica", "bold");
    doc.text("Vendedor:", 14, currentY - 5);
    doc.setFont("helvetica", "normal");
    doc.text(factura.vendedor, 14, currentY);
  }

  if (factura.notas) {
    doc.setFont("helvetica", "bold");
    doc.text("Notas:", 14, currentY + 10);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(factura.notas, 14, currentY + 15, { maxWidth: 100 });
  }

  if (factura.terminos_condiciones) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Términos y Condiciones:", 14, currentY + 30);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(factura.terminos_condiciones, 14, currentY + 35, { maxWidth: 180 });
  }

  // Save the PDF
  doc.save(`factura-${factura.numero_factura}.pdf`);
};
