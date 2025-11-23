const { MongoMemoryServer } = require('mongodb-memory-server');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const net = require('net');

// Função para encontrar uma porta livre
function findAvailablePort(startPort) {
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.listen(startPort, () => {
            const { port } = server.address();
            server.close(() => resolve(port));
        });
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                resolve(findAvailablePort(startPort + 1));
            } else {
                reject(err);
            }
        });
    });
}

async function seedData() {
    console.log('🌱 Semeando dados iniciais...');
    try {
        const User = require('../models/User');
        const Family = require('../models/Family');

        // Gerar IDs antecipadamente para resolver dependência circular
        const adminId = new mongoose.Types.ObjectId();
        const familyId = new mongoose.Types.ObjectId();

        // Criar Admin
        const adminEmail = 'admin@teste.com';
        const adminPassword = '123456'; // Senha válida (min 6 chars)

        const admin = new User({
            _id: adminId,
            name: 'Admin Offline',
            email: adminEmail,
            password: adminPassword,
            role: 'admin',
            familyId: familyId // Já associamos o ID da família
        });
        await admin.save();
        console.log(`👤 Usuário criado: ${adminEmail} / ${adminPassword}`);

        // Criar Família
        const family = new Family({
            _id: familyId,
            name: 'Família Teste',
            description: 'Família para testes offline',
            isActive: true,
            createdBy: adminId // Já associamos o ID do admin
        });
        await family.save();
        console.log('🏠 Família criada: Família Teste');

    } catch (error) {
        console.error('❌ Erro ao semear dados:', error);
    }
}

async function startOffline() {
    console.log('🚀 Iniciando Modo Offline...');

    try {
        // 1. Iniciar MongoDB em memória
        console.log('📦 Iniciando MongoDB em memória...');
        const mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();

        console.log('✅ MongoDB em memória iniciado!');

        // 2. Configurar variáveis de ambiente
        process.env.MONGODB_URI = uri;
        process.env.NODE_ENV = 'development';

        // Encontrar porta livre
        const port = await findAvailablePort(3000);
        process.env.PORT = port.toString();

        // 3. Iniciar o servidor da aplicação
        console.log(`🔌 Iniciando servidor da aplicação na porta ${port}...`);

        // Importar models antes de iniciar o servidor para garantir que o mongoose os conheça
        // (Isso é feito dentro do server.js, mas precisamos para o seed)
        // Vamos conectar manualmente para o seed antes de iniciar o server
        await mongoose.connect(uri);
        await seedData();

        // Iniciar servidor
        require('../server.js');

        // Manter o processo rodando e limpar ao sair
        process.on('SIGINT', async () => {
            console.log('\n🛑 Parando serviços...');
            await mongoose.disconnect();
            await mongod.stop();
            process.exit(0);
        });

    } catch (error) {
        console.error('❌ Erro ao iniciar modo offline:', error);
        process.exit(1);
    }
}

startOffline();
