import React from 'react';
import { BrainCircuit, LogIn, UserPlus, LogOut, Edit, User } from 'lucide-react';
// In Header.jsx or any other component
import { useAuth } from '../../contexts/AuthContext.jsx';

const Header = ({ onNavigate, onSignOut }) => {
    // Use the custom hook to get the current user's state
    const { user } = useAuth();

    return (
        <header className="bg-white shadow-sm sticky top-0 z-10">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* App Logo and Title */}
                    <div
                        onClick={() => onNavigate('dashboard')}
                        className="flex items-center cursor-pointer group"
                    >
                        <BrainCircuit className="h-8 w-8 text-indigo-600 group-hover:animate-pulse" />
                        <span className="ml-3 text-2xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                            EduVerse
                        </span>
                    </div>

                    {/* Authentication Buttons */}
                    <div className="flex items-center space-x-2">
                        {/* If the user is logged in (and not an anonymous user) */}
                        {user && !user.isAnonymous ? (
                            <>
                             {user.role === 'instructor' && (
                                    <button
                                        onClick={() => onNavigate('instructorDashboard')}
                                        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
                                    >
                                        <Edit className="h-5 w-5" />
                                        <span className="hidden sm:inline">Instructor</span>
                                    </button>
                                )}
                            <button
                                    onClick={() => onNavigate('profile')}
                                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                >
                                    <User className="h-5 w-5" />
                                    <span className="hidden sm:inline">Profile</span>
                                </button>
                            <button
                                onClick={onSignOut}
                                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                            >
                                <LogOut className="h-5 w-5" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                            </>
                        ) : (
                            /* If the user is not logged in */
                            <>
                                <button
                                    onClick={() => onNavigate('login')}
                                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                >
                                    <LogIn className="h-5 w-5" />
                                    <span>Login</span>
                                </button>
                                <button
                                    onClick={() => onNavigate('signup')}
                                    className="hidden sm:flex items-center space-x-2 px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                                >
                                    <UserPlus className="h-5 w-5" />
                                    <span>Sign Up</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;