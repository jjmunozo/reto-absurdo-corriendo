
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const StravaCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // El nuevo sistema no requiere callback, redirigir al home
    navigate('/');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <p className="text-lg">Redirigiendo...</p>
        <p className="mt-2 text-sm text-gray-500">
          El sistema ahora carga datos automáticamente.
        </p>
      </div>
    </div>
  );
};

export default StravaCallback;
