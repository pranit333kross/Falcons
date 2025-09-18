import React, { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';

const CourseCard = ({ course, onSelect, index }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger the animation after a delay based on the card's index
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, index * 100); // 100ms delay per card

        return () => clearTimeout(timer);
    }, [index]);

    return (
        <div
            onClick={onSelect}
            // The animation is controlled by these transition and opacity/transform classes
            className={`bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 cursor-pointer group ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}
        >
            <div className="p-6 bg-indigo-500 flex items-center justify-center h-32">
                <BookOpen className="h-16 w-16 text-white group-hover:scale-110 transition-transform" />
            </div>
            <div className="p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-2">{course.title}</h3>
                <p className="text-slate-600 text-sm">{course.description}</p>
            </div>
        </div>
    );
};

export default CourseCard;
