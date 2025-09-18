import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { 
    getCourseById, 
    getQuizzesForCourse, 
    getLecturesForCourse, 
    getAssignmentsForCourse,
    addReviewToCourse,
    getReviewsForCourse
} from '../api/firestore.jsx';
import Spinner from '../components/common/Spinner.jsx';
import { BookOpen, FileText, PlayCircle, ArrowLeft, ChevronRight, Star, Send } from 'lucide-react';

// A small component to render the star rating display
const StarRating = ({ rating }) => (
    <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} className={`h-5 w-5 ${rating >= star ? 'text-yellow-400 fill-current' : 'text-slate-300'}`} />
        ))}
    </div>
);

const SubjectPage = ({ subjectId, onBack, onStartQuiz, onPlayVideo, onSelectAssignment }) => {
    const { user } = useAuth();
    const [course, setCourse] = useState(null);
    const [quizzes, setQuizzes] = useState([]);
    const [lectures, setLectures] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // State for the review form
    const [newReviewText, setNewReviewText] = useState('');
    const [newReviewRating, setNewReviewRating] = useState(0);
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    const fetchAllData = async () => {
        if (!subjectId) {
            setError('No subject selected.');
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const [courseData, quizzesData, lecturesData, assignmentsData, reviewsData] = await Promise.all([
                getCourseById(subjectId),
                getQuizzesForCourse(subjectId),
                getLecturesForCourse(subjectId),
                getAssignmentsForCourse(subjectId),
                getReviewsForCourse(subjectId)
            ]);
            setCourse(courseData);
            setQuizzes(quizzesData);
            setLectures(lecturesData);
            setAssignments(assignmentsData);
            setReviews(reviewsData);
        } catch (err) {
            setError('Failed to load course content.');
            console.error(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAllData();
    }, [subjectId]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (newReviewText.trim() === '' || newReviewRating === 0) {
            alert('Please provide a rating and a review.');
            return;
        }
        setIsSubmittingReview(true);
        try {
            await addReviewToCourse(subjectId, {
                userId: user.uid,
                userEmail: user.email,
                rating: newReviewRating,
                text: newReviewText
            });
            setNewReviewText('');
            setNewReviewRating(0);
            await fetchAllData(); 
        } catch (error) {
            console.error("Failed to submit review:", error);
        }
        setIsSubmittingReview(false);
    };

    const averageRating = reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0;

    if (loading) return <div className="flex justify-center items-center h-64"><Spinner /></div>;
    if (error) return <div className="text-center text-red-500 mt-10">{error}</div>;
    if (!course) return <div className="text-center mt-10">Course not found.</div>;

    return (
        <div>
            <button onClick={onBack} className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 mb-6">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
            </button>
            <h1 className="text-4xl font-bold text-slate-900">{course.title}</h1>
            <div className="flex items-center mt-2">
                <StarRating rating={averageRating} />
                <span className="ml-2 text-slate-600">({reviews.length} reviews)</span>
            </div>
            <p className="text-slate-600 mt-2 text-lg">{course.description}</p>
            
            <div className="mt-10 space-y-8">
                
                {/* --- THIS IS THE CORRECTED PART --- */}
                {/* The missing sections have been added back in. */}
                
                {/* Video Lectures Section */}
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

                {/* Assignments Section */}
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

                {/* Quizzes Section */}
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

                {/* Student Reviews Section */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Student Reviews</h2>
                    
                    {/* Review Submission Form */}
                    {user && !user.isAnonymous && (
                        <form onSubmit={handleReviewSubmit} className="mb-8 p-4 bg-slate-50 rounded-lg">
                           <div className="flex items-center mb-2">
                                <span className="mr-3 font-medium">Your Rating:</span>
                                {[1,2,3,4,5].map(star => (
                                    <Star 
                                        key={star}
                                        className={`h-6 w-6 cursor-pointer ${newReviewRating >= star ? 'text-yellow-400 fill-current' : 'text-slate-300'}`}
                                        onClick={() => setNewReviewRating(star)}
                                    />
                                ))}
                            </div>
                            <textarea
                                value={newReviewText}
                                onChange={(e) => setNewReviewText(e.target.value)}
                                placeholder="Share your thoughts about this course..."
                                className="w-full p-2 border border-slate-300 rounded-md"
                                rows="3"
                            />
                            <button type="submit" disabled={isSubmittingReview} className="mt-2 flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400">
                                {isSubmittingReview ? <Spinner /> : <><Send className="h-4 w-4 mr-2"/>Submit Review</>}
                            </button>
                        </form>
                    )}

                    {/* Display Existing Reviews */}
                    {reviews.length > 0 ? (
                        <ul className="space-y-4">
                            {reviews.map(review => (
                                <li key={review.id} className="p-4 border-b border-slate-100">
                                    <div className="flex items-center mb-1">
                                        <StarRating rating={review.rating} />
                                        <p className="ml-auto text-xs text-slate-500 font-medium">
                                            {review.userEmail ? review.userEmail.split('@')[0] : 'Anonymous'}
                                        </p>
                                    </div>
                                    <p className="text-slate-700">{review.text}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-slate-500">No reviews yet. Be the first to leave one!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubjectPage;