const mongoose = require('mongoose');
require('dotenv').config();

// Modelo de Usuário
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Nome é obrigatório'],
        trim: true,
        maxlength: [100, 'Nome não pode ter mais de 100 caracteres']
    },
    email: {
        type: String,
        required: [true, 'Email é obrigatório'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
    },
    password: {
        type: String,
        required: [true, 'Senha é obrigatória'],
        minlength: [6, 'Senha deve ter pelo menos 6 caracteres']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

async function listUsers() {
    try {
        // Conectar ao MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/controle-pontos';
        console.log('🔌 Conectando ao MongoDB...');
        
        await mongoose.connect(mongoUri);
        console.log('✅ Conectado ao MongoDB com sucesso!');

        // Buscar todos os usuários
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        
        console.log('\n📋 USUÁRIOS CADASTRADOS:');
        console.log('=' .repeat(50));
        
        if (users.length === 0) {
            console.log('❌ Nenhum usuário encontrado no banco de dados.');
        } else {
            users.forEach((user, index) => {
                console.log(`\n👤 USUÁRIO ${index + 1}:`);
                console.log(`   ID: ${user._id}`);
                console.log(`   Nome: ${user.name}`);
                console.log(`   Email: ${user.email}`);
                console.log(`   Status: ${user.isActive ? '✅ Ativo' : '❌ Inativo'}`);
                console.log(`   Criado em: ${user.createdAt.toLocaleString('pt-BR')}`);
                console.log(`   Atualizado em: ${user.updatedAt.toLocaleString('pt-BR')}`);
            });
            
            console.log(`\n📊 TOTAL: ${users.length} usuário(s)`);
        }

    } catch (error) {
        console.error('❌ Erro ao listar usuários:', error.message);
    } finally {
        // Fechar conexão
        await mongoose.disconnect();
        console.log('\n🔌 Conexão com MongoDB fechada.');
    }
}

// Executar script
listUsers(); 