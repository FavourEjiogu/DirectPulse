import { SeverityLevel } from '../types';

/**
 * Returns Tailwind CSS classes for a given severity level.
 * @param level - The severity level ('High', 'Medium', 'Low')
 * @returns A string containing Tailwind CSS classes for background and text color.
 */
export const getSeverityColor = (level: SeverityLevel): string => {
    switch(level) {
        case 'High': return 'bg-red-500 text-white';
        case 'Medium': return 'bg-orange-400 text-white';
        case 'Low': return 'bg-green-500 text-white';
        default: return 'bg-gray-400';
    }
};
