const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Importar configuração do banco de dados
const { connectDB } = require('./config/db');

// Importar rotas
const authRoutes = require('./routes/auth');
const pointsRoutes = require('./routes/points');
const kidsRoutes = require('./routes/kids');
const activitiesRoutes = require('./routes/activities');
const messagesRoutes = require('./routes/messages');
const remindersRoutes = require('./routes/reminders');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Conectar ao banco de dados
connectDB();

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/kids', kidsRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/reminders', remindersRoutes);

// Rota principal - servir index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para dashboard
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Rota para child-view
app.get('/child-view', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'child-view.html'));
});

// Rota para reminders
app.get('/reminders', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'reminders.html'));
});

// Rota para gerenciar pontos
app.get('/manage-points', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'manage-points.html'));
});

// Rota para cadastros de crianças
app.get('/kids', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'kids.html'));
});

// Rota para configuração de atividades (removida - unificada com cadastros)
// app.get('/activities', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'activities.html'));
// });

// Rota para área da criança
app.get('/kid-area', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'kid-area.html'));
});

// Rota para comunicação
app.get('/communication', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'communication.html'));
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Rota 404
app.use('*', (req, res) => {
    res.status(404).json({ 
        success: false, 
        message: 'Rota não encontrada' 
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});

module.exports = app; 