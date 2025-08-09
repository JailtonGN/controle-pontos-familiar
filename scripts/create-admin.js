#!/usr/bin/env node

require('dotenv').config();
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const part = argv[i];
    if (part.startsWith('--')) {
      const [key, value] = part.replace(/^--/, '').split('=');
      if (value !== undefined) {
        args[key] = value;
      } else if (i + 1 < argv.length && !argv[i + 1].startsWith('--')) {
        args[key] = argv[++i];
      } else {
        args[key] = true;
      }
    }
  }
  return args;
}

(async () => {
  const args = parseArgs(process.argv);
  const email = args.email || args.e;
  const password = args.password || args.p;
  const name = args.name || args.n || 'Administrador';

  if (!email || !password) {
    console.error('Uso: node scripts/create-admin.js --email <email> --password <senha> [--name <nome>]');
    process.exit(1);
  }

  try {
    await connectDB();

    let user = await User.findOne({ email });
    if (user) {
      console.log(`Usuário encontrado para ${email}. Atualizando role para admin e senha...`);
      user.role = 'admin';
      user.password = password; // será hasheada no pre-save
      if (name) user.name = name;
      await user.save();
    } else {
      console.log(`Criando novo usuário admin para ${email}...`);
      user = new User({ name, email, password, role: 'admin' });
      await user.save();
    }

    console.log('✅ Usuário admin criado/atualizado com sucesso:');
    console.log({ _id: user._id.toString(), name: user.name, email: user.email, role: user.role });
  } catch (err) {
    console.error('❌ Erro ao criar/promover admin:', err && err.message ? err.message : err);
    process.exitCode = 1;
  } finally {
    try { await disconnectDB(); } catch (_) {}
  }
})();