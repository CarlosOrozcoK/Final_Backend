'use strict';

import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit'; 
import { dbConnection } from './mongo.js'; 
import authRoutes from '../src/auth/auth.routes.js'; 
import userRoutes from '../src/users/user.routes.js';
import doctorRoutes from '../src/doctors/doctor.routes.js'; 
import appointmentRoutes from '../src/appointment/appointment.routes.js'; 
import paymentRoutes from '../src/payments/payment.routes.js';
import invoiceRoutes from '../src/invoices/invoice.routes.js';

dotenv.config();

const limiter = rateLimit({
 windowMs: 15 * 60 * 1000,
 max: 100,
 standardHeaders: true,
 legacyHeaders: false
});

const middlewares = (app) => {
 app.use(express.urlencoded({ extended: false }));
 app.use(cors());
 app.use(express.json());
 app.use(helmet());
 app.use(morgan('dev'));
 app.use(limiter); 
};

const routes = (app) => {
  app.use("/Final_backend/v1/auth", authRoutes);
  app.use("/Final_backend/v1/users", userRoutes); 
  app.use("/Final_backend/v1/doctors", doctorRoutes); 
  app.use("/Final_backend/v1/appointments", appointmentRoutes); 
  app.use("/Final_backend/v1/payments", paymentRoutes);
  app.use("/Final_backend/v1/invoices", invoiceRoutes);
};

const conectarDB = async () => {
 try {
   await dbConnection();
   console.log('Successfully connected to database!');
 } catch (error) {
   console.log('Error connecting to database!');
   process.exit(1);
 }
};

export const initServer = async () => {
  const app = express();
  const port = process.env.PORT || 3001;

  try {
    middlewares(app);
    await conectarDB();
    routes(app);
    console.log(`Server running on port ${port}!`);
    app.listen(port);
  } catch (err) {
    console.log(`Server init failed: ${err}!`);
  }
};
