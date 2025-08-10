const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

// Variables directamente en el archivo
const MONGODB_URI = 'mongodb+srv://usuario:contraseña@cluster.mongodb.net/dimelo';
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

// Conexión a MongoDB
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
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
});

// Puerto para Render o local
app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
});