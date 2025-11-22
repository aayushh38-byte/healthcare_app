import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, parseISO, isFuture } from 'date-fns';
import { Calendar, Clock, User, XCircle, Activity, Video, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SymptomCheckerWidget from '../components/SymptomCheckerWidget';

const Dashboard = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const res = await axios.get('/api/appointments/me');
            setAppointments(res.data);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
        try {
            await axios.patch(`/api/appointments/${id}/cancel`);
            fetchAppointments();
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            alert('Failed to cancel appointment');
        }
    };

    const upcomingAppointments = appointments.filter(app =>
        app.status !== 'CANCELLED' && isFuture(parseISO(`${app.date.split('T')[0]}T${app.startTime}`))
    );

    const pastAppointments = appointments.filter(app =>
        app.status === 'CANCELLED' || !isFuture(parseISO(`${app.date.split('T')[0]}T${app.startTime}`))
    );

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div></div>;

    return (
        <div className="space-y-12 pb-12">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Dashboard</h1>
                <div className="bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Health Status: Good
                </div>
            </motion.div>

            {/* Upcoming Section */}
            <section>
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-teal-700 dark:text-teal-400">
                    <Calendar className="h-5 w-5" />
                    Upcoming Appointments
                </h2>
                {upcomingAppointments.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white dark:bg-gray-800 p-12 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 text-center"
                    >
                        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300 dark:text-gray-500">
                            <Calendar className="h-8 w-8" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-lg">No upcoming appointments scheduled.</p>
                        <button className="mt-4 text-teal-600 dark:text-teal-400 font-semibold hover:underline">Book an appointment now</button>
                    </motion.div>
                ) : (
                    <div className="grid gap-4">
                        <AnimatePresence>
                            {upcomingAppointments.map((app, idx) => (
                                <motion.div
                                    key={app.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-6 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center gap-6 w-full md:w-auto">
                                        <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl flex flex-col items-center justify-center text-white shadow-lg shadow-teal-500/20 flex-shrink-0">
                                            <span className="text-xs font-medium uppercase opacity-80">{format(parseISO(app.date), 'MMM')}</span>
                                            <span className="text-2xl font-bold">{format(parseISO(app.date), 'd')}</span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{app.doctor.name}</h3>
                                            <p className="text-teal-600 dark:text-teal-400 font-medium">{app.doctor.specialization}</p>
                                            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                                <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-lg">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {app.startTime}
                                                </span>
                                                <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-lg">
                                                    {app.type === 'VIDEO' ? <Video className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                                                    {app.type === 'VIDEO' ? 'Video Call' : 'In-Person'}
                                                </span>
                                            </div>
                                            {app.type === 'VIDEO' && app.meetingLink && (
                                                <a
                                                    href={app.meetingLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                                                >
                                                    Join Meeting <ExternalLink className="h-3 w-3" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleCancel(app.id)}
                                        className="w-full md:w-auto px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <XCircle className="h-4 w-4" />
                                        Cancel Appointment
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </section>

            {/* Past Section */}
            <section>
                <h2 className="text-xl font-bold mb-6 text-gray-400 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    History
                </h2>
                <div className="grid gap-4">
                    {pastAppointments.map((app, idx) => (
                        <motion.div
                            key={app.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 + (idx * 0.05) }}
                            className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 flex justify-between items-center opacity-70 hover:opacity-100 transition-opacity"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 border border-gray-100 dark:border-gray-600">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{app.doctor.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {format(parseISO(app.date), 'MMM d, yyyy')} at {app.startTime}
                                    </p>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${app.status === 'CANCELLED' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                }`}>
                                {app.status}
                            </span>
                        </motion.div>
                    ))}
                    {pastAppointments.length === 0 && (
                        <div className="text-gray-400 text-sm italic">No past appointments found.</div>
                    )}
                </div>
            </section>
            <SymptomCheckerWidget />
        </div>
    );
};

export default Dashboard;
