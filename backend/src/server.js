const fastify = require('fastify')({ logger: true });
const cors = require('@fastify/cors');
const jwt = require('@fastify/jwt');
require('dotenv').config();

// Register plugins
fastify.register(cors, {
  origin: true // Allow all for demo
});

fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'supersecretkey'
});

// Decorate with authenticate
fastify.decorate("authenticate", async function (request, reply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});

// Register routes
fastify.register(require('./routes/auth.routes'), { prefix: '/api/auth' });
fastify.register(require('./routes/doctor.routes'), { prefix: '/api/doctors' });
fastify.register(require('./routes/appointment.routes'), { prefix: '/api/appointments' });
fastify.register(require('./routes/symptom.routes'));

// Health check
fastify.get('/', async (request, reply) => {
  return { status: 'ok', message: 'Healthcare API is running' };
});

const start = async () => {
  try {
    await fastify.listen({ port: process.env.PORT || 3000, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
