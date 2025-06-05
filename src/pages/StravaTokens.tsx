
import React from 'react';
import StravaTokenManager from '@/components/StravaTokenManager';

const StravaTokens: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Configuración de Tokens Strava
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Herramienta para obtener tokens de Strava con los permisos correctos 
            para sincronizar actividades de running.
          </p>
        </div>
        
        <StravaTokenManager />
      </div>
    </div>
  );
};

export default StravaTokens;
