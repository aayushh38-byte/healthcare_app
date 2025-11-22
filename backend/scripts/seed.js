const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // 1. Create Demo Patient
    const hashedPassword = await bcrypt.hash('password123', 10);
    const patient = await prisma.user.upsert({
        where: { email: 'demo@patient.com' },
        update: {},
        create: {
            email: 'demo@patient.com',
            password: hashedPassword,
            name: 'Demo Patient',
            role: 'PATIENT'
        }
    });
    console.log('Created patient:', patient.email);

    // 2. Create Doctors
    const doctorsData = [
        { name: 'Dr. Sarah Smith', specialization: 'Cardiologist', fee: 150, bio: 'Expert in heart health with 10 years experience.' },
        { name: 'Dr. John Doe', specialization: 'Dermatologist', fee: 100, bio: 'Specialist in skin care and treatments.' },
        { name: 'Dr. Emily White', specialization: 'Pediatrician', fee: 120, bio: 'Caring for children from infancy to young adulthood.' },
        { name: 'Dr. Michael Brown', specialization: 'Neurologist', fee: 200, bio: 'Treating disorders of the nervous system.' },
        { name: 'Dr. Jessica Davis', specialization: 'General Physician', fee: 80, bio: 'Your first stop for general health concerns.' },
        { name: 'Dr. David Wilson', specialization: 'Orthopedic', fee: 180, bio: 'Specializing in bones, joints, and muscles.' }
    ];

    for (const doc of doctorsData) {
        const doctor = await prisma.doctor.create({
            data: {
                name: doc.name,
                specialization: doc.specialization,
                fee: doc.fee,
                bio: doc.bio,
                workingHours: {
                    create: [
                        { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }, // Mon
                        { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' }, // Tue
                        { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' }, // Wed
                        { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' }, // Thu
                        { dayOfWeek: 5, startTime: '09:00', endTime: '13:00' }, // Fri
                    ]
                },
                reviews: {
                    create: [
                        { userId: patient.id, rating: 5, comment: 'Excellent doctor, very patient.' },
                        { userId: patient.id, rating: 4, comment: 'Good experience but wait time was long.' }
                    ]
                }
            }
        });
        console.log('Created doctor:', doctor.name);
    }

    console.log('Seeding completed.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
