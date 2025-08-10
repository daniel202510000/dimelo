const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const app = express();

// Variables directamente en el archivo
const MONGODB_URI = 'mongodb+srv://daniel:daniel25@dimelo.lg1arhx.mongodb.net/?retryWrites=true&w=majority&appName=admin';
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

// Conexión a MongoDB
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*"
    }
});

// Modelo de mensaje
const Message = mongoose.model('Message', new mongoose.Schema({
    text: String,
    createdAt: { type: Date, default: Date.now }
}));

// Obtener mensajes
app.get('/api/messages', async (req, res) => {
    const messages = await Message.find().sort({ createdAt: 1 }).limit(100);
    res.json(messages);
});

// Enviar mensaje
app.post('/api/messages', async (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Texto requerido' });
    const msg = new Message({ text });
    await msg.save();
    res.json(msg);
    // Emitir el mensaje a todos los clientes conectados
    io.emit('mensaje', msg);
});

// Socket.io conexión
io.on('connection', (socket) => {
    console.log('Usuario conectado:', socket.id);
    socket.on('disconnect', () => {
        console.log('Usuario desconectado:', socket.id);
    });
});

// Puerto para Render o local
server.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
});
