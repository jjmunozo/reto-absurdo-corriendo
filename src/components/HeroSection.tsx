
import React, { useState } from 'react';

interface HeroSectionProps {
  lastSync?: Date | null;
}

const HeroSection: React.FC<HeroSectionProps> = ({ lastSync }) => {
  const [logoError, setLogoError] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);

  const handleStravaProfileClick = () => {
    window.open('https://strava.app.link/O4InfygyZTb', '_blank');
  };

  const handleLogoLoad = () => {
    console.log('Logo cargado correctamente');
    setLogoLoaded(true);
    setLogoError(false);
  };

  const handleLogoError = () => {
    console.error('Error al cargar el logo');
    setLogoError(true);
  };

  return (
    <header className="bg-brand-cream text-gray-800 py-12 px-4 md:px-8">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            {/* Logo and Title Section */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              {!logoError ? (
                <img 
                  src="https://cdn.prod.website-files.com/61a2c8c4fb992469753cd087/6844d50b856574ebce414f85_logo_reto_transp.png" 
                  alt="Logo El reto más absurdo" 
                  className="w-16 h-16 md:w-20 md:h-20 object-contain mx-auto md:mx-0"
                  onLoad={handleLogoLoad}
                  onError={handleLogoError}
                  loading="eager"
                />
              ) : (
                <div className="w-16 h-16 md:w-20 md:h-20 bg-brand-gray-purple/20 rounded-lg flex items-center justify-center mx-auto md:mx-0">
                  <span className="text-xs text-brand-gray-purple font-bold">LOGO</span>
                </div>
              )}
              <h1 className="text-4xl md:text-5xl font-bold text-brand-gray-purple text-center md:text-left">
                El reto más absurdo
              </h1>
            </div>
            
            <div className="flex flex-col gap-3">
              <p className="text-lg text-brand-gray-purple">
                Datos de carreras conectadas a Strava de
              </p>
              
              {/* Strava Connection Box */}
              <button 
                onClick={handleStravaProfileClick}
                className="inline-flex items-center gap-3 bg-brand-coral text-white px-4 py-2 rounded-lg w-fit hover:bg-brand-red transition-colors cursor-pointer"
              >
                <div className="bg-white p-1 rounded">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.599h4.172L10.463 0l-7 13.828h4.172" fill="#FC4C02"/>
                  </svg>
                </div>
                <span className="font-semibold">Juan J. Muñoz O.</span>
              </button>
              
              {lastSync && (
                <span className="text-sm text-brand-gray-purple/80">
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
