
import React from 'react';

interface SectionNavigationProps {
  sections: Array<{
    id: string;
    label: string;
  }>;
}

const SectionNavigation: React.FC<SectionNavigationProps> = ({ sections }) => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-4">
      <nav className="flex flex-wrap justify-center gap-3">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            className="bg-brand-gray-purple text-white px-4 py-2 rounded-lg hover:bg-brand-gray-purple/80 transition-colors text-sm font-medium"
          >
            {section.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default SectionNavigation;
