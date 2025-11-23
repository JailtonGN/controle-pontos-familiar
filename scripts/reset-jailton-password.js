const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const User = require('../models/User');

async function resetJailtonPassword() {
    try {
        console.log('🔐 Resetando senha do Jailton...\n');

        // Buscar usuário específico
        const admin = await User.findOne({ email: 'jailtongn@outlook.com' });
        
        if (!admin) {
            console.log('❌ Usuário jailtongn@outlook.com não encontrado.');
            return;
        }

        console.log(`✅ Usuário encontrado: ${admin.name}`);
        console.log(`📧 Email: ${admin.email}`);
        console.log(`👤 Role: ${admin.role}`);
        console.log(`✅ Ativo: ${admin.isActive ? 'Sim' : 'Não'}\n`);

        // Definir nova senha
        const newPassword = 'jailton123';
        
        console.log('🔄 Atualizando senha...');
        
        // Atualizar senha diretamente (o middleware do modelo fará o hash)
        admin.password = newPassword;
        await admin.save();
        
        console.log('✅ Senha atualizada com sucesso!\n');
        console.log('🚀 Credenciais de login:');
        console.log(`📧 Email: ${admin.email}`);
        console.log(`🔑 Senha: ${newPassword}`);
        console.log('\n⚠️  Lembre-se de alterar a senha após o login por segurança!');

    } catch (error) {
        console.error('❌ Erro ao resetar senha:', error);
    } finally {
        mongoose.connection.close();
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    resetJailtonPassword();
}

module.exports = { resetJailtonPassword };