const request = require('supertest');
const app = require('../index.refatorado');

describe('API Tests', () => {
    describe('GET /api/status', () => {
        it('deve retornar status 200', async () => {
            const response = await request(app)
                .get('/api/status')
                .expect(200);

            expect(response.body).toHaveProperty('mensagem');
            expect(response.body.mensagem).toContain('API da Plataforma Integradora');
        });
    });

    describe('POST /api/auth/login', () => {
        it('deve retornar erro sem credenciais', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({})
                .expect(400);

            expect(response.body).toHaveProperty('erro');
        });

        it('deve retornar erro com email inválido', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'email-invalido',
                    password: 'senha123'
                })
                .expect(400);

            expect(response.body).toHaveProperty('erro');
        });
    });

    describe('GET /api/comunicados', () => {
        it('deve retornar 401 sem token', async () => {
            await request(app)
                .get('/api/comunicados')
                .expect(401);
        });

        it('deve retornar 401 com token inválido', async () => {
            await request(app)
                .get('/api/comunicados')
                .set('Authorization', 'Bearer token-invalido')
                .expect(401);
        });
    });

    describe('Rate Limiting', () => {
        it('deve bloquear após muitas requisições', async () => {
            // Fazer 101 requisições (limite é 100)
            const requests = [];
            for (let i = 0; i < 101; i++) {
                requests.push(request(app).get('/api/status'));
            }

            const responses = await Promise.all(requests);
            const blocked = responses.filter(r => r.status === 429);

            expect(blocked.length).toBeGreaterThan(0);
        }, 30000); // Timeout de 30s
    });
});

describe('Validação de Entrada', () => {
    let token;

    beforeAll(async () => {
        // Fazer login para obter token (ajustar com credenciais válidas)
        // const response = await request(app)
        //     .post('/api/auth/login')
        //     .send({
        //         email: 'teste@exemplo.com',
        //         password: 'senha123'
        //     });
        // token = response.body.token;
    });

    it('deve rejeitar título muito curto', async () => {
        if (!token) return; // Skip se não tiver token

        const response = await request(app)
            .post('/api/comunicados')
            .set('Authorization', `Bearer ${token}`)
            .send({
                titulo: 'ab', // Muito curto
                conteudo: 'Conteúdo válido aqui',
                tags: 'teste'
            })
            .expect(400);

        expect(response.body).toHaveProperty('erro');
    });
});
