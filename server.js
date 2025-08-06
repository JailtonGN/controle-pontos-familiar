const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.static('public'));

// Conectar ao MongoDB
const mongoURI = process.env.MONGODB_URI;
console.log('🔍 Configuração MongoDB:');
console.log('- MONGODB_URI configurada:', !!mongoURI);
console.log('- Ambiente:', process.env.NODE_ENV);
console.log('- URI (mascarada):', mongoURI ? mongoURI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') : 'NÃO CONFIGURADA');

if (!mongoURI) {
    console.error('❌ MONGODB_URI não configurada!');
    console.error('Configure a variável de ambiente MONGODB_URI no Render');
    process.exit(1);
}

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
})
.then(() => {
    console.log('✅ Conectado ao MongoDB com sucesso!');
    console.log('📊 Database:', mongoose.connection.name);
})
.catch(err => {
    console.error('❌ Erro ao conectar ao MongoDB:', err);
    console.error('🔧 Verifique:');
    console.error('  1. Se a MONGODB_URI está configurada no Render');
    console.error('  2. Se a string de conexão está correta');
    console.error('  3. Se o IP whitelist está configurado no MongoDB Atlas');
    process.exit(1);
});

// Rotas da API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/kids', require('./routes/kids'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/points', require('./routes/points'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/reminders', require('./routes/reminders'));

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

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
    });
});

// Rota para verificar se o servidor está funcionando
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Servidor funcionando!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Rota para qualquer outra requisição (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📱 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
}); 
module.exports = app; 