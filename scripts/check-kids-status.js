const mongoose = require('mongoose');
require('dotenv').config();

async function checkKidsStatus() {
    try {
        console.log('🔍 Conectando ao MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado com sucesso!');

        // Importar o modelo Kid
        const Kid = require('../models/Kid');

        console.log('📋 Verificando crianças no banco...');
        const kids = await Kid.find({});
        
        console.log(`📊 Total de crianças encontradas: ${kids.length}`);
        
        if (kids.length > 0) {
            kids.forEach((kid, index) => {
                console.log(`👶 Criança ${index + 1}:`);
                console.log(`  ID: ${kid._id}`);
                console.log(`  Nome: ${kid.name}`);
                console.log(`  Parent ID: ${kid.parentId}`);
                console.log(`  Ativa: ${kid.isActive}`);
                console.log(`  Criada em: ${kid.createdAt}`);
                console.log('---');
            });
        } else {
            console.log('❌ Nenhuma criança encontrada no banco');
        }

        // Verificar crianças ativas
        const activeKids = await Kid.find({ isActive: true });
        console.log(`📋 Crianças ativas: ${activeKids.length}`);

        // Verificar crianças inativas
        const inactiveKids = await Kid.find({ isActive: false });
        console.log(`📋 Crianças inativas: ${inactiveKids.length}`);

        await mongoose.disconnect();
        console.log('✅ Verificação concluída!');

    } catch (error) {
        console.error('❌ Erro:', error);
        process.exit(1);
    }
}

checkKidsStatus(); 