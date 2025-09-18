import React from 'react';
const VideoPlayerPage = ({ lecture, onBack }) => {
    if (!lecture) {
        return (
            <div className="text-center">
                <p>No video selected.</p>
                <button onClick={onBack} className="mt-4 text-indigo-600">Go Back</button>
            </div>
        );
    }

    return (
        <div>
            <button onClick={onBack} className="mb-6 text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center">
                &larr; Back to Subject
            </button>
            <h1 className="text-3xl font-bold mb-4">{lecture.title}</h1>
            <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
                <video
                    controls
                    src={lecture.videoURL}
                    className="w-full h-full"
                >
                    Your browser does not support the video tag.
                </video>
            </div>
        </div>
    );
};

export default VideoPlayerPage;
