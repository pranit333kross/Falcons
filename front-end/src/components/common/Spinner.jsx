import React from 'react';

/**
 * A simple loading spinner component.
 * It uses Tailwind CSS classes for animation and styling.
 * This component is meant to be used inside buttons or other
 * elements to indicate a loading state.
 */
const Spinner = () => (
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
);

export default Spinner;