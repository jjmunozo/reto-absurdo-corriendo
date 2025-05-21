
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { exchangeCodeForToken } from '@/services/stravaService';
import { toast } from '@/hooks/use-toast';

const StravaCallback: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Extraer el código de autorización de la URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        if (error) {
          setError('Autorización cancelada o rechazada.');
          toast({
            title: 'Error de autenticación',
            description: 'La autorización con Strava fue cancelada o rechazada.',
            variant: 'destructive',
          });
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        if (!code) {
          setError('No se encontró código de autorización en la URL.');
          return;
        }

        // Intercambiar el código por un token
        const data = await exchangeCodeForToken(code);
        
        toast({
          title: 'Conexión exitosa',
          description: `¡Bienvenido, ${data.athlete.firstname}! Tu cuenta de Strava ha sido conectada correctamente.`,
        });
        
        // Redirigir al usuario a la página principal
        navigate('/');
      } catch (err) {
        console.error('Error en el callback de Strava:', err);
        setError('Error al procesar la autenticación con Strava.');
        toast({
          title: 'Error de conexión',
          description: 'No se pudo completar la conexión con Strava.',
          variant: 'destructive',
        });
        setTimeout(() => navigate('/'), 3000);
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        {loading && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-running-primary mx-auto"></div>
            <p className="mt-4 text-lg">Conectando con Strava...</p>
            <p className="mt-2 text-sm text-gray-500">Procesando tu autenticación, por favor espera.</p>
          </div>
        )}
        
        {error && (
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2">Error de autenticación</h2>
            <p className="text-gray-600">{error}</p>
            <button 
              onClick={() => navigate('/')} 
              className="mt-4 px-4 py-2 bg-running-primary text-white rounded hover:bg-running-dark transition-colors"
            >
              Volver al inicio
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StravaCallback;
