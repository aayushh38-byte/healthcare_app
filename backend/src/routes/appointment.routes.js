const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function appointmentRoutes(fastify, options) {

    // Middleware to ensure login
    fastify.addHook('onRequest', fastify.authenticate);

    // Book appointment
    fastify.post('/', async (request, reply) => {
        const { doctorId, date, startTime, type } = request.body; // type: IN_PERSON or VIDEO
        const userId = request.user.id;

        if (!doctorId || !date || !startTime) {
            return reply.code(400).send({ message: 'Missing fields' });
        }

        const apptType = type || 'IN_PERSON';
        let meetingLink = null;
        if (apptType === 'VIDEO') {
            meetingLink = `https://meet.jit.si/healthbook-${doctorId}-${userId}-${Date.now()}`;
        }

        try {
            // Atomic booking via unique constraint
            const appointment = await prisma.appointment.create({
                data: {
                    userId,
                    doctorId,
                    date: new Date(date),
                    startTime,
                    status: 'CONFIRMED',
                    type: apptType,
                    meetingLink
                }
            });
            return appointment;
        } catch (err) {
            if (err.code === 'P2002') {
                return reply.code(409).send({ message: 'Slot already booked' });
            }
            fastify.log.error(err);
            return reply.code(500).send({ message: 'Internal server error' });
        }
    });

    // Get my appointments
    fastify.get('/me', async (request, reply) => {
        const userId = request.user.id;
        const appointments = await prisma.appointment.findMany({
            where: { userId },
            include: { doctor: true },
            orderBy: { date: 'asc' }
        });
        return appointments;
    });

    // Cancel appointment
    fastify.patch('/:id/cancel', async (request, reply) => {
        const { id } = request.params;
        const userId = request.user.id;

        const appointment = await prisma.appointment.findFirst({
            where: { id: parseInt(id), userId }
        });

        if (!appointment) {
            return reply.code(404).send({ message: 'Appointment not found' });
        }

        const updated = await prisma.appointment.update({
            where: { id: parseInt(id) },
            data: { status: 'CANCELLED' }
        });

        return updated;
    });
}

module.exports = appointmentRoutes;
