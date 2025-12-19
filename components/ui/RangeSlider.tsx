import React from 'react';

interface RangeSliderProps {
    min: number;
    max: number;
    value: [number, number];
    onChange: (value: [number, number]) => void;
    step?: number;
    className?: string;
}

export const RangeSlider: React.FC<RangeSliderProps> = ({ min, max, value, onChange, step = 1, className = '' }) => {
    // Simplistic implementation of a range slider. 
    // For a production app, consider using a library like Radix UI Slider or rc-slider for better dual-thumb support.
    // This is a placeholder for a dual-thumb slider.

    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = Math.min(Number(e.target.value), value[1] - step);
        onChange([newVal, value[1]]);
    };

    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = Math.max(Number(e.target.value), value[0] + step);
        onChange([value[0], newVal]);
    };

    return (
        <div className={`w-full ${className}`}>
            <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>{value[0]}</span>
                <span>{value[1]}</span>
            </div>
            <div className="relative h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                {/* This is a visual approximation, not a fully functional dual slider without creating complex custom event handling or using a library */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value[0]}
                    onChange={handleMinChange}
                    className="absolute w-full h-full opacity-0 cursor-pointer pointer-events-none z-20 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:appearance-none"
                />
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value[1]}
                    onChange={handleMaxChange}
                    className="absolute w-full h-full opacity-0 cursor-pointer pointer-events-none z-20 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:appearance-none"
                />

                {/* Visual track */}
                <div
                    className="absolute h-full bg-blue-600 rounded-full"
                    style={{
                        left: `${((value[0] - min) / (max - min)) * 100}%`,
                        right: `${100 - ((value[1] - min) / (max - min)) * 100}%`
                    }}
                />
            </div>
        </div>
    );
};
