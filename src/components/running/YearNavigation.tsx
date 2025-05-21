
import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface YearNavigationProps {
  year: number;
  onPrevYear: () => void;
  onNextYear: () => void;
}

/**
 * Component for navigating between years
 */
const YearNavigation: React.FC<YearNavigationProps> = ({
  year,
  onPrevYear,
  onNextYear
}) => {
  return (
    <div className="flex items-center gap-2 bg-gray-50 rounded-md p-1">
      <button 
        onClick={onPrevYear}
        className="p-1.5 hover:bg-gray-200 rounded transition-colors"
        aria-label="Año anterior"
      >
        <ArrowDown className="h-4 w-4 text-gray-600" />
      </button>
      <span className="font-medium text-sm px-2">{year}</span>
      <button 
        onClick={onNextYear}
        className="p-1.5 hover:bg-gray-200 rounded transition-colors"
        aria-label="Año siguiente"
      >
        <ArrowUp className="h-4 w-4 text-gray-600" />
      </button>
    </div>
  );
};

export default YearNavigation;
