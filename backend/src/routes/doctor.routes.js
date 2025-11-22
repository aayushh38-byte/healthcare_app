const { PrismaClient } = require('@prisma/client');
const { addDays, format, parse, isBefore, isAfter, isEqual } = require('date-fns');
const prisma = new PrismaClient();

async function doctorRoutes(fastify, options) {

    // Get all doctors (with search)
    fastify.get('/', async (request, reply) => {
        const { search, specialization } = request.query;

        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { specialization: { contains: search } }
            ];
        }
        if (specialization) {
            where.specialization = specialization;
        }

        const doctors = await prisma.doctor.findMany({
            where,
            include: {
                reviews: true,
                workingHours: true,
                appointments: {
                    where: {
                        date: { gte: new Date() },
                        status: 'CONFIRMED'
                    }
                }
            }
        });

        // Calculate average rating and next slot
        const doctorsWithDetails = doctors.map(doc => {
            // Rating
            const totalRating = doc.reviews.reduce((sum, rev) => sum + rev.rating, 0);
            const avgRating = doc.reviews.length > 0 ? (totalRating / doc.reviews.length).toFixed(1) : 0;

            // Next Available Slot
            let nextSlot = 'Not Available';
            const today = new Date();

            // Check next 7 days
            for (let i = 0; i < 7; i++) {
                const checkDate = addDays(today, i);
                const dayOfWeek = checkDate.getDay();
                const dayConfig = doc.workingHours.find(wh => wh.dayOfWeek === dayOfWeek);

                if (dayConfig) {
                    let timeStr = dayConfig.startTime;
                    const endTimeStr = dayConfig.endTime;

                    // If today, start from current time
                    if (i === 0) {
                        const currentHours = today.getHours();
                        const currentMinutes = today.getMinutes();
                        const currentTimeStr = `${currentHours.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`;
                        if (timeStr < currentTimeStr) {
                            // Round up to next 30 min
                            const dateObj = new Date();
                            dateObj.setMinutes(dateObj.getMinutes() + 30 - (dateObj.getMinutes() % 30));
                            timeStr = format(dateObj, 'HH:mm');
                        }
                    }

                    while (timeStr < endTimeStr) {
                        const isBooked = doc.appointments.some(app =>
                            isEqual(new Date(app.date), new Date(format(checkDate, 'yyyy-MM-dd'))) &&
                            app.startTime === timeStr
                        );

                        if (!isBooked) {
                            if (i === 0) nextSlot = `Today, ${timeStr}`;
                            else if (i === 1) nextSlot = `Tomorrow, ${timeStr}`;
                            else nextSlot = `${format(checkDate, 'EEE')}, ${timeStr}`;
                            break;
                        }

                        // Increment 30 mins
                        const [hours, minutes] = timeStr.split(':').map(Number);
                        const dateObj = new Date(2000, 0, 1, hours, minutes);
                        dateObj.setMinutes(dateObj.getMinutes() + 30);
                        timeStr = format(dateObj, 'HH:mm');
                    }
                }
                if (nextSlot !== 'Not Available') break;
            }

            // Remove heavy relations from response
            const { workingHours, appointments, reviews, ...doctorData } = doc;

            return {
                ...doctorData,
                averageRating: avgRating,
                reviewCount: doc.reviews.length,
                nextAvailableSlot: nextSlot
            };
        });

        return doctorsWithDetails;
    });

    // Get doctor details
    fastify.get('/:id', async (request, reply) => {
        const { id } = request.params;
        const doctor = await prisma.doctor.findUnique({
            where: { id: parseInt(id) },
            include: {
                workingHours: true,
                reviews: {
                    include: { user: { select: { name: true } } },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!doctor) return reply.code(404).send({ message: 'Doctor not found' });

        const totalRating = doctor.reviews.reduce((sum, rev) => sum + rev.rating, 0);
        const avgRating = doctor.reviews.length > 0 ? (totalRating / doctor.reviews.length).toFixed(1) : 0;

        return { ...doctor, averageRating: avgRating, reviewCount: doctor.reviews.length };
    });

    // Get availability
    fastify.get('/:id/availability', async (request, reply) => {
        const { id } = request.params;
        const { start, end } = request.query; // YYYY-MM-DD

        if (!start || !end) {
            return reply.code(400).send({ message: 'Start and end dates required' });
        }

        const doctorId = parseInt(id);
        const startDate = new Date(start);
        const endDate = new Date(end);

        // 1. Get working hours
        const workingHours = await prisma.workingHours.findMany({
            where: { doctorId }
        });

        // 2. Get existing appointments
        const appointments = await prisma.appointment.findMany({
            where: {
                doctorId,
                date: {
                    gte: startDate,
                    lte: endDate
                },
                status: 'CONFIRMED'
            }
        });

        // 3. Generate slots
        const slots = [];
        let currentDate = startDate;

        while (isBefore(currentDate, endDate) || isEqual(currentDate, endDate)) {
            const dayOfWeek = currentDate.getDay(); // 0-6
            const dayConfig = workingHours.find(wh => wh.dayOfWeek === dayOfWeek);

            if (dayConfig) {
                let timeStr = dayConfig.startTime;
                const endTimeStr = dayConfig.endTime;

                // Simple 30 min slots
                while (timeStr < endTimeStr) {
                    // Check if booked
                    const isBooked = appointments.some(app =>
                        isEqual(new Date(app.date), currentDate) && app.startTime === timeStr
                    );

                    if (!isBooked) {
                        slots.push({
                            date: format(currentDate, 'yyyy-MM-dd'),
                            time: timeStr,
                            available: true
                        });
                    }

                    // Increment 30 mins
                    const [hours, minutes] = timeStr.split(':').map(Number);
                    const dateObj = new Date(2000, 0, 1, hours, minutes);
                    dateObj.setMinutes(dateObj.getMinutes() + 30);
                    timeStr = format(dateObj, 'HH:mm');
                }
            }
            currentDate = addDays(currentDate, 1);
        }

        return slots;
    });
}

module.exports = doctorRoutes;
