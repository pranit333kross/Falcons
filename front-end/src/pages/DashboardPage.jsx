import React, { useState, useEffect } from 'react';
import { getCourses } from '../api/firestore.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import Spinner from '../components/common/Spinner.jsx';
import CourseCard from '../components/dashboard/CourseCard.jsx';
import { Search } from 'lucide-react'; // Import search icon

const DashboardPage = ({ onSelectCourse }) => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState(''); // State for the search query

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const courseData = await getCourses();
                setCourses(courseData);
            } catch (err) {
                setError('Failed to load courses.');
                console.error(err);
            }
            setLoading(false);
        };
        fetchCourses();
    }, []);

    // Filter courses based on the search term
    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="flex justify-center items-center h-64"><Spinner /></div>;
    }

    if (error) {
        return <div className="text-center text-red-500 mt-10">{error}</div>;
    }

    return (
        <div>
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-2">
                    Welcome {user && !user.isAnonymous && user.email ? user.email.split('@')[0] : 'to Your Learning Journey'}!
                </h1>
                <p className="text-lg text-slate-600 max-w-3xl mx-auto">Select a subject to begin exploring interactive lessons and quizzes.</p>
            </div>

            {/* --- NEW SEARCH BAR --- */}
            <div className="mb-10 max-w-lg mx-auto">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search for a course..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <Search className="h-6 w-6 text-slate-400" />
                    </div>
                </div>
            </div>

            {/* --- DISPLAY FILTERED COURSES --- */}
            {filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   {filteredCourses.map((course, index) => (
                        <CourseCard
                            key={course.id}
                            course={course}
                            onSelect={() => onSelectCourse(course.id)}
                            index={index} // Pass the index for the animation
                        />
                   
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 bg-slate-100 rounded-lg">
                    <h3 className="text-xl font-semibold text-slate-700">No courses found</h3>
                    <p className="text-slate-500 mt-2">Try adjusting your search term.</p>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
