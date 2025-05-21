
import React from 'react';

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
    <div className="flex items-center gap-2">
      <button 
        onClick={onPrevYear}
        className="p-2 hover:bg-gray-100 rounded"
        aria-label="Año anterior"
      >
        &lt;
      </button>
      <span className="font-medium">{year}</span>
      <button 
        onClick={onNextYear}
        className="p-2 hover:bg-gray-100 rounded"
        aria-label="Año siguiente"
      >
        &gt;
      </button>
    </div>
  );
};

export default YearNavigation;
