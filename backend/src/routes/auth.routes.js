const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function authRoutes(fastify, options) {

    // Register
    fastify.post('/register', async (request, reply) => {
        const { email, password, name } = request.body;

        if (!email || !password || !name) {
            return reply.code(400).send({ message: 'Missing fields' });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return reply.code(409).send({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { email, password: hashedPassword, name }
        });

        const token = fastify.jwt.sign({ id: user.id, email: user.email, role: user.role });
        return { token, user: { id: user.id, email: user.email, name: user.name } };
    });

    // Login
    fastify.post('/login', async (request, reply) => {
        const { email, password } = request.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return reply.code(401).send({ message: 'Invalid credentials' });
        }

        const token = fastify.jwt.sign({ id: user.id, email: user.email, role: user.role });
        return { token, user: { id: user.id, email: user.email, name: user.name } };
    });

    // Refresh (Simplified: just re-issue if valid, in real app verify refresh token)
    fastify.post('/refresh', { onRequest: [fastify.authenticate] }, async (request, reply) => {
        const user = request.user;
        const token = fastify.jwt.sign({ id: user.id, email: user.email, role: user.role });
        return { token };
    });
}

module.exports = authRoutes;
