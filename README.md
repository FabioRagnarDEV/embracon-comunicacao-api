# 🚀 Embracon Comunicação API - Versão Refatorada

API REST segura e escalável para gerenciamento de comunicados internos e scripts de atendimento.

## 📋 Índice

- [Características](#características)
- [Arquitetura](#arquitetura)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Uso](#uso)
- [Segurança](#segurança)
- [Testes](#testes)
- [Deploy](#deploy)

---

## ✨ Características

### Funcionalidades
- ✅ Autenticação JWT com Supabase
- ✅ Gerenciamento de comunicados oficiais
- ✅ Sistema de scripts de atendimento
- ✅ Upload de arquivos com validação
- ✅ Sistema de curtidas e notificações
- ✅ Relatórios e métricas de leitura
- ✅ Controle de acesso baseado em perfil (RBAC)

### Segurança
- 🔒 Autenticação obrigatória em todas as rotas
- 🔒 Validação de entrada com express-validator
- 🔒 Sanitização de HTML (proteção XSS)
- 🔒 Rate limiting configurável
- 🔒 CORS restrito
- 🔒 Headers de segurança com Helmet
- 🔒 Logging completo de ações

---

## 🏗️ Arquitetura

```
src/
├── routes/              # Definição de rotas
│   ├── index.js
│   ├── auth.routes.js
│   ├── comunicados.routes.js
│   ├── scripts.routes.js
│   ├── relatorios.routes.js
│   └── notificacoes.routes.js
│
├── controllers/         # Controle de requisições HTTP
│   ├── auth.controller.js
│   ├── comunicados.controller.js
│   ├── scripts.controller.js
│   ├── relatorios.controller.js
│   └── notificacoes.controller.js
│
├── services/           # Lógica de negócio
│   ├── auth.service.js
│   ├── comunicados.service.js
│   ├── scripts.service.js
│   ├── relatorios.service.js
│   └── notificacoes.service.js
│
├── middlewares/        # Middlewares customizados
│   ├── auth.js
│   ├── permissoes.js
│   ├── upload.js
│   ├── rateLimiter.js
│   └── errorHandler.js
│
├── validators/         # Validação de entrada
│   ├── auth.validator.js
│   ├── comunicado.validator.js
│   └── script.validator.js
│
├── utils/             # Utilitários
│   ├── logger.js
│   ├── sanitizer.js
│   └── storage.js
│
└── config/            # Configurações
    └── supabase.js
```

### Padrão Arquitetural: MVC + Services

**Routes** → **Controllers** → **Services** → **Database**

---

## 📦 Instalação

### Pré-requisitos
- Node.js >= 18.x
- npm ou yarn
- Conta no Supabase

### Passos

```bash
# 1. Clonar o repositório
git clone <repo-url>
cd embracon-comunicacao-api

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais

# 4. Iniciar em desenvolvimento
npm run dev

# 5. Iniciar em produção
npm start
```

---

## ⚙️ Configuração

### Variáveis de Ambiente (.env)

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key

# Servidor
PORT=3000
NODE_ENV=development

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

### Configuração do Supabase

1. Criar projeto no Supabase
2. Executar migrations do banco de dados
3. Configurar Storage bucket "anexos"
4. Habilitar Row Level Security (RLS)

---

## 🔌 Uso

### Endpoints Principais

#### Autenticação
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

#### Comunicados
```http
# Listar todos
GET /api/comunicados
Authorization: Bearer <token>

# Criar novo (apenas MONITOR_QUALIDADE)
POST /api/comunicados
Authorization: Bearer <token>
Content-Type: multipart/form-data

titulo=Novo Comunicado
conteudo=<p>Conteúdo HTML</p>
tags=importante,urgente
arquivos=@file1.pdf
arquivos=@file2.jpg

# Curtir comunicado
POST /api/comunicados/:id/curtir
Authorization: Bearer <token>
```

#### Scripts
```http
# Listar scripts do usuário e da equipe
GET /api/scripts
Authorization: Bearer <token>

# Criar script
POST /api/scripts
Authorization: Bearer <token>
Content-Type: multipart/form-data

titulo=Script de Saudação
conteudo=<p>Bom dia!</p>
visivel_equipe=true
```

#### Relatórios (apenas MONITOR_QUALIDADE)
```http
GET /api/relatorios
Authorization: Bearer <token>
```

---

## 🔒 Segurança

### Autenticação

Todas as rotas (exceto `/api/auth/login`) requerem token JWT:

```javascript
Authorization: Bearer <seu_token_jwt>
```

### Perfis e Permissões

| Perfil | Permissões |
|--------|-----------|
| MONITOR_QUALIDADE | Criar/editar/deletar comunicados, ver relatórios |
| ATENDENTE | Ver comunicados, criar/editar próprios scripts |

### Rate Limiting

| Endpoint | Limite |
|----------|--------|
| Geral | 100 req/15min |
| Login | 5 req/15min |
| Upload | 20 req/hora |

### Validação de Arquivos

- Tamanho máximo: 200MB
- Tipos permitidos: Todos (sanitizados)
- Máximo de arquivos: 5 por requisição

---

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Testes com coverage
npm run test:coverage

# Testes em modo watch
npm run test:watch

# Linting
npm run lint
npm run lint:fix
```

### Estrutura de Testes

```
tests/
├── unit/
│   ├── services/
│   ├── controllers/
│   └── utils/
├── integration/
│   └── routes/
└── e2e/
    └── scenarios/
```

---

## 🚀 Deploy

### Checklist Pré-Deploy

- [ ] Rotacionar credenciais do Supabase
- [ ] Configurar variáveis de ambiente
- [ ] Habilitar HTTPS
- [ ] Configurar domínio
- [ ] Configurar firewall
- [ ] Habilitar logs
- [ ] Configurar backup
- [ ] Testar em staging

### Deploy no Heroku

```bash
# 1. Criar app
heroku create embracon-api

# 2. Configurar variáveis
heroku config:set SUPABASE_URL=xxx
heroku config:set SUPABASE_SERVICE_KEY=xxx
heroku config:set NODE_ENV=production

# 3. Deploy
git push heroku main

# 4. Verificar logs
heroku logs --tail
```

### Deploy no AWS/Azure/GCP

Consulte a documentação específica de cada provedor.

---

## 📊 Monitoramento

### Logs

Logs são salvos em:
- `logs/error.log` - Apenas erros
- `logs/combined.log` - Todos os logs
- `logs/access.log` - Logs HTTP

### Métricas Recomendadas

- Taxa de erro (< 1%)
- Tempo de resposta (< 200ms)
- Uso de CPU (< 70%)
- Uso de memória (< 80%)
- Taxa de requisições bloqueadas

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

---

## 📝 Licença

ISC

---

## 👥 Suporte

Para suporte, abra uma issue no GitHub ou entre em contato com a equipe de desenvolvimento.

---

## 📚 Documentação Adicional

- [Relatório de Segurança](../SECURITY_REPORT.md)
- [Guia de Migração](./MIGRATION_GUIDE.md)
- [API Reference](./API_REFERENCE.md)

---

**Versão:** 2.0.0  
**Última Atualização:** 13/04/2026
