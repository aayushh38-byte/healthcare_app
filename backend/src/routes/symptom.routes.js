const { analyzeSymptoms } = require('../services/aiSymptomService');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function symptomRoutes(fastify, options) {
    fastify.post('/ai/symptom-check', async (request, reply) => {
        const { symptoms, userId } = request.body;

        if (!symptoms) {
            return reply.code(400).send({ error: 'Symptoms are required' });
        }

        try {
            // Call AI Service
            const result = await analyzeSymptoms(symptoms);

            // Save to DB if userId is provided (and not a follow-up question only)
            if (userId && !result.follow_up_question) {
                try {
                    // Verify user exists first
                    const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
                    if (user) {
                        await prisma.symptomCheck.create({
                            data: {
                                userId: parseInt(userId),
                                symptomsText: symptoms,
                                responseJson: JSON.stringify(result)
                            }
                        });
                    }
                } catch (dbError) {
                    console.error('Failed to save symptom check:', dbError);
                    // Don't fail the request if saving fails
                }
            }

            return result;
        } catch (error) {
            console.error('Symptom Check Error:', error);
            return reply.code(503).send({
                error: 'Service unavailable',
                details: error.message
            });
        }
    });
}

module.exports = symptomRoutes;
