import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';

import connectDB from './src/config/db.js';
import authRoutes from './src/routes/auth.js';
import customerRoutes from './src/routes/customers.js';
import propertyRoutes from './src/routes/propertyRoutes.js';
import issueRoutes from './src/routes/issueRoutes.js';
import addTenantRoutes from './src/routes/addTenantRoutes.js';
import AddTenant from './src/models/Addtenant.js';

import Message from './src/models/Message.js';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// static
app.use(express.static(path.join(__dirname, 'public')));

// db
await connectDB();

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/addtenants', addTenantRoutes);
app.use('/api/issues', issueRoutes);

// default pages (static HTML)
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/customer', (req, res) => res.sendFile(path.join(__dirname, 'public', 'tenant.html')));
app.get('/properties', (req, res) => res.sendFile(path.join(__dirname, 'public', 'properties.html')));
app.get('/tenants', (req, res) => res.sendFile(path.join(__dirname, 'public', 'tenants.html')));
app.get('/chat', (req, res) => res.sendFile(path.join(__dirname, 'public', 'chat.html')));
app.get('/addtenant', (req, res) => res.sendFile(path.join(__dirname, 'public', 'addtenant.html')));
app.get('/tenant-issues', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'tenant-issues.html'))
);


// Fetch all tenants for chat dropdown
app.get('/api/tenants', async (req, res) => {
  try {
    const tenants = await AddTenant.find({}, 'name email'); // only get name + email
    res.json(tenants);
  } catch (err) {
    console.error('Error fetching tenants:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/tenant-issues', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'tenant-issues.html'))
);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Keep track of online users
let onlineUsers = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // register user
  socket.on("registerUser", (userId) => {
    onlineUsers[userId] = socket.id;
  });

  // send message
  socket.on("sendMessage", async ({ sender, receiver, message }) => {
    try {
      const newMessage = new Message({ sender, receiver, message });
      await newMessage.save();

      // send to receiver if online
      if (onlineUsers[receiver]) {
        io.to(onlineUsers[receiver]).emit("receiveMessage", newMessage);
      }

      // send back to sender
      io.to(socket.id).emit("receiveMessage", newMessage);
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    for (let userId in onlineUsers) {
      if (onlineUsers[userId] === socket.id) {
        delete onlineUsers[userId];
        break;
      }
    }
  });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
