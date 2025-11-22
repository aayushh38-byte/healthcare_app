import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format, addDays, startOfToday } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, CheckCircle, AlertCircle, MapPin, Award, Globe, Star, Video, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DoctorProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [doctor, setDoctor] = useState(null);
    const [slots, setSlots] = useState([]);
    const [selectedDate, setSelectedDate] = useState(startOfToday());
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [apptType, setApptType] = useState('IN_PERSON'); // IN_PERSON, VIDEO
    const [loading, setLoading] = useState(true);
    const [bookingStatus, setBookingStatus] = useState('idle');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        fetchDoctor();
        fetchAvailability();
    }, [id]);

    const fetchDoctor = async () => {
        try {
            const res = await axios.get(`/api/doctors/${id}`);
            setDoctor(res.data);
        } catch (error) {
            console.error('Error fetching doctor:', error);
        }
    };

    const fetchAvailability = async () => {
        const start = format(startOfToday(), 'yyyy-MM-dd');
        const end = format(addDays(startOfToday(), 14), 'yyyy-MM-dd');
        try {
            const res = await axios.get(`/api/doctors/${id}/availability?start=${start}&end=${end}`);
            setSlots(res.data);
        } catch (error) {
            console.error('Error fetching availability:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBook = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (!selectedSlot) return;

        setBookingStatus('booking');
        setErrorMessage('');

        try {
            await axios.post('/api/appointments', {
                doctorId: parseInt(id),
                date: selectedSlot.date,
                startTime: selectedSlot.time,
                type: apptType
            });
            setBookingStatus('success');
            fetchAvailability();
        } catch (error) {
            setBookingStatus('error');
            if (error.response && error.response.status === 409) {
                setErrorMessage('This slot was just booked by someone else. Please choose another.');
                fetchAvailability();
            } else {
                setErrorMessage('Failed to book appointment. Please try again.');
            }
        }
    };

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div></div>;
    if (!doctor) return <div className="text-center py-20 text-gray-500 dark:text-gray-400">Doctor not found</div>;

    const slotsByDate = slots.reduce((acc, slot) => {
        if (!acc[slot.date]) acc[slot.date] = [];
        acc[slot.date].push(slot);
        return acc;
    }, {});

    const dates = [];
    for (let i = 0; i < 14; i++) {
        dates.push(addDays(startOfToday(), i));
    }

    return (
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 pb-12">
            {/* Doctor Info Sidebar */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="md:col-span-1 space-y-6"
            >
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                    <div className="w-32 h-32 bg-gradient-to-br from-teal-100 to-blue-100 dark:from-teal-900 dark:to-blue-900 rounded-full flex items-center justify-center text-4xl font-bold text-teal-700 dark:text-teal-300 mx-auto mb-4 shadow-inner">
                        {doctor.name.charAt(0)}
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{doctor.name}</h1>
                    <p className="text-teal-600 dark:text-teal-400 font-medium mb-4">{doctor.specialization}</p>

                    <div className="flex justify-center gap-2 mb-6">
                        <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/30 px-3 py-1 rounded-full">
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                            <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400">{doctor.averageRating} ({doctor.reviewCount})</span>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-700 pt-6 text-left space-y-4">
                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                            <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"><Award className="h-4 w-4" /></div>
                            <span className="text-sm">MBBS, MD - {doctor.specialization}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                            <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"><Globe className="h-4 w-4" /></div>
                            <span className="text-sm">English, Spanish</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                            <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"><MapPin className="h-4 w-4" /></div>
                            <span className="text-sm">New York Medical Center</span>
                        </div>
                    </div>
                </div>

                <div className="bg-teal-900 dark:bg-teal-800 text-white p-6 rounded-2xl shadow-lg">
                    <h3 className="font-bold mb-2 text-teal-200">Consultation Fee</h3>
                    <div className="text-3xl font-bold">${doctor.fee}</div>
                    <p className="text-teal-200 text-sm mt-1">Per 30 min session</p>
                </div>

                {/* Reviews Preview */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">Patient Reviews</h3>
                    <div className="space-y-4">
                        {doctor.reviews && doctor.reviews.slice(0, 3).map((review, idx) => (
                            <div key={idx} className="border-b border-gray-50 dark:border-gray-700 last:border-0 pb-4 last:pb-0">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-medium text-sm text-gray-900 dark:text-white">{review.user.name}</span>
                                    <div className="flex text-yellow-400">
                                        {[...Array(review.rating)].map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 italic">"{review.comment}"</p>
                            </div>
                        ))}
                        {(!doctor.reviews || doctor.reviews.length === 0) && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No reviews yet.</p>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Booking Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="md:col-span-2"
            >
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-full">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">About Dr. {doctor.name.split(' ')[1]}</h2>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{doctor.bio}</p>
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-700 pt-8">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
                            <Calendar className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                            Select Appointment Time
                        </h2>

                        {bookingStatus === 'success' ? (
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-center py-12 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-800"
                            >
                                <div className="w-20 h-20 bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                    <CheckCircle className="h-10 w-10" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Booking Confirmed!</h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">Your appointment has been scheduled successfully.</p>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="bg-teal-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-teal-700 transition shadow-lg shadow-teal-500/30"
                                >
                                    Go to Dashboard
                                </button>
                            </motion.div>
                        ) : (
                            <>
                                {/* Appointment Type Selection */}
                                <div className="flex gap-4 mb-8">
                                    <button
                                        onClick={() => setApptType('IN_PERSON')}
                                        className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${apptType === 'IN_PERSON'
                                                ? 'bg-teal-50 dark:bg-teal-900/30 border-teal-500 text-teal-700 dark:text-teal-300 ring-1 ring-teal-500'
                                                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-teal-300'
                                            }`}
                                    >
                                        <User className="h-5 w-5" />
                                        <span className="font-medium">In-Clinic Visit</span>
                                    </button>
                                    <button
                                        onClick={() => setApptType('VIDEO')}
                                        className={`flex-1 py-3 px-4 rounded-xl border flex items-center justify-center gap-2 transition-all ${apptType === 'VIDEO'
                                                ? 'bg-teal-50 dark:bg-teal-900/30 border-teal-500 text-teal-700 dark:text-teal-300 ring-1 ring-teal-500'
                                                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-teal-300'
                                            }`}
                                    >
                                        <Video className="h-5 w-5" />
                                        <span className="font-medium">Video Consult</span>
                                    </button>
                                </div>

                                {/* Date Selection */}
                                <div className="mb-8 overflow-x-auto pb-4 scrollbar-hide">
                                    <div className="flex gap-3 min-w-max">
                                        {dates.map(date => {
                                            const dateStr = format(date, 'yyyy-MM-dd');
                                            const isSelected = format(selectedDate, 'yyyy-MM-dd') === dateStr;
                                            const hasSlots = slotsByDate[dateStr]?.length > 0;

                                            return (
                                                <motion.button
                                                    key={dateStr}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => {
                                                        setSelectedDate(date);
                                                        setSelectedSlot(null);
                                                    }}
                                                    className={`
                            flex flex-col items-center justify-center w-20 h-24 rounded-2xl border transition-all duration-200
                            ${isSelected
                                                            ? 'bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-500/30'
                                                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-teal-300'}
                            ${!hasSlots && !isSelected && 'opacity-40 bg-gray-50 dark:bg-gray-800 cursor-not-allowed'}
                          `}
                                                >
                                                    <span className="text-xs font-medium uppercase opacity-80">{format(date, 'EEE')}</span>
                                                    <span className="text-2xl font-bold">{format(date, 'd')}</span>
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Time Slots */}
                                <div className="mb-8">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                                        {format(selectedDate, 'EEEE, MMMM do')}
                                    </h3>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                                        <AnimatePresence mode='wait'>
                                            {slotsByDate[format(selectedDate, 'yyyy-MM-dd')]?.map((slot, idx) => (
                                                <motion.button
                                                    key={`${slot.date}-${slot.time}`}
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    onClick={() => setSelectedSlot(slot)}
                                                    className={`
                            py-3 px-2 rounded-xl text-sm font-bold border transition-all
                            ${selectedSlot === slot
                                                            ? 'bg-teal-600 text-white border-teal-600 ring-2 ring-teal-200'
                                                            : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-teal-400 hover:text-teal-600'}
                          `}
                                                >
                                                    {slot.time}
                                                </motion.button>
                                            ))}
                                        </AnimatePresence>
                                        {(!slotsByDate[format(selectedDate, 'yyyy-MM-dd')] || slotsByDate[format(selectedDate, 'yyyy-MM-dd')].length === 0) && (
                                            <div className="col-span-full text-center py-8 text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                                No slots available for this date.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Error Message */}
                                <AnimatePresence>
                                    {errorMessage && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mb-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-3 border border-red-100 dark:border-red-800"
                                        >
                                            <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                            {errorMessage}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Confirm Button */}
                                <div className="border-t border-gray-100 dark:border-gray-700 pt-6 flex justify-end">
                                    <button
                                        onClick={handleBook}
                                        disabled={!selectedSlot || bookingStatus === 'booking'}
                                        className={`
                      px-10 py-4 rounded-xl font-bold text-white transition-all duration-300 flex items-center gap-2
                      ${!selectedSlot || bookingStatus === 'booking'
                                                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                                                : 'bg-teal-600 hover:bg-teal-700 shadow-xl shadow-teal-500/30 hover:-translate-y-1'}
                    `}
                                    >
                                        {bookingStatus === 'booking' ? (
                                            <>Processing...</>
                                        ) : (
                                            <>Confirm Booking <CheckCircle className="h-5 w-5" /></>
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default DoctorProfile;
