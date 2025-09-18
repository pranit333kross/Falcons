import React, { useState, useEffect } from 'react';
import { getSubmissionsForAssignment, gradeSubmission } from '../api/firestore.jsx';
import Spinner from '../components/common/Spinner.jsx';
import { ArrowLeft, FileCheck, Save, CheckCircle2, AlertCircle } from 'lucide-react';

const SubmissionsPage = ({ assignmentId, onBack }) => {
const [submissions, setSubmissions] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');
const [grades, setGrades] = useState({});
const [saving, setSaving] = useState({});
const [message, setMessage] = useState('');
const [search, setSearch] = useState('');
const [sortBy, setSortBy] = useState('date');

useEffect(() => {
    if (assignmentId) {
    const fetchSubmissions = async () => {
        try {
        const submissionData = await getSubmissionsForAssignment(assignmentId);
        setSubmissions(submissionData);
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
    setGrades((prev) => ({ ...prev, [submissionId]: grade }));
};

const handleSaveGrade = async (submissionId, studentId) => {
    if (!studentId || !submissionId) {
    console.error('Cannot save grade: id is missing.');
    return;
    }
    setSaving((prev) => ({ ...prev, [submissionId]: true }));
    try {
    const grade = grades[submissionId];
    await gradeSubmission(studentId, submissionId, grade);
    setMessage('✅ Grade saved successfully!');
    } catch (err) {
    console.error('Failed to save grade:', err);
    setMessage('❌ Failed to save grade.');
    }
    setSaving((prev) => ({ ...prev, [submissionId]: false }));
    setTimeout(() => setMessage(''), 3000);
};

const handleBulkSave = async () => {
    for (const sub of submissions) {
    if (grades[sub.id] !== sub.grade) {
        await handleSaveGrade(sub.id, sub.userId);
    }
    }
};

const filteredSubmissions = submissions
    .filter(
    (sub) =>
        sub.studentEmail.toLowerCase().includes(search.toLowerCase()) ||
        sub.fileName.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
    if (sortBy === 'email') return a.studentEmail.localeCompare(b.studentEmail);
    if (sortBy === 'grade') return (grades[a.id] || '').localeCompare(grades[b.id] || '');
      return new Date(b.submittedAt) - new Date(a.submittedAt); // default: newest first
    });

if (loading) {
    return (
    <div className="flex justify-center items-center h-64">
        <Spinner />
    </div>
    );
}

if (error) {
    return <div className="text-center text-red-500 mt-10">{error}</div>;
}

return (
    <div>
    <button
        onClick={onBack}
        className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 mb-6"
    >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Instructor Dashboard
    </button>

    <h1 className="text-3xl font-bold text-slate-900 mb-4">Student Submissions</h1>

      {/* Search + Sort Controls */}
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 space-y-2 md:space-y-0">
        <input
    type="text"
    placeholder="Search by student or file..."
    value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="px-3 py-2 border border-slate-300 rounded-md shadow-sm w-full md:w-1/3"
        />
        <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="px-3 py-2 border border-slate-300 rounded-md shadow-sm"
        >
        <option value="date">Sort by Date</option>
        <option value="email">Sort by Email</option>
        <option value="grade">Sort by Grade</option>
        </select>
    </div>

      {/* Bulk Save Button */}
    {submissions.length > 0 && (
        <button
        onClick={handleBulkSave}
        className="mb-4 px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700"
        >
        Save All Grades
        </button>
    )}

      {/* Status Message */}
    {message && (
        <div
        className={`mb-4 flex items-center gap-2 p-2 rounded-lg ${
            message.startsWith('✅')
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
        }`}
        >
        {message.startsWith('✅') ? (
            <CheckCircle2 className="h-5 w-5" />
        ) : (
            <AlertCircle className="h-5 w-5" />
        )}
        {message}
        </div>
    )}

    <div className="bg-white p-6 rounded-xl shadow-md">
        {filteredSubmissions.length > 0 ? (
        <ul className="space-y-4">
            {filteredSubmissions.map((sub) => (
            <li
                key={sub.id}
                className="p-4 rounded-lg bg-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center"
            >
                <div className="flex items-center mb-4 md:mb-0">
                <FileCheck className="h-8 w-8 text-green-600 mr-4 flex-shrink-0" />
                <div>
                    <a
                    href={sub.fileURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-indigo-600 hover:underline"
                    >
                    {sub.fileName}
                    </a>
                    <p className="text-sm text-slate-500">
                    Submitted by: {sub.studentEmail}
                    </p>
                    {grades[sub.id] ? (
                    <span className="inline-block mt-1 px-2 py-1 text-xs rounded-md bg-green-200 text-green-800">
                        Graded
                    </span>
                    ) : (
                    <span className="inline-block mt-1 px-2 py-1 text-xs rounded-md bg-yellow-200 text-yellow-800">
                        Pending
                    </span>
                    )}
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
        <p className="text-slate-500">
            No submissions match your search or filters.
        </p>
        )}
    </div>
    </div>
);
};

export default SubmissionsPage;
