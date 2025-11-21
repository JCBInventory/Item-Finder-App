import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CartItem } from '../types';
import { WATERMARK_TEXT } from '../constants';

export const generatePDF = (items: CartItem[], discount: number, subtotal: number, finalTotal: number) => {
  const doc = new jsPDF();

  // Header
  doc.setFillColor(30, 64, 175); // Blue #1E40AF
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text("QUOTATION", 105, 25, { align: 'center' });

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  
  // Date
  const dateStr = new Date().toLocaleDateString();
  doc.text(`Date: ${dateStr}`, 14, 50);

  // Table
  const tableBody = items.map(item => [
    item.itemNo,
    item.description,
    item.qty,
    item.mrp.toFixed(2),
    item.total.toFixed(2)
  ]);

  autoTable(doc, {
    startY: 60,
    head: [['Item No', 'Description', 'Qty', 'MRP', 'Total']],
    body: tableBody,
    headStyles: { fillColor: [30, 64, 175], textColor: [255, 215, 0] }, // Blue header, Yellow text
    theme: 'grid',
  });

  // Summary
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFontSize(11);
  doc.text(`Subtotal: ${subtotal.toFixed(2)}`, 140, finalY);
  doc.text(`Discount: -${discount.toFixed(2)}`, 140, finalY + 7);
  
  doc.setFont("helvetica", "bold");
  doc.text(`Total: ${finalTotal.toFixed(2)}`, 140, finalY + 14);

  // Watermark
  const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(WATERMARK_TEXT, 105, pageHeight - 10, { align: 'center' });

  doc.save(`Quotation_${Date.now()}.pdf`);
};