# 🔄 Atualizar Senha do MongoDB no Render

## 📋 Situação Atual
A senha do MongoDB Atlas foi alterada para: `TyCsPlZNsDWOM46N`

## 🚀 Passos para Atualizar no Render

### 1. **Acessar o Dashboard do Render**
1. Vá para [render.com](https://render.com)
2. Faça login na sua conta
3. Encontre o serviço `controle-pontos-familiar`

### 2. **Atualizar a Variável de Ambiente**
1. Clique no seu serviço `controle-pontos-familiar`
2. Vá para a aba **"Environment"**
3. Encontre a variável `MONGODB_URI`
4. Clique em **"Edit"** ou **"Update"**

### 3. **Nova String de Conexão**
Substitua a string atual pela nova string com a senha atualizada:

```
mongodb+srv://seu_usuario:TyCsPlZNsDWOM46N@seu_cluster.mongodb.net/controle-pontos-familiar?retryWrites=true&w=majority
```

**⚠️ IMPORTANTE**: 
- Substitua `seu_usuario` pelo seu nome de usuário do MongoDB Atlas
- Substitua `seu_cluster` pelo nome do seu cluster
- Mantenha `TyCsPlZNsDWOM46N` como a nova senha

### 4. **Salvar e Deploy**
1. Clique em **"Save Changes"**
2. O Render fará um novo deploy automaticamente
3. Aguarde alguns minutos para o deploy completar

### 5. **Verificar se Funcionou**
1. Acesse: `https://controle-pontos-familiar.onrender.com/api/health`
2. Deve retornar uma resposta de sucesso
3. Teste o login na aplicação

## 🔍 Como Testar Localmente

Se quiser testar a nova senha localmente:

1. **Criar arquivo `.env`** (se não existir):
```env
MONGODB_URI=mongodb+srv://seu_usuario:TyCsPlZNsDWOM46N@seu_cluster.mongodb.net/controle-pontos-familiar?retryWrites=true&w=majority
JWT_SECRET=sua_chave_secreta_aqui
NODE_ENV=development
PORT=3000
```

2. **Testar conexão**:
```bash
npm run test:db
```

## 🚨 Se Houver Problemas

### **Erro de Conexão**
- Verifique se a string de conexão está correta
- Confirme se o usuário e senha estão corretos
- Verifique se o IP whitelist está configurado no MongoDB Atlas

### **Erro de Deploy**
- Verifique os logs no Render
- Confirme se todas as variáveis de ambiente estão configuradas
- Teste a conexão localmente primeiro

## 📞 Suporte

Se precisar de ajuda:
1. Verifique os logs no dashboard do Render
2. Teste a conexão localmente
3. Confirme as configurações do MongoDB Atlas

---

**✅ Após atualizar a senha, sua aplicação estará funcionando normalmente!** 