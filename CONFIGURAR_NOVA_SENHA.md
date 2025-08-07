# 🔄 Configurar Nova Senha do MongoDB no Render

## 📋 Resumo da Situação
- **Nova senha do MongoDB Atlas**: `TyCsPlZNsDWOM46N`
- **Ação necessária**: Atualizar a variável `MONGODB_URI` no Render

## 🚀 Passos Rápidos

### 1. **Acessar o Render**
1. Vá para [render.com](https://render.com)
2. Faça login na sua conta
3. Encontre o serviço `controle-pontos-familiar`

### 2. **Atualizar a String de Conexão**
1. Clique no serviço `controle-pontos-familiar`
2. Vá para a aba **"Environment"**
3. Encontre a variável `MONGODB_URI`
4. Clique em **"Edit"**

### 3. **Nova String de Conexão**
Substitua a string atual por:
```
mongodb+srv://SEU_USUARIO:TyCsPlZNsDWOM46N@SEU_CLUSTER.mongodb.net/controle-pontos-familiar?retryWrites=true&w=majority
```

**⚠️ IMPORTANTE**: 
- Substitua `SEU_USUARIO` pelo seu nome de usuário do MongoDB Atlas
- Substitua `SEU_CLUSTER` pelo nome do seu cluster
- Mantenha `TyCsPlZNsDWOM46N` como a nova senha

### 4. **Salvar e Aguardar**
1. Clique em **"Save Changes"**
2. O Render fará deploy automático
3. Aguarde alguns minutos

### 5. **Verificar**
1. Acesse: `https://controle-pontos-familiar.onrender.com/api/health`
2. Deve retornar sucesso
3. Teste o login na aplicação

## 🔍 Testar Localmente (Opcional)

Se quiser testar antes de atualizar no Render:

1. **Criar arquivo `.env`**:
```env
MONGODB_URI=mongodb+srv://SEU_USUARIO:TyCsPlZNsDWOM46N@SEU_CLUSTER.mongodb.net/controle-pontos-familiar?retryWrites=true&w=majority
JWT_SECRET=sua_chave_secreta_aqui
NODE_ENV=development
PORT=3000
```

2. **Testar conexão**:
```bash
npm run test-new-password
```

3. **Gerar string de conexão**:
```bash
npm run generate-connection
```

## 🚨 Troubleshooting

### **Se a aplicação não funcionar após a atualização**:
1. Verifique os logs no Render
2. Confirme se a string de conexão está correta
3. Teste localmente primeiro
4. Verifique se o MongoDB Atlas está ativo

### **Se houver erro de conexão**:
1. Confirme se o usuário e senha estão corretos
2. Verifique se o IP whitelist está configurado
3. Teste a conexão localmente

## 📞 URLs Importantes

- **Aplicação**: `https://controle-pontos-familiar.onrender.com`
- **API Health**: `https://controle-pontos-familiar.onrender.com/api/health`
- **Dashboard**: `https://controle-pontos-familiar.onrender.com/dashboard`

---

**✅ Após seguir estes passos, sua aplicação estará funcionando com a nova senha!** 