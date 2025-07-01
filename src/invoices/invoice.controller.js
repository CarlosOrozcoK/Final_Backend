import mongoose from 'mongoose';
import Invoice from './invoice.model.js';
import Appointment from '../appointment/appointment.model.js';
import Payment from '../payments/payment.model.js';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Directorio para guardar las facturas PDF
const UPLOADS_DIR = path.join(__dirname, '../uploads');
const INVOICES_DIR = path.join(UPLOADS_DIR, 'invoices');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}
if (!fs.existsSync(INVOICES_DIR)) {
  fs.mkdirSync(INVOICES_DIR);
}

// Crear factura
export const createInvoice = async (req, res) => {
  try {
    const { appointmentId, paymentId, dueDate } = req.body;

    // 1. Verificar si la cita y el pago existen y populando los datos necesarios
    const appointment = await Appointment.findById(appointmentId).populate('doctor');
    // Asegúrate de que tu modelo Payment tiene 'user' como referencia
    const payment = await Payment.findById(paymentId).populate('user'); 
    
    if (!appointment) {
      return res.status(404).json({ success: false, msg: 'Appointment not found' });
    }
    if (!payment) {
      return res.status(404).json({ success: false, msg: 'Payment not found' });
    }

    // 2. Verificar que el pago esté realizado
    if (payment.status !== 'paid') {
      return res.status(400).json({ success: false, msg: 'Payment must be paid to create an invoice' });
    }

    // 3. Obtener el ID del paciente y el monto total
    // Asegúrate de que payment.user exista después del populate
    if (!payment.user) {
      return res.status(400).json({ success: false, msg: 'Payment user (patient) not found for this payment.' });
    }
    const patientId = payment.user._id; // ID del paciente
    const totalAmount = payment.amount; // Monto total del pago

    // Crear la data para la factura
    const invoiceData = {
      appointment: appointmentId,
      payment: paymentId,
      patient: patientId, // Usamos el ID del paciente obtenido
      totalAmount: totalAmount, // Usamos el monto total del pago
      dueDate: new Date(dueDate), // Convertir a objeto Date
      status: 'pending' // Estado por defecto
    };

    // 4. Crear el documento PDF
    const invoiceFileName = `invoice-${appointmentId}.pdf`;
    const invoicePath = path.join(INVOICES_DIR, invoiceFileName);

    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(invoicePath));

    // Agregar contenido al PDF
    doc.fontSize(20).text('Factura', { align: 'center' });
    doc.moveDown();
    // Asegúrate de que payment.user y appointment.doctor tienen la propiedad 'name'
    doc.fontSize(12).text(`Paciente: ${payment.user.name || 'N/A'}`);
    doc.text(`Cita con: ${appointment.doctor?.name || 'N/A'}`); // Usa optional chaining por si doctor es null
    doc.text(`Fecha de cita: ${new Date(appointment.date).toLocaleString()}`); // Formatea la fecha de la cita
    doc.text(`Monto Total: $${totalAmount}`);
    doc.text(`Fecha de Vencimiento: ${new Date(dueDate).toLocaleString()}`); // Formatea la fecha de vencimiento
    doc.text(`Estado: ${invoiceData.status}`);
    doc.moveDown();
    doc.text(`Factura generada en: ${new Date().toLocaleString()}`);

    doc.end();

    // 5. Guardar la factura en la base de datos
    const invoice = new Invoice({ ...invoiceData, pdfPath: invoicePath });
    await invoice.save();

    res.status(201).json({
      success: true,
      msg: 'Invoice created successfully',
      invoice
    });

  } catch (error) {
    console.error("Error al crear factura:", error); // Log detallado del error
    res.status(500).json({
      success: false,
      msg: 'Error creating invoice',
      error: error.message, // Envía el mensaje de error para Postman
      // Opcional: envía el stack trace en modo desarrollo para más detalles
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
  }
};

// Obtener factura por ID
export const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findById(id).populate('appointment payment patient');

    if (!invoice) {
      return res.status(404).json({ success: false, msg: 'Invoice not found' });
    }

    res.json({ success: true, invoice });
  } catch (error) {
    console.error("Error al obtener factura:", error);
    res.status(500).json({
      success: false,
      msg: 'Error fetching invoice',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};