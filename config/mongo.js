'use strict';

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { hash as hashPassword } from 'argon2';

dotenv.config();

export const dbConnection = async () => {
  try {
    mongoose.connection.on('error', () => {
      console.log('MongoDB | Could not be connected to MongoDB');
      mongoose.disconnect();
    });
    mongoose.connection.on('connecting', () => {
      console.log('MongoDB | Try connecting...');
    });
    mongoose.connection.on('connected', () => {
      console.log('MongoDB | Connected to MongoDB');
    });
    mongoose.connection.on('open', async () => {
      console.log('MongoDB | Connected to database');
      await createDefaultOwner();           // ⬅️  sigue igual
    });
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB | Reconnected to MongoDB');
    });
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB | Disconnected');
    });

    await mongoose.connect(process.env.URI_MONGO, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 50
    });
  } catch (error) {
    console.log('Database connection failed', error);
  }
};

const createDefaultOwner = async () => {
  try {
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    const ownerExists = await usersCollection.findOne({ username: 'OWNER' });

    if (!ownerExists) {
      const hashedPassword = await hashPassword('OWNER');

      const owner = {
        username: 'OWNER',
        email: 'owner@example.com',
        password: hashedPassword,
        role: 'OWNER_ROLE'  // Este campo se guardará sin problema
      };

      const result = await usersCollection.insertOne(owner);
      console.log('Usuario OWNER creado por defecto:', result.insertedId);
    } else {
      console.log('El usuario OWNER ya existe');
    }
  } catch (error) {
    console.error('Error al crear el usuario OWNER:', error);
  }
};
