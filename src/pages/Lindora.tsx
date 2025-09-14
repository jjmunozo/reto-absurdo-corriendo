import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Lindora = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Tips para Correr en Lindora
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-6">
            escrito por Juan J. Muñoz O, un corredor primerizo que está entrenando en Lindora para El Reto Más Absurdo Que Se Ha Puesto En La Vida
          </p>
          <Link to="/apoyo">
            <Button variant="default" size="lg">
              Saber más sobre el reto
            </Button>
          </Link>
        </div>
      </div>

      {/* PDF Embed Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="w-full h-[800px] border border-gray-200 rounded-lg flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <p className="text-lg mb-2">PDF Embed Area</p>
              <p className="text-sm">Aquí se mostrará el PDF cuando lo subas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lindora;