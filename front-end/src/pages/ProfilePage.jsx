import React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { getQuizResultsForUser, getSubmissionsForUser } from '../api/firestore.jsx';
import Spinner from '../components/common/Spinner.jsx';
import { Award, Clock, Trophy, FileCheck, Star } from 'lucide-react';

const ProfilePage = () => {
    const { user } = useAuth();
    const [results, setResults] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user && !user.isAnonymous) {
            const fetchData = async () => {
                try {
                    const [userResults, userSubmissions] = await Promise.all([
                        getQuizResultsForUser(user.uid),
                        getSubmissionsForUser(user.uid)
                    ]);
                    setResults(userResults);
                    setSubmissions(userSubmissions);
                } catch (err) {
                    setError('Failed to load profile data.');
                    console.error(err);
                }
                setLoading(false);
            };
            fetchData();
        } else {
            setLoading(false);
        }
    }, [user]);

    if (loading) {
        return <div className="flex justify-center items-center h-64"><Spinner /></div>;
    }
    
    if (error) {
        return <div className="text-center text-red-500 mt-10">{error}</div>;
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-slate-900">My Profile</h1>
                <p className="text-slate-600 mt-2">Welcome back, <span className="font-semibold">{user?.email}</span></p>
            </div>
             <div className="bg-white p-6 rounded-xl shadow-md mb-8">
                <h2 className="text-2xl font-semibold mb-4 border-b pb-2">My Badges</h2>
                {user?.badges && user.badges.length > 0 ? (
                    <div className="flex flex-wrap gap-4">
                        {user.badges.map((badge, index) => (
                            <div key={index} className="flex items-center p-3 bg-yellow-100 rounded-lg border border-yellow-300">
                                <Trophy className="h-8 w-8 text-yellow-500 mr-3" />
                                <div>
                                    <h3 className="font-bold text-yellow-800">{badge.name}</h3>
                                    <p className="text-sm text-yellow-700">Quiz: {badge.quizTitle}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-500 p-4">You haven't earned any badges yet. Keep learning!</p>
                )}
            </div>
            
            {/* --- THIS SECTION IS UPDATED --- */}
            <div className="bg-white p-6 rounded-xl shadow-md mb-8">
                <h2 className="text-2xl font-semibold mb-4 border-b pb-2">My Submissions</h2>
                {submissions.length > 0 ? (
                    <ul className="space-y-4">
                        {submissions.map(sub => (
                            <li key={sub.id} className="p-4 rounded-lg bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                <div className="flex items-center">
                                    <FileCheck className="h-6 w-6 text-green-600 mr-4 flex-shrink-0" />
                                    <div>
                                        <a href={sub.fileURL} target="_blank" rel="noopener noreferrer" className="font-bold text-indigo-600 hover:underline">{sub.fileName}</a>
                                        <p className="text-sm text-slate-500">Submitted on: {sub.submittedAt ? new Date(sub.submittedAt.seconds * 1000).toLocaleDateString() : 'N/A'}</p>
                                    </div>
                                </div>
                                {/* --- NEW: GRADE DISPLAY --- */}
                                <div className="flex items-center mt-2 sm:mt-0">
                                    {sub.grade ? (
                                        <div className="flex items-center bg-green-100 text-green-800 font-semibold px-4 py-2 rounded-full">
                                            <Star className="h-5 w-5 mr-2" />
                                            <span>Grade: {sub.grade}</span>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500">Not graded yet</p>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                   <p className="text-slate-500 p-4">You haven't submitted any assignments yet.</p>
                )}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Quiz History</h2>
                {results.length > 0 ? (
                    <ul className="space-y-4">
                        {results.map(result => (
                            <li key={result.id} className="p-4 rounded-lg bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800">{result.quizTitle}</h3>
                                    <div className="text-sm text-slate-500 flex items-center mt-1">
                                        <Clock className="h-4 w-4 mr-2" />
                                        {result.completedAt ? new Date(result.completedAt.seconds * 1000).toLocaleDateString() : 'Date not available'}
                                    </div>
                                </div>
                                <div className="flex items-center mt-2 sm:mt-0 bg-indigo-100 text-indigo-800 font-semibold px-4 py-2 rounded-full">
                                    <Award className="h-5 w-5 mr-2" />
                                    <span>{result.score} / {result.totalQuestions} ({result.percentage}%)</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-slate-500 p-4">You haven't completed any quizzes yet.</p>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;

