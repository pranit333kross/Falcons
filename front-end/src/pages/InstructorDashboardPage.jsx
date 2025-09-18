import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { uploadVideoAndCreateCourse } from '../api/storage.jsx';
import { createAssignment, getAssignmentsByInstructor } from '../api/firestore.jsx';
import Spinner from '../components/common/Spinner.jsx';
import { FileText, ChevronRight, UploadCloud } from 'lucide-react';

const InstructorDashboardPage = ({onViewSubmissions}) => {
    const { user } = useAuth();
    // State for the video upload form
    const [courseTitle, setCourseTitle] = useState('');
    const [courseDescription, setCourseDescription] = useState('');
    const [videoFile, setVideoFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // --- State for the assignment form ---
    const [assignmentTitle, setAssignmentTitle] = useState('');
    const [assignmentDesc, setAssignmentDesc] = useState('');
    const [assignmentCourseId, setAssignmentCourseId] = useState('');
    const [assignmentLoading, setAssignmentLoading] = useState(false);
    const [assignmentError, setAssignmentError] = useState('');
    const [assignmentSuccess, setAssignmentSuccess] = useState('');
     // --- NEW: State to hold the list of assignments ---
    const [assignments, setAssignments] = useState([]);
    const [loadingAssignments, setLoadingAssignments] = useState(true);
    useEffect(() => {
        if (user) {
            const fetchAssignments = async () => {
                setLoadingAssignments(true);
                try {
                    const myAssignments = await getAssignmentsByInstructor(user.uid);
                    setAssignments(myAssignments);
                } catch (error) {
                    console.error("Failed to fetch assignments:", error);
                }
                setLoadingAssignments(false);
            };
            fetchAssignments();
        }
    }, [user]);

    const handleVideoSubmit = async (e) => {
        e.preventDefault();
        if (!courseTitle || !courseDescription || !videoFile) {
            setError('All fields are required.');
            return;
        }
        setUploading(true);
        setError('');
        setSuccess('');

        try {
            await uploadVideoAndCreateCourse(courseTitle, courseDescription, videoFile, user.uid);
            setSuccess('Course and video uploaded successfully!');
            setCourseTitle('');
            setCourseDescription('');
            setVideoFile(null);
            document.getElementById('video-upload').value = null;
        } catch (err) {
            setError('An error occurred during upload. Please try again.');
            console.error(err);
        }
        setUploading(false);
    };

    // --- Handler for creating an assignment ---
    const handleAssignmentSubmit = async (e) => {
        e.preventDefault();
        if (!assignmentTitle || !assignmentDesc || !assignmentCourseId) {
            setAssignmentError('All fields are required.');
            return;
        }
        setAssignmentLoading(true);
        setAssignmentError('');
        setAssignmentSuccess('');

        try {
            await createAssignment(assignmentCourseId, assignmentTitle, assignmentDesc, user.uid);
            setAssignmentSuccess('Assignment created successfully!');
            setAssignmentTitle('');
            setAssignmentDesc('');
            setAssignmentCourseId('');
        } catch (err) {
            setAssignmentError('Failed to create assignment. Please try again.');
            console.error(err);
        }
        setAssignmentLoading(false);
    };

    return (
        <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-8">Instructor Dashboard</h1>
            {/* --- NEW: List of Created Assignments --- */}
            <div className="bg-white p-8 rounded-xl shadow-md mb-12">
                <h2 className="text-2xl font-semibold mb-6">My Created Assignments</h2>
                {loadingAssignments ? (
                    <div className="flex justify-center"><Spinner /></div>
                ) : assignments.length > 0 ? (
                    <ul className="space-y-4">
                        {assignments.map(assignment => (
                            <li key={assignment.id} className="p-4 rounded-lg bg-slate-50 flex justify-between items-center">
                                <div className="flex items-center">
                                    <FileText className="h-6 w-6 text-slate-500 mr-4" />
                                    <div>
                                        <h3 className="font-bold text-slate-800">{assignment.title}</h3>
                                        <p className="text-sm text-slate-500">Course ID: {assignment.courseId}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => onViewSubmissions(assignment.id)}
                                    className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800"
                                >
                                    View Submissions <ChevronRight className="h-4 w-4 ml-1" />
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-slate-500">You haven't created any assignments yet.</p>
                )}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* --- CARD 1: Video Upload --- */}
                <div className="bg-white p-8 rounded-xl shadow-md">
                    <h2 className="text-2xl font-semibold mb-6">Create Course & Upload Video</h2>
                    <form onSubmit={handleVideoSubmit} className="space-y-6">
                        {/* ... video upload form fields ... */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Course Title</label>
                            <input type="text" value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Course Description</label>
                            <textarea value={courseDescription} onChange={(e) => setCourseDescription(e.target.value)} required rows="3" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm"></textarea>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700">Upload Lecture Video</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
                               <div className="space-y-1 text-center">
                                    <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    <div className="flex text-sm text-slate-600">
                                        <label htmlFor="video-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                                            <span>Upload a file</span>
                                            <input id="video-upload" name="video-upload" type="file" className="sr-only" onChange={(e) => setVideoFile(e.target.files[0])} accept="video/*"/>
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-slate-500">{videoFile ? videoFile.name : 'MP4, WEBM, OGG up to 500MB'}</p>
                               </div>
                            </div>
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        {success && <p className="text-green-500 text-sm">{success}</p>}
                        <button type="submit" disabled={uploading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 h-10 items-center">
                            {uploading ? <Spinner /> : 'Create & Upload'}
                        </button>
                    </form>
                </div>

                {/* --- CARD 2: Create Assignment (NEW) --- */}
                <div className="bg-white p-8 rounded-xl shadow-md">
                    <h2 className="text-2xl font-semibold mb-6">Create New Assignment</h2>
                    <form onSubmit={handleAssignmentSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Assignment Title</label>
                            <input type="text" value={assignmentTitle} onChange={(e) => setAssignmentTitle(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Instructions / Description</label>
                            <textarea value={assignmentDesc} onChange={(e) => setAssignmentDesc(e.target.value)} required rows="4" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm"></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Course ID</label>
                            <input type="text" value={assignmentCourseId} onChange={(e) => setAssignmentCourseId(e.target.value.toLowerCase())} required placeholder="e.g., math, science, history" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm" />
                            <p className="text-xs text-slate-500 mt-1">This must be an existing course ID.</p>
                        </div>
                        
                        {assignmentError && <p className="text-red-500 text-sm">{assignmentError}</p>}
                        {assignmentSuccess && <p className="text-green-500 text-sm">{assignmentSuccess}</p>}

                        <button type="submit" disabled={assignmentLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 h-10 items-center">
                            {assignmentLoading ? <Spinner /> : 'Create Assignment'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default InstructorDashboardPage;

