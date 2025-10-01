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
import messageRoutes from './src/routes/messageRoutes.js';

import Message from './src/models/Message.js';
import AddTenant from './src/models/AddTenant.js';
import User from './src/models/User.js';
import authMeRoutes from './src/routes/auth.me.js';



dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

await connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api', addTenantRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api', authMeRoutes);


app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/customer', (req, res) => res.sendFile(path.join(__dirname, 'public', 'tenant.html')));
app.get('/properties', (req, res) => res.sendFile(path.join(__dirname, 'public', 'properties.html')));
app.get('/tenants', (req, res) => res.sendFile(path.join(__dirname, 'public', 'tenants.html')));
app.get('/chat', (req, res) => res.sendFile(path.join(__dirname, 'public', 'chat.html')));
app.get('/addtenant', (req, res) => res.sendFile(path.join(__dirname, 'public', 'addtenant.html')));
app.get('/tenant-issues', (req, res) => res.sendFile(path.join(__dirname, 'public', 'tenant-issues.html')));

app.get('/api/tenants', async (req, res) => {
  try {
    // Only return tenants
    const tenants = await User.find(
      { role: "Tenant" },
      "_id name email"
    );
    res.json(tenants);
  } catch (err) {
    console.error("Error fetching tenants:", err);
    res.status(500).json({ message: "Server error" });
  }
});


const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const connectedUsers = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("registerUser", (userId) => {
    if (!userId) {
        console.error("User tried to register with null userId", socket.id);
        return;
    }
    connectedUsers[userId] = socket.id;
    console.log(`Registered ${userId} -> ${socket.id}`);
  });

  socket.on("sendMessage", async (data) => {
    try {
        console.log("Received sendMessage event:", data);
        
        const { senderId, senderType, receiverId, receiverType, message } = data;

        if (!senderId || !receiverId || !message) {
            console.error("Missing required fields:", {
                senderId, receiverId, message
            });
            return;
        }

        const senderUser = await User.findById(senderId).lean();
        const senderName = senderUser ? senderUser.name : "Unknown";

        const newMessage = new Message({
          senderId,
          senderType,
          senderName,
          receiverId,
          receiverType,
          message
        });
        
        await newMessage.save();
        console.log("Message saved:", newMessage._id);

        // Send to receiver
        const receiverSocketId = connectedUsers[receiverId];
        console.log("Receiver socket ID:", receiverSocketId, "for user:", receiverId);
        
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("receiveMessage", newMessage);
            console.log("Message sent to receiver");
        }

        // Echo back to sender
        const senderSocketId = connectedUsers[senderId];
        console.log("Sender socket ID:", senderSocketId, "for user:", senderId);
        
        if (senderSocketId) {
            io.to(senderSocketId).emit("receiveMessage", newMessage);
            console.log("Message echoed to sender");
        }
    } catch (err) {
        console.error("Error saving message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    for (const [userId, sId] of Object.entries(connectedUsers)) {
      if (sId === socket.id) {
        delete connectedUsers[userId];
        break;
      }
    }
  });
});

app.get('/api/admin', async (req, res) => {
  try {
      const admin = await User.findOne({ role: 'Admin' }, "_id name email");
      if (!admin) return res.status(404).json({ message: "Admin not found" });
      res.json(admin);
  } catch (err) {
      console.error("Error fetching admin:", err);
      res.status(500).json({ message: "Server error" });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
