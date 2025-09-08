import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';


import connectDB from './src/config/db.js';
import authRoutes from './src/routes/auth.js';
import customerRoutes from './src/routes/customers.js';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

// middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// static
app.use(express.static(path.join(__dirname, 'public')));

// db
await connectDB();

// routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);

// default pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'customers.html')));
app.get('/customer', (req, res) => res.sendFile(path.join(__dirname, 'public', 'customer.html')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));