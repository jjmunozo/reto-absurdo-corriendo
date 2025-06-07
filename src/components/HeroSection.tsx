
import React from 'react';

interface HeroSectionProps {
  lastSync?: Date | null;
}

const HeroSection: React.FC<HeroSectionProps> = ({ lastSync }) => {
  return (
    <header className="bg-gradient-to-r from-running-primary to-running-dark text-white py-12 px-4 md:px-8">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">El reto más absurdo</h1>
            <div className="flex flex-col gap-3">
              <p className="text-lg opacity-90">
                Datos de carreras conectadas a Strava de
              </p>
              
              {/* Strava Connection Box */}
              <div className="inline-flex items-center gap-3 bg-orange-500 text-white px-4 py-2 rounded-lg w-fit">
                <div className="bg-white p-1 rounded">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.599h4.172L10.463 0l-7 13.828h4.172" fill="#FC4C02"/>
                  </svg>
                </div>
                <span className="font-semibold">Juan J. Muñoz O.</span>
              </div>
              
              {lastSync && (
                <span className="text-sm opacity-80">
                  Última actualización: {lastSync.toLocaleString('es-ES')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeroSection;
