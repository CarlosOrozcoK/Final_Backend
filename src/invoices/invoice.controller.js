import Invoice from './invoice.model.js';
import Appointment from '../appointment/appointment.model.js';
import Payment from '../payments/payment.model.js';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

// Crear factura
export const createInvoice = async (req, res) => {
  try {
    const { appointmentId, paymentId, dueDate } = req.body;

    // Verificar si la cita y el pago existen
    const appointment = await Appointment.findById(appointmentId).populate('doctor');
    const payment = await Payment.findById(paymentId).populate('user');
    
    if (!appointment || !payment) {
      return res.status(404).json({ success: false, msg: 'Appointment or Payment not found' });
    }

    // Verificar que el pago esté realizado
    if (payment.status !== 'paid') {
      return res.status(400).json({ success: false, msg: 'Payment must be paid to create an invoice' });
    }

    // Crear la factura
    const totalAmount = payment.amount;
    const invoiceData = {
      appointment: appointmentId,
      payment: paymentId,
      patient: payment.user._id,
      totalAmount,
      dueDate: new Date(dueDate),
      status: 'pending'
    };

    // Crear documento PDF
    const doc = new PDFDocument();
    const invoicePath = path.join(__dirname, `../../invoices/invoice-${appointmentId}.pdf`);

    doc.pipe(fs.createWriteStream(invoicePath));

    // Agregar contenido al PDF
    doc.fontSize(20).text('Factura', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Paciente: ${payment.user.name}`);
    doc.text(`Cita con: ${appointment.doctor.name}`);
    doc.text(`Fecha de cita: ${appointment.date}`);
    doc.text(`Monto Total: $${totalAmount}`);
    doc.text(`Fecha de Vencimiento: ${dueDate}`);
    doc.text(`Estado: ${invoiceData.status}`);
    doc.moveDown();
    doc.text(`Factura generada en: ${new Date().toLocaleString()}`);

    // Finalizar el documento PDF
    doc.end();

    // Guardar la factura en la base de datos
    const invoice = new Invoice({ ...invoiceData, pdfPath: invoicePath });
    await invoice.save();

    res.status(201).json({
      success: true,
      msg: 'Invoice created successfully',
      invoice
    });
  } catch (error) {
    res.status(500).json({ success: false, msg: 'Error creating invoice', error });
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
    res.status(500).json({ success: false, msg: 'Error fetching invoice', error });
  }
};
