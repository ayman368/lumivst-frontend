import React, { useState } from 'react';

interface TooltipProps {
    content: string;
    children: React.ReactElement; // Ensure children is a single React Element
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible && (
                <div className="absolute z-10 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm opacity-100 tooltip dark:bg-gray-700 -top-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    {content}
                    <div className="tooltip-arrow" data-popper-arrow></div>
                </div>
            )}
        </div>
    );
};
