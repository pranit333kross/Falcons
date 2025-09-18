import React, { useState } from 'react';
import { signIn } from '../api/auth.jsx';
import Spinner from '../components/common/Spinner.jsx';

const LoginPage = ({ onNavigate }) => {
    // State to manage the email and password input fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // State to manage error messages and the loading indicator
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    /**
     * Handles the form submission event.
     * @param {React.FormEvent} e - The form event.
     */
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent the default browser form submission
        setError(''); // Clear any previous errors
        setLoading(true); // Show the loading spinner

        try {
            // Call the signIn function from our auth API file
            await signIn(email, password);
            onNavigate('dashboard'); // If successful, navigate to the dashboard
        } catch (err) {
            // If an error occurs, display a user-friendly message
            setError('Failed to log in. Please check your credentials.');
            console.error(err); // Log the actual error for debugging
        }
        
        setLoading(false); // Hide the loading spinner
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <div className="bg-white p-8 rounded-xl shadow-md">
                <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">Log In</h2>
                
                {/* Display an error message if the 'error' state is not empty */}
                {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Email</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Password</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 h-10 items-center"
                    >
                        {/* Show the Spinner component when loading, otherwise show text */}
                        {loading ? <Spinner /> : 'Log In'}
                    </button>
                </form>
                
                <p className="mt-4 text-center text-sm text-slate-600">
                    Don't have an account? 
                    <button onClick={() => onNavigate('signup')} className="font-medium text-indigo-600 hover:text-indigo-500 ml-1">
                        Sign up
                    </button>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;