import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Search, Star, ArrowRight, Heart, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import Skeleton from '../components/Skeleton';
import SymptomCheckerWidget from '../components/SymptomCheckerWidget';

const Home = () => {
    const [doctors, setDoctors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState(() => {
        const saved = localStorage.getItem('favorites');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async (search = '') => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/doctors?search=${search}`);
            setDoctors(res.data);
        } catch (error) {
            console.error('Error fetching doctors:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchDoctors(searchTerm);
    };

    const toggleFavorite = (id) => {
        let newFavs;
        if (favorites.includes(id)) {
            newFavs = favorites.filter(favId => favId !== id);
        } else {
            newFavs = [...favorites, id];
        }
        setFavorites(newFavs);
        localStorage.setItem('favorites', JSON.stringify(newFavs));
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="space-y-12 pb-12">
            {/* Hero Section */}
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-900 to-blue-900 text-white py-20 px-6 md:px-12 shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/medical-icons.png')]"></div>

                <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="bg-teal-500/20 text-teal-200 px-4 py-1.5 rounded-full text-sm font-medium border border-teal-500/30">
                            Simplified Healthcare
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-4xl md:text-6xl font-bold leading-tight"
                    >
                        Find Your Perfect <br />
                        <span className="text-teal-400">Doctor Today</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg text-teal-100 max-w-2xl mx-auto"
                    >
                        Book appointments with top specialists in your area. Simple, fast, and secure.
                    </motion.p>

                    <motion.form
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        onSubmit={handleSearch}
                        className="max-w-2xl mx-auto flex gap-2 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20"
                    >
                        <div className="relative flex-grow">
                            <Search className="absolute left-4 top-3.5 text-teal-200 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Search doctors, specializations..."
                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-transparent text-white placeholder-teal-200/70 focus:outline-none focus:ring-2 focus:ring-teal-400/50"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-teal-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-teal-400 transition shadow-lg shadow-teal-500/30"
                        >
                            Search
                        </button>
                    </motion.form>
                </div>
            </section>

            {/* Doctors List */}
            <section className="container mx-auto px-4">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Top Doctors</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Highly qualified professionals ready to help</p>
                    </div>
                </div>

                {loading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <div className="flex gap-4 mb-4">
                                    <Skeleton className="w-12 h-12 rounded-full" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-5 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                </div>
                                <Skeleton className="h-4 w-full mb-2" />
                                <Skeleton className="h-4 w-2/3 mb-6" />
                                <div className="flex justify-between">
                                    <Skeleton className="h-6 w-16" />
                                    <Skeleton className="h-6 w-24" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {doctors.map(doctor => (
                            <motion.div
                                key={doctor.id}
                                variants={item}
                                className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group relative"
                            >
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        toggleFavorite(doctor.id);
                                    }}
                                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10"
                                >
                                    <Heart
                                        className={`h-5 w-5 transition-colors ${favorites.includes(doctor.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                                    />
                                </button>

                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-blue-100 dark:from-teal-900 dark:to-blue-900 rounded-full flex items-center justify-center text-xl font-bold text-teal-700 dark:text-teal-300">
                                            {doctor.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{doctor.name}</h3>
                                            <p className="text-teal-600 dark:text-teal-400 font-medium text-sm">{doctor.specialization}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 mb-4">
                                    <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/30 px-2 py-1 rounded-lg">
                                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                        <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400">{doctor.averageRating || 'New'}</span>
                                    </div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">({doctor.reviewCount || 0} reviews)</span>
                                </div>

                                <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 line-clamp-2 h-10">{doctor.bio}</p>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-700">
                                    <div>
                                        <span className="text-gray-900 dark:text-white font-bold block">${doctor.fee} <span className="text-gray-400 font-normal text-xs">/ visit</span></span>
                                        {doctor.nextAvailableSlot && (
                                            <span className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center gap-1 mt-1">
                                                <Clock className="h-3 w-3" />
                                                Next: {doctor.nextAvailableSlot}
                                            </span>
                                        )}
                                    </div>
                                    <Link
                                        to={`/doctors/${doctor.id}`}
                                        className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-semibold text-sm hover:gap-3 transition-all"
                                    >
                                        Book Now <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
                {!loading && doctors.length === 0 && (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-12 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                        No doctors found matching your search.
                    </div>
                )}
            </section>
            <SymptomCheckerWidget />
        </div>
    );
};

export default Home;
