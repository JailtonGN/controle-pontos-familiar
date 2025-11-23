const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Importar configuração do banco de dados
const { connectDB } = require('./config/db');

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.static('public'));

// Conectar ao MongoDB
// Conectar ao banco de dados
connectDB();

// Rotas da API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/families', require('./routes/families'));
app.use('/api/kids', require('./routes/kids'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/points', require('./routes/points'));
app.use('/api/messages', require('./routes/messages'));
// Removido: app.use('/api/reminders', require('./routes/reminders'));

// Rotas para páginas HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/kids', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'kids.html'));
});

app.get('/activities', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'activities.html'));
});

app.get('/manage-points', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'manage-points.html'));
});

app.get('/communication', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'communication.html'));
});

app.get('/child-view', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'child-view.html'));
});

app.get('/kid-area', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'kid-area.html'));
});

app.get('/kid-login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'kid-login.html'));
});

app.get('/kid-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'kid-dashboard.html'));
});



app.get('/config', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'config.html'));
});

// Rota para verificar se o servidor está funcionando
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Servidor funcionando!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        database: 'MongoDB Atlas'
    });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
}); 
module.exports = app; 