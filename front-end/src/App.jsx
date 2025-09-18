import React, { useState, useEffect } from 'react';
import { seedDatabase } from './api/firestore.jsx';
import { signOut } from './api/auth.jsx';
import Header from './components/layout/Header.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import SubjectPage from './pages/SubjectPage.jsx';
import QuizPage from './pages/QuizPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import InstructorDashboardPage from './pages/InstructorDashboardPage.jsx';
import VideoPlayerPage from './pages/VideoPlayerPage.jsx';
import AssignmentPage from './pages/AssignmentPage.jsx';
import SubmissionsPage from './pages/Submissionspage.jsx';
// filepath: c:\Ed tech App\front-end\src\App.jsx

// filepath: c:\Ed tech App\front-end\src\App.jsx

const App = () => {
    const [page, setPage] = useState('dashboard');
    const [selectedSubjectId, setSelectedSubjectId] = useState(null);
    const [selectedQuizId, setSelectedQuizId] = useState(null);
    const [selectedLecture, setSelectedLecture] = useState(null);
     const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);

    useEffect(() => {
        seedDatabase();
    }, []);
     const handleSelectAssignment = (assignmentId) => {
        setSelectedAssignmentId(assignmentId);
        setPage('assignment');
    };

    const handleSignOut = async () => {
        try {
            await signOut();
            setPage('dashboard');
            setSelectedSubjectId(null);
        } catch (error) {
            console.error("Sign out error", error);
        }
    };

    const handleSelectCourse = (subjectId) => {
        setSelectedSubjectId(subjectId);
        setPage('subject');
    };

    const handleBackToDashboard = () => {
        setSelectedSubjectId(null);
        setPage('dashboard');
    };
    const handleStartQuiz = (quizId) => {
        setSelectedQuizId(quizId);
        setPage('quiz');
    };
     const handleFinishQuiz = () => {
        setSelectedQuizId(null);
        setPage('subject'); // Go back to the subject page
    };
    const handlePlayVideo = (lecture) => {
        setSelectedLecture(lecture);
        setPage('videoPlayer');
    };
    const handleViewSubmissions = (assignmentId) => {
        setSelectedAssignmentId(assignmentId);
        setPage('submissions');
    };
    const renderContent = () => {
        switch (page) {
            case 'login':
                return <LoginPage onNavigate={setPage} />;
            case 'signup':
                return <SignUpPage onNavigate={setPage} />;
            case 'subject':
                // This line has been corrected
                return <SubjectPage subjectId={selectedSubjectId} onBack={handleBackToDashboard} onStartQuiz={handleStartQuiz} onPlayVideo={handlePlayVideo} onSelectAssignment={handleSelectAssignment} />;
            case 'quiz':
                return <QuizPage quizId={selectedQuizId} onFinishQuiz={handleFinishQuiz} />;
            case 'profile':
                 return <ProfilePage />;
             case 'instructorDashboard':
                return <InstructorDashboardPage onViewSubmissions={handleViewSubmissions} />;
             case 'videoPlayer':
                return <VideoPlayerPage lecture={selectedLecture} onBack={() => setPage('subject')} />;
             case 'assignment':
                return <AssignmentPage assignmentId={selectedAssignmentId} onBack={() => setPage('subject')} />;  
             case 'submissions':
                return <SubmissionsPage assignmentId={selectedAssignmentId} onBack={() => setPage('instructorDashboard')} />;   
            default:
                return <DashboardPage onSelectCourse={handleSelectCourse} />;
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen font-sans text-slate-800">
            <Header onNavigate={setPage} onSignOut={handleSignOut} />
            <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
                {renderContent()}
            </main>
        </div>
    );
};

export default App;
