import React, { useState, useEffect } from 'react';
import { getCourseById, getQuizzesForCourse, getLecturesForCourse, getAssignmentsForCourse } from '../api/firestore.jsx';
import Spinner from '../components/common/Spinner.jsx';
import { BookOpen, FileText, PlayCircle, ArrowLeft, ChevronRight } from 'lucide-react';

const SubjectPage = ({ subjectId, onBack, onStartQuiz, onPlayVideo, onSelectAssignment }) => {
    const [course, setCourse] = useState(null);
    const [quizzes, setQuizzes] = useState([]);
    const [lectures, setLectures] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (!subjectId) {
                setError('No subject selected.');
                setLoading(false);
                return;
            }
            try {
                // Fetch all data in parallel for better performance
                const [courseData, quizzesData, lecturesData, assignmentsData] = await Promise.all([
                    getCourseById(subjectId),
                    getQuizzesForCourse(subjectId),
                    getLecturesForCourse(subjectId),
                    getAssignmentsForCourse(subjectId)
                ]);
                setCourse(courseData);
                setQuizzes(quizzesData);
                setLectures(lecturesData);
                setAssignments(assignmentsData);
            } catch (err) {
                setError('Failed to load course content.');
                console.error(err);
            }
            setLoading(false);
        };
        fetchData();
    }, [subjectId]);

    if (loading) {
        return <div className="flex justify-center items-center h-64"><Spinner /></div>;
    }

    if (error) {
        return <div className="text-center text-red-500 mt-10">{error}</div>;
    }

    if (!course) {
        return <div className="text-center mt-10">Course not found.</div>;
    }

    return (
        <div>
            <button onClick={onBack} className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 mb-6">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
            </button>
            <h1 className="text-4xl font-bold text-slate-900">{course.title}</h1>
            <p className="text-slate-600 mt-2 text-lg">{course.description}</p>
            
            <div className="mt-10 space-y-8">
                {/* --- Video Lectures Section --- */}
                {lectures.length > 0 && (
                     <div className="bg-white p-6 rounded-xl shadow-md">
                        <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Video Lectures</h2>
                        <ul className="space-y-3">
                            {lectures.map(lecture => (
                                <li key={lecture.id}>
                                    <button onClick={() => onPlayVideo(lecture)} className="w-full flex items-center p-4 rounded-lg bg-slate-50 hover:bg-indigo-50 transition-colors text-left">
                                        <PlayCircle className="h-6 w-6 text-indigo-500 mr-4 flex-shrink-0" />
                                        <div className="flex-grow">
                                            <h3 className="font-bold text-slate-800">{lecture.title}</h3>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-slate-400" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* --- Assignments Section --- */}
                {assignments.length > 0 && (
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Assignments</h2>
                        <ul className="space-y-3">
                            {assignments.map(assignment => (
                                <li key={assignment.id}>
                                    <button 
                                        onClick={() => onSelectAssignment(assignment.id)}
                                        className="w-full flex items-center p-4 rounded-lg bg-slate-50 hover:bg-indigo-50 transition-colors text-left"
                                    >
                                        <FileText className="h-6 w-6 text-slate-500 mr-4 flex-shrink-0" />
                                        <div className="flex-grow">
                                            <h3 className="font-bold text-slate-800">{assignment.title}</h3>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-slate-400" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* --- Quizzes Section --- */}
                {quizzes.length > 0 && (
                    <div className="bg-white p-6 rounded-xl shadow-md">
                        <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Available Quizzes</h2>
                        <ul className="space-y-3">
                            {quizzes.map(quiz => (
                                <li key={quiz.id}>
                                    <button onClick={() => onStartQuiz(quiz.id)} className="w-full flex items-center p-4 rounded-lg bg-slate-50 hover:bg-indigo-50 transition-colors text-left">
                                        <BookOpen className="h-6 w-6 text-indigo-500 mr-4 flex-shrink-0" />
                                        <div className="flex-grow">
                                            <h3 className="font-bold text-slate-800">{quiz.title}</h3>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-slate-400" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubjectPage;

