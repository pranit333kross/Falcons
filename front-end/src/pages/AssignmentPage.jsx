import React, { useState, useEffect } from 'react';
import { getAssignmentById, createSubmission } from '../api/firestore.jsx';
import { uploadSubmissionFile } from '../api/storage.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import Spinner from '../components/common/Spinner.jsx';
import { ArrowLeft, UploadCloud } from 'lucide-react';

const AssignmentPage = ({ assignmentId, onBack }) => {
    const { user } = useAuth();
    const [assignment, setAssignment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [submissionFile, setSubmissionFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState('');

    useEffect(() => {
        if (!assignmentId) return;
        const fetchAssignment = async () => {
            try {
                const data = await getAssignmentById(assignmentId);
                setAssignment(data);
            } catch (err) {
                setError('Failed to load assignment details.');
                console.error(err);
            }
            setLoading(false);
        };
        fetchAssignment();
    }, [assignmentId]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSubmissionFile(file);
            setSubmitError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!submissionFile) {
            setSubmitError('please select a file  to submit');
            return;
        }
        setSubmitting(true);
        setSubmitError('');
        setSubmitSuccess('');

        try {
            const fileURL = await uploadSubmissionFile(submissionFile, assignmentId, user.uid);
            
            // --- THIS IS THE FIX ---
            // The user.email is now correctly passed to the function.
            await createSubmission(user.uid, user.email, assignmentId, fileURL, submissionFile.name);

            setSubmitSuccess('Assignment submitted successfully!');
            setSubmissionFile(null);
            document.getElementById('submission-upload').value = null;

        } catch (err) {
            setSubmitError('we are sorry,there was an error submitting an assignment.Please try again');
            console.error(err);
        }
        setSubmitting(false);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64"><Spinner /></div>;
    }

    if (error) {
        return <div className="text-center text-red-500 mt-10">{error}</div>;
    }

    if (!assignment) {
        return <div className="text-center mt-10">Assignment not found.</div>;
    }

    return (
        <div>
            <button onClick={onBack} className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 mb-6">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Subject
            </button>

            <div className="bg-white p-8 rounded-xl shadow-md">
                <h1 className="text-3xl font-bold text-slate-900">{assignment.title}</h1>
                <p className="text-sm text-slate-500 mt-2">
                    Posted on: {assignment.createdAt ? new Date(assignment.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                </p>
                <hr className="my-6" />
                <div className="prose max-w-none">
                    <p>{assignment.description}</p>
                </div>
            </div>

            <div className="mt-8 bg-white p-8 rounded-xl shadow-md">
                <h2 className="text-2xl font-semibold mb-4">Submit Your Work</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Upload File</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
                           <div className="space-y-1 text-center">
                                <UploadCloud className="mx-auto h-12 w-12 text-slate-400" />
                                <div className="flex text-sm text-slate-600">
                                    <label htmlFor="submission-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                                        <span>Select a file</span>
                                        <input id="submission-upload" name="submission-upload" type="file" className="sr-only" onChange={handleFileChange} />
                                    </label>
                                </div>
                                <p className="text-xs text-slate-500">{submissionFile ? submissionFile.name : 'PDF, DOCX, PNG, JPG, etc.'}</p>
                           </div>
                        </div>
                    </div>
                    
                    {submitError && <p className="text-red-500 text-sm">{submitError}</p>}
                    {submitSuccess && <p className="text-green-500 text-sm">{submitSuccess}</p>}

                    <button type="submit" disabled={submitting} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400">
                        {submitting ? <Spinner /> : 'Submit Assignment'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AssignmentPage;

