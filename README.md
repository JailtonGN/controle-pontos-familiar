# 🏆 Sistema de Controle de Pontos Familiar

[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18+-blue)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-5+-green)](https://mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)
[![Deploy](https://img.shields.io/badge/Deploy-Render-blue)](https://controle-pontos-familiar.onrender.com)

Um sistema web completo para gerenciar pontos e recompensas de crianças, desenvolvido com Node.js, Express e MongoDB.

## ✨ Características

- **🎯 Gestão de Atividades**: Cadastro de atividades positivas e negativas
- **👶 Cadastro de Crianças**: Sistema completo de cadastro com PIN de acesso
- **📊 Controle de Pontos**: Adição e remoção de pontos com atividades ou avulsos
- **📱 Interface Responsiva**: Design moderno e adaptável para todos os dispositivos
- **🔐 Sistema de Autenticação**: Login seguro com JWT
- **💬 Comunicação**: Sistema de mensagens entre responsáveis
- **📈 Histórico**: Acompanhamento completo de pontuação

## 🚀 Tecnologias Utilizadas

- **Backend**: Node.js, Express.js
- **Banco de Dados**: MongoDB
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Autenticação**: JWT (JSON Web Tokens)
- **Estilização**: CSS Custom com gradientes e animações

## 📋 Pré-requisitos

- Node.js (versão 14 ou superior)
- MongoDB (local ou MongoDB Atlas)
- npm ou yarn

## 🛠️ Instalação

### **Opção 1: Instalação Local**

1. **Clone o repositório**
   ```bash
   git clone https://github.com/JailtonGN/controle-pontos-familiar.git
   cd controle-pontos-familiar
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp env.example .env
   ```
   
   Edite o arquivo `.env` com suas configurações:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/controle-pontos
   JWT_SECRET=sua-chave-secreta-aqui
   ```

4. **Inicie o servidor**
   ```bash
   npm start
   ```

5. **Acesse a aplicação**
   ```
   http://localhost:3000
   ```

### **Opção 2: Deploy no Render (Recomendado)**

Para deploy automático no Render, siga o guia completo em [`RENDER_DEPLOY.md`](RENDER_DEPLOY.md).

**URL da aplicação**: [https://controle-pontos-familiar.onrender.com](https://controle-pontos-familiar.onrender.com)

## 🚀 Deploy Rápido

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy/schema-new?schema=https://github.com/JailtonGN/controle-pontos-familiar/blob/main/render.yaml)

## 📁 Estrutura do Projeto

```
controle-pontos-familiar/
├── config/
│   └── db.js                 # Configuração do banco de dados
├── controllers/
│   ├── activityController.js # Controle de atividades
│   ├── authController.js     # Controle de autenticação
│   ├── kidController.js      # Controle de crianças
│   ├── messageController.js  # Controle de mensagens
│   ├── pointController.js    # Controle de pontos
│   └── reminderController.js # Controle de lembretes
├── middleware/
│   └── auth.js              # Middleware de autenticação
├── models/
│   ├── Activity.js          # Modelo de atividades
│   ├── Kid.js              # Modelo de crianças
│   ├── Message.js          # Modelo de mensagens
│   ├── Notification.js     # Modelo de notificações
│   ├── Point.js            # Modelo de pontos
│   ├── Reminder.js         # Modelo de lembretes
│   └── User.js             # Modelo de usuários
├── public/
│   ├── css/
│   │   └── style.css       # Estilos principais
│   ├── js/
│   │   └── main.js         # JavaScript principal
│   ├── activities.html     # Página de configuração de atividades
│   ├── child-view.html     # Visualização da criança
│   ├── communication.html  # Sistema de comunicação
│   ├── dashboard.html      # Dashboard principal
│   ├── index.html          # Página de login
│   ├── kid-area.html       # Área da criança
│   ├── kids.html           # Cadastro de crianças
│   └── manage-points.html  # Gerenciamento de pontos
├── routes/
│   ├── activities.js       # Rotas de atividades
│   ├── auth.js            # Rotas de autenticação
│   ├── kids.js            # Rotas de crianças
│   ├── messages.js        # Rotas de mensagens
│   ├── points.js          # Rotas de pontos
│   └── reminders.js       # Rotas de lembretes
├── scripts/
│   └── seed-activities.js  # Script para popular atividades
├── server.js              # Servidor principal
├── package.json           # Dependências e scripts
└── README.md             # Este arquivo
```

## 🎮 Como Usar

### 1. **Primeiro Acesso**
- Acesse `http://localhost:3000`
- Faça login com suas credenciais
- Configure atividades positivas e negativas

### 2. **Cadastro de Crianças**
- Vá para "Cadastros" → "Crianças"
- Adicione crianças com nome, idade, emoji e PIN
- Cada criança terá acesso individual com seu PIN

### 3. **Configuração de Atividades**
- Vá para "Atividades" → "Atividades"
- Crie atividades positivas (que geram pontos)
- Crie atividades negativas (que removem pontos)

### 4. **Gerenciamento de Pontos**
- Vá para "Atividades" → "Gerenciar Pontos"
- Adicione pontos usando atividades cadastradas
- Adicione pontos avulsos para comportamentos especiais
- Remova pontos quando necessário

### 5. **Acompanhamento**
- Visualize o resumo atual de pontos
- Acesse o histórico de atividades
- Use o sistema de comunicação

## 🔧 Scripts Disponíveis

```bash
# Iniciar o servidor
npm start

# Iniciar em modo desenvolvimento
npm run dev

# Popular atividades iniciais
npm run seed

# Verificar dependências
npm audit
```

## 📱 Funcionalidades Principais

### **Dashboard**
- Visão geral de todas as crianças
- Pontuação atual de cada uma
- Acesso rápido às principais funções

### **Gestão de Atividades**
- Layout em duas colunas (positivas/negativas)
- Cores diferenciadas (verde/vermelho)
- Pontuação destacada visualmente
- Sistema de ícones e categorias

### **Controle de Pontos**
- Adição por atividades cadastradas
- Pontos avulsos personalizados
- Remoção de pontos
- Histórico completo

### **Sistema de Comunicação**
- Mensagens entre responsáveis
- Notificações automáticas
- Lembretes e avisos

## 🎨 Design e UX

- **Interface Moderna**: Design profissional com gradientes
- **Responsividade**: Funciona em desktop, tablet e mobile
- **Animações Suaves**: Transições e hover effects
- **Cores Intuitivas**: Verde para positivo, vermelho para negativo
- **Ícones Visuais**: Emojis e símbolos para melhor compreensão

## 🔐 Segurança

- Autenticação JWT
- Validação de dados
- Sanitização de inputs
- Middleware de proteção de rotas
- PIN individual para cada criança

## 📊 Banco de Dados

O sistema utiliza MongoDB com as seguintes coleções:
- **Users**: Usuários do sistema
- **Kids**: Crianças cadastradas
- **Activities**: Atividades disponíveis
- **Points**: Histórico de pontuação
- **Messages**: Sistema de comunicação
- **Reminders**: Lembretes e notificações

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

**JailtonGN**
- GitHub: [@JailtonGN](https://github.com/JailtonGN)
- Email: jailton.gn@gmail.com

## 🙏 Agradecimentos

- Famílias que testaram e deram feedback
- Comunidade de desenvolvedores
- Contribuidores do projeto

---

⭐ Se este projeto te ajudou, considere dar uma estrela no repositório! 