const fetch = require('node-fetch'); // You might need to install node-fetch if using older node, but for now assuming fetch is available or this is just a script to run with recent node

// Simple script to test atomicity
// Run this after starting the server
async function testAtomicity() {
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'demo@patient.com', password: 'password123' })
    });
    const { token } = await loginRes.json();

    if (!token) {
        console.error('Failed to login');
        return;
    }

    const bookingData = {
        doctorId: 1,
        date: '2025-12-01', // Future date
        startTime: '10:00'
    };

    console.log('Attempting concurrent bookings...');

    const req1 = fetch('http://localhost:3000/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(bookingData)
    });

    const req2 = fetch('http://localhost:3000/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(bookingData)
    });

    const [res1, res2] = await Promise.all([req1, req2]);

    console.log('Response 1:', res1.status);
    console.log('Response 2:', res2.status);

    if ((res1.status === 200 && res2.status === 409) || (res1.status === 409 && res2.status === 200)) {
        console.log('SUCCESS: Atomicity preserved. One succeeded, one failed.');
    } else {
        console.log('FAILURE: Unexpected results.');
    }
}

// Note: This script requires the server to be running.
// To run: node tests/test-booking-atomicity.js
// (Ensure node-fetch is installed or use Node 18+ native fetch)
if (require.main === module) {
    // Check if native fetch exists (Node 18+)
    if (!globalThis.fetch) {
        console.log("Native fetch not found. Please run with Node 18+ or install node-fetch.");
    } else {
        testAtomicity();
    }
}
