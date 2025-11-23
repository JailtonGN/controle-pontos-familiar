/**
 * SERVIDOR LOCAL DE TESTE
 * Sistema de Controle de Pontos Familiar
 * 
 * Este servidor usa MongoDB Memory Server para testes locais
 * sem necessidade de configurar MongoDB Atlas
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:3002',
    credentials: true
}));
app.use(express.json());
app.use(express.static('public'));

// Variável para armazenar a instância do MongoDB Memory Server
let mongoServer;

// Função para conectar ao MongoDB em memória
async function connectTestDB() {
    try {
        console.log('🚀 Iniciando MongoDB Memory Server...');
        
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        
        console.log('📦 MongoDB Memory Server iniciado');
        console.log('🔗 URI:', mongoUri);
        
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log('✅ Conectado ao banco de dados de teste');
        
        // Criar dados de teste
        await seedTestData();
        
    } catch (error) {
        console.error('❌ Erro ao conectar ao banco de dados:', error);
        process.exit(1);
    }
}

// Função para popular dados de teste
async function seedTestData() {
    const User = require('./models/User');
    const Kid = require('./models/Kid');
    const Activity = require('./models/Activity');
    
    try {
        // Verificar se já existem dados
        const userCount = await User.countDocuments();
        if (userCount > 0) {
            console.log('📊 Dados de teste já existem');
            return;
        }
        
        console.log('🌱 Criando dados de teste...');
        
        const Family = require('./models/Family');
        
        // Primeiro, criar um usuário admin temporário para criar a família
        const tempAdminUser = new User({
            name: 'Admin Temporário',
            email: 'temp@admin.com',
            password: 'temp123',
            role: 'admin'
        });
        
        // Salvar sem validação de familyId
        await tempAdminUser.save({ validateBeforeSave: false });
        
        // Criar família de teste
        let testFamily = await Family.findOne({ name: 'Família Teste' });
        
        if (!testFamily) {
            testFamily = await Family.create({
                name: 'Família Teste',
                description: 'Família criada automaticamente para testes',
                isActive: true,
                createdBy: tempAdminUser._id
            });
            console.log('👨‍👩‍👧‍👦 Família de teste criada');
        }
        
        // Atualizar o admin temporário com a família
        tempAdminUser.familyId = testFamily._id;
        await tempAdminUser.save();
        
        // Criar usuário de teste principal (a senha será hasheada automaticamente pelo pre-save hook)
        const testUser = await User.create({
            name: 'Usuário Teste',
            email: 'teste@teste.com',
            password: 'teste123', // Será hasheada automaticamente
            role: 'parent',
            familyId: testFamily._id
        });
        
        console.log('👤 Usuário criado: teste@teste.com / teste123');
        
        // Criar crianças de teste
        const kid1 = await Kid.create({
            name: 'João',
            age: 8,
            emoji: '👦',
            pin: '1234',
            familyId: testFamily._id,
            parentId: testUser._id,
            totalPoints: 50
        });
        
        const kid2 = await Kid.create({
            name: 'Maria',
            age: 6,
            emoji: '👧',
            pin: '5678',
            familyId: testFamily._id,
            parentId: testUser._id,
            totalPoints: 75
        });
        
        console.log('👶 Crianças criadas: João (PIN: 1234) e Maria (PIN: 5678)');
        
        // Criar atividades de teste
        const activities = [
            // Atividades Positivas
            { name: 'Arrumar a cama', points: 5, type: 'positive', category: 'Tarefas', icon: '🛏️', familyId: testFamily._id },
            { name: 'Escovar os dentes', points: 3, type: 'positive', category: 'Higiene', icon: '🪥', familyId: testFamily._id },
            { name: 'Fazer lição de casa', points: 10, type: 'positive', category: 'Estudos', icon: '📚', familyId: testFamily._id },
            { name: 'Ajudar nas tarefas', points: 8, type: 'positive', category: 'Tarefas', icon: '🧹', familyId: testFamily._id },
            { name: 'Ler um livro', points: 15, type: 'positive', category: 'Estudos', icon: '📖', familyId: testFamily._id },
            
            // Atividades Negativas
            { name: 'Brigar com irmão', points: -10, type: 'negative', category: 'Comportamento', icon: '😠', familyId: testFamily._id },
            { name: 'Não obedecer', points: -5, type: 'negative', category: 'Comportamento', icon: '🚫', familyId: testFamily._id },
            { name: 'Fazer bagunça', points: -8, type: 'negative', category: 'Tarefas', icon: '🌪️', familyId: testFamily._id },
            { name: 'Mentir', points: -15, type: 'negative', category: 'Comportamento', icon: '🤥', familyId: testFamily._id }
        ];
        
        await Activity.insertMany(activities);
        console.log('🎯 Atividades criadas:', activities.length);
        
        console.log('\n✨ Dados de teste criados com sucesso!\n');
        console.log('📝 CREDENCIAIS DE TESTE:');
        console.log('   Email: teste@teste.com');
        console.log('   Senha: teste123');
        console.log('\n👶 CRIANÇAS:');
        console.log('   João - PIN: 1234 (50 pontos)');
        console.log('   Maria - PIN: 5678 (75 pontos)\n');
        
    } catch (error) {
        console.error('❌ Erro ao criar dados de teste:', error);
    }
}

// Rotas da API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/families', require('./routes/families'));
app.use('/api/kids', require('./routes/kids'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/points', require('./routes/points'));
app.use('/api/messages', require('./routes/messages'));

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

app.get('/admin-points', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-points.html'));
});

// Rota de health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Servidor de teste funcionando!',
        timestamp: new Date().toISOString(),
        environment: 'test',
        database: 'MongoDB Memory Server (In-Memory)'
    });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error('❌ Erro:', err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor',
        error: err.message
    });
});

// Iniciar servidor
const PORT = 3002;

async function startServer() {
    try {
        await connectTestDB();
        
        app.listen(PORT, () => {
            console.log('═══════════════════════════════════════════════════');
            console.log('🎉 SERVIDOR DE TESTE INICIADO COM SUCESSO!');
            console.log('═══════════════════════════════════════════════════');
            console.log(`🌐 URL: http://localhost:${PORT}`);
            console.log(`🔧 Ambiente: TEST (MongoDB em memória)`);
            console.log('═══════════════════════════════════════════════════\n');
        });
        
    } catch (error) {
        console.error('❌ Erro ao iniciar servidor:', error);
        process.exit(1);
    }
}

// Cleanup ao encerrar
process.on('SIGINT', async () => {
    console.log('\n🛑 Encerrando servidor de teste...');
    
    if (mongoose.connection.readyState === 1) {
        await mongoose.disconnect();
        console.log('✅ Desconectado do MongoDB');
    }
    
    if (mongoServer) {
        await mongoServer.stop();
        console.log('✅ MongoDB Memory Server encerrado');
    }
    
    console.log('👋 Até logo!\n');
    process.exit(0);
});

startServer();

module.exports = app;
