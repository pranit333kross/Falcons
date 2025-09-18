import React, { useState, useEffect } from 'react';
import { getQuizById, saveQuizResult } from '../api/firestore.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import Spinner from '../components/common/Spinner.jsx';
import { CheckCircle, XCircle, ArrowLeft, Trophy } from 'lucide-react';

// --- Quiz Results Component ---
const QuizResults = ({ score, totalQuestions, onRestart, onFinish }) => {
    const percentage = Math.round((score / totalQuestions) * 100);
    let feedbackMessage = '';
    if (percentage === 100) {
        feedbackMessage = "Perfect Score! You're a genius!";
    } else if (percentage >= 75) {
        feedbackMessage = "Great job! You really know your stuff.";
    } else if (percentage >= 50) {
        feedbackMessage = "Good effort! A little more practice will help.";
    } else {
        feedbackMessage = "Keep trying! Reviewing the material will make a big difference.";
    }

    return (
        <div className="max-w-2xl mx-auto text-center bg-white p-8 rounded-2xl shadow-xl">
            {percentage === 100 && (
                <div className="mb-8 p-4 bg-yellow-100 border-2 border-dashed border-yellow-400 rounded-lg">
                    <div className="flex justify-center items-center text-yellow-600">
                        <Trophy className="h-8 w-8 mr-3" />
                        <div className="text-left">
                            <h3 className="font-bold text-lg">Badge Unlocked!</h3>
                            <p className="text-sm">You've earned the "Perfect Score" badge!</p>
                        </div>
                    </div>
                </div>
            )}
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Quiz Complete!</h2>
            <p className="text-slate-600 mb-6">{feedbackMessage}</p>
            <div className="mb-8">
                <div className="text-6xl font-extrabold text-indigo-600">{percentage}%</div>
                <div className="text-lg text-slate-700">You answered <span className="font-bold">{score}</span> out of <span className="font-bold">{totalQuestions}</span> questions correctly.</div>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                    onClick={onRestart}
                    className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    Try Again
                </button>
                <button
                    onClick={onFinish}
                    className="bg-slate-200 text-slate-800 font-bold py-3 px-6 rounded-lg hover:bg-slate-300 transition-colors flex items-center justify-center gap-2"
                >
                    <ArrowLeft className="h-5 w-5" />
                    Back to Subject
                </button>
            </div>
        </div>
    );
};

// --- Main Quiz Page Component ---
const QuizPage = ({ quizId, onFinishQuiz }) => {
    const { user } = useAuth();
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const quizData = await getQuizById(quizId);
                if (!quizData || !quizData.questions || quizData.questions.length === 0) {
                    throw new Error("Quiz data is incomplete or missing questions.");
                }
                setQuiz(quizData);
            } catch (err) {
                setError('Failed to load the quiz. It may not have any questions.');
                console.error(err);
            }
            setLoading(false);
        };
        fetchQuiz();
    }, [quizId]);

    const handleAnswerSelect = (option) => {
        if (isAnswered) return;
        setSelectedAnswer(option);
        setIsAnswered(true);
        if (option === quiz.questions[currentQuestionIndex].answer) {
            setScore(prevScore => prevScore + 1);
        }
    };

    const handleNextQuestion = async () => {
        if (currentQuestionIndex >= quiz.questions.length - 1) {
            if (user && !user.isAnonymous) {
                try {
                    // --- THIS IS THE FIX ---
                    // It now correctly uses the 'score' from the state.
                    await saveQuizResult(user.uid, quizId, score, quiz.questions.length, quiz.title);
                } catch (err) {
                    console.error("Failed to save quiz result:", err);
                }
            }
            setShowResults(true);
        } else {
            setCurrentQuestionIndex(prevIndex => prevIndex + 1);
            setSelectedAnswer(null);
            setIsAnswered(false);
        }
    };

    const restartQuiz = () => {
        setShowResults(false);
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setScore(0);
    };

    if (loading) return <div className="flex justify-center items-center h-64"><Spinner /></div>;
    if (error) return <div className="text-center text-red-500 mt-10">{error}</div>;
    if (!quiz) return <div className="text-center mt-10">Quiz not found.</div>;

    if (showResults) {
        return (
            <QuizResults
                score={score}
                totalQuestions={quiz.questions.length}
                onRestart={restartQuiz}
                onFinish={onFinishQuiz}
            />
        );
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];

    return (
        <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-xl">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">{quiz.title}</h2>
            <div className="mt-2 text-sm text-slate-500 mb-6">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </div>
            <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-6">{currentQuestion.question}</h3>
                <div className="space-y-4">
                    {currentQuestion.options.map(option => {
                        const isSelected = selectedAnswer === option;
                        const isCorrect = option === currentQuestion.answer;
                        let buttonClass = "w-full text-left p-4 rounded-lg border-2 transition-all duration-200 font-medium flex items-center";
                        if (isAnswered) {
                            if (isCorrect) {
                                buttonClass += " bg-green-100 border-green-500 text-green-800";
                            } else if (isSelected) {
                                buttonClass += " bg-red-100 border-red-500 text-red-800";
                            } else {
                                buttonClass += " bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed";
                            }
                        } else {
                            buttonClass += " bg-white border-slate-300 hover:bg-indigo-50 hover:border-indigo-400";
                        }
                        return (
                            <button key={option} onClick={() => handleAnswerSelect(option)} disabled={isAnswered} className={buttonClass}>
                                {isAnswered && (isCorrect ? <CheckCircle className="h-5 w-5 mr-3 text-green-600" /> : isSelected ? <XCircle className="h-5 w-5 mr-3 text-red-600" /> : <div className="h-5 w-5 mr-3"></div>)}
                                {!isAnswered && <div className="h-5 w-5 mr-3"></div>}
                                {option}
                            </button>
                        );
                    })}
                </div>
            </div>
            {isAnswered && (
                <div className="mt-8 text-center">
                    <button onClick={handleNextQuestion} className="bg-indigo-600 text-white font-bold py-3 px-10 rounded-lg hover:bg-indigo-700">
                        {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'Show Results'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default QuizPage;
