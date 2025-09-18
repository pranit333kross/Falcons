import React, { useState } from 'react';
import { signUp } from '../api/auth.jsx';
import Spinner from '../components/common/Spinner.jsx';

const SignUpPage = ({ onNavigate }) => {
    // State to manage the email and password input fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isInstructor, setIsInstructor] = useState(false);

    // State to manage error messages and the loading indicator
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);


    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent the default browser form submission
        setError(''); // Clear any previous errors
        setLoading(true); // Show the loading spinner

        // Basic validation: ensure the password is at least 6 characters long
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            setLoading(false);
            return; // Stop the function if validation fails
        }
        try {
            // Determine the role based on the checkbox state
            const role = isInstructor ? 'instructor' : 'student';
            await signUp(email, password, role); // Pass the role to the signUp function
            onNavigate('dashboard');
        } catch (err) {
            setError('Failed to create an account. The email might already be in use.');
            console.error(err);
        }
        setLoading(false);
    };
    
    return (
        <div className="max-w-md mx-auto mt-10">
            <div className="bg-white p-8 rounded-xl shadow-md">
                <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">Create an Account</h2>

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
                     <div className="flex items-center">
                        <input
                            id="is-instructor"
                            type="checkbox"
                            checked={isInstructor}
                            onChange={(e) => setIsInstructor(e.target.checked)}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <label htmlFor="is-instructor" className="ml-2 block text-sm text-slate-900">
                            Sign up as an instructor
                        </label>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 h-10 items-center"
                    >
                        {/* Show the Spinner component when loading, otherwise show text */}
                        {loading ? <Spinner /> : 'Sign Up'}
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-slate-600">
                    Already have an account?
                    <button onClick={() => onNavigate('login')} className="font-medium text-indigo-600 hover:text-indigo-500 ml-1">
                        Log in
                    </button>
                </p>
            </div>
        </div>
    );
};

export default SignUpPage;