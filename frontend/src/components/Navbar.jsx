import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Stethoscope, User, LogOut, Menu, X, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = React.useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-20">
                    <Link to="/" className="flex items-center space-x-2 group">
                        <motion.div
                            whileHover={{ rotate: 15 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <Stethoscope className="h-8 w-8 text-teal-600 dark:text-teal-400" />
                        </motion.div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 dark:from-teal-400 dark:to-blue-400 bg-clip-text text-transparent">
                            HealthBook
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link
                            to="/"
                            className={`text-sm font-medium transition-colors hover:text-teal-600 dark:hover:text-teal-400 ${isActive('/') ? 'text-teal-600 dark:text-teal-400' : 'text-gray-600 dark:text-gray-300'}`}
                        >
                            Find Doctors
                        </Link>

                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300"
                        >
                            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </button>

                        {user ? (
                            <>
                                <Link
                                    to="/dashboard"
                                    className={`text-sm font-medium transition-colors hover:text-teal-600 dark:hover:text-teal-400 ${isActive('/dashboard') ? 'text-teal-600 dark:text-teal-400' : 'text-gray-600 dark:text-gray-300'}`}
                                >
                                    Dashboard
                                </Link>

                                <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>

                                <div className="flex items-center space-x-3">
                                    <div className="flex items-center space-x-2 bg-teal-50 dark:bg-teal-900/30 px-3 py-1.5 rounded-full">
                                        <User className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                                        <span className="text-sm font-medium text-teal-800 dark:text-teal-200">{user.name || 'Patient'}</span>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleLogout}
                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                        title="Logout"
                                    >
                                        <LogOut className="h-5 w-5" />
                                    </motion.button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link to="/login" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                                    Login
                                </Link>
                                <Link to="/register">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="bg-teal-600 text-white px-5 py-2.5 rounded-full text-sm font-medium shadow-lg shadow-teal-500/30 hover:bg-teal-700 transition-colors"
                                    >
                                        Register Now
                                    </motion.button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300"
                        >
                            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </button>
                        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 dark:text-gray-300">
                            {isOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800"
                    >
                        <div className="px-4 py-4 space-y-4">
                            <Link to="/" className="block text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400">Find Doctors</Link>
                            {user ? (
                                <>
                                    <Link to="/dashboard" className="block text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400">Dashboard</Link>
                                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</span>
                                            <button onClick={handleLogout} className="text-red-500 text-sm">Logout</button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
                                    <Link to="/login" className="block text-gray-600 dark:text-gray-300">Login</Link>
                                    <Link to="/register" className="block text-center bg-teal-600 text-white py-2 rounded-lg">Register</Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
