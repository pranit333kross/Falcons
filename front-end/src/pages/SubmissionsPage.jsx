import React, { useState, useEffect } from 'react';
import { getSubmissionsForAssignment, gradeSubmission } from '../api/firestore.jsx';
import Spinner from '../components/common/Spinner.jsx';
import { ArrowLeft, FileCheck, Save } from 'lucide-react';
;


const SubmissionsPage = ({ assignmentId, onBack }) => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [grades, setGrades] = useState({});
    const [saving, setSaving] = useState({});

    useEffect(() => {
        if (assignmentId) {
            const fetchSubmissions = async () => {
                try {
                    const submissionData = await getSubmissionsForAssignment(assignmentId);
                    setSubmissions(submissionData);
                    // Initialize grades state from fetched data
                    const initialGrades = submissionData.reduce((acc, sub) => {
                        acc[sub.id] = sub.grade || '';
                        return acc;
                    }, {});
                    setGrades(initialGrades);
                } catch (err) {
                    setError('Failed to load submissions.');
                    console.error(err);
                }
                setLoading(false);
            };
            fetchSubmissions();
        }
    }, [assignmentId]);

    const handleGradeChange = (submissionId, grade) => {
        setGrades(prev => ({ ...prev, [submissionId]: grade }));
    };

    
    const handleSaveGrade = async (submissionId, studentId) => {
        // --- THIS IS THE FIX ---
        // Add a check to ensure both IDs are valid before proceeding.
        if (!studentId || !submissionId) {
            console.error("Cannot save grade: studentId or submissionId is missing.");
            // Optionally, show an error to the instructor in the UI here.
            return;
        }

        setSaving(prev => ({ ...prev, [submissionId]: true }));
        try {
            const grade = grades[submissionId];
            await gradeSubmission(studentId, submissionId, grade);
        } catch (err) {
            console.error("Failed to save grade:", err);
        }
        setSaving(prev => ({ ...prev, [submissionId]: false }));
    };
    

    if (loading) {
        return <div className="flex justify-center items-center h-64"><Spinner /></div>;
    }

    if (error) {
        return <div className="text-center text-red-500 mt-10">{error}</div>;
    }

    return (
        <div>
            <button onClick={onBack} className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 mb-6">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Instructor Dashboard
            </button>
            <h1 className="text-3xl font-bold text-slate-900 mb-6">Student Submissions</h1>

            <div className="bg-white p-6 rounded-xl shadow-md">
                {submissions.length > 0 ? (
                    <ul className="space-y-4">
                        {submissions.map(sub => (
                            <li key={sub.id} className="p-4 rounded-lg bg-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center">
                                <div className="flex items-center mb-4 md:mb-0">
                                    <FileCheck className="h-8 w-8 text-green-600 mr-4 flex-shrink-0" />
                                    <div>
                                        <a href={sub.fileURL} target="_blank" rel="noopener noreferrer" className="font-bold text-indigo-600 hover:underline">{sub.fileName}</a>
                                        <p className="text-sm text-slate-500">Submitted by: {sub.studentEmail}</p>
                                    </div>
                                </div>
                                <div className="flex items-center w-full md:w-auto">
                                    <input
                                        type="text"
                                        placeholder="Enter grade (e.g., A+)"
                                        value={grades[sub.id] || ''}
                                        onChange={(e) => handleGradeChange(sub.id, e.target.value)}
                                        className="px-3 py-2 border border-slate-300 rounded-md shadow-sm w-full md:w-40"
                                    />
                                    <button
                                        onClick={() => handleSaveGrade(sub.id, sub.userId)}
                                        disabled={saving[sub.id]}
                                        className="ml-3 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400"
                                    >
                                        {saving[sub.id] ? <Spinner /> : <Save className="h-5 w-5" />}
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-slate-500">No submissions have been made for this assignment yet.</p>
                )}
            </div>
        </div>
    );
};

export default SubmissionsPage;
