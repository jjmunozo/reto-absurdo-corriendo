import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePageMetadata } from "@/hooks/usePageMetadata";

const Lindora = () => {
  usePageMetadata({
    title: "Tips para Correr en Lindora - El reto más absurdo",
    description: "Guía completa con tips y mapas para correr en Lindora, escrita por Juan J. Muñoz O. Incluye rutas recomendadas, lugares para parquear y consejos prácticos.",
    ogTitle: "Tips para Correr en Lindora 🏃‍♂️",
    ogDescription: "Descubre los mejores consejos para correr en Lindora con mapas detallados y rutas recomendadas. Escrito por un corredor primerizo para la comunidad.",
    ogImage: `${window.location.origin}/lindora/page_1.jpg`
  });
  return <div className="min-h-screen bg-brand-cream">
      {/* Header Section */}
      <section className="container mx-auto px-4 py-6">
        <div className="bg-gray-800 text-white rounded-t-lg p-6">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Tips para Correr en Lindora
          </h1>
          <p className="text-lg md:text-xl text-gray-300 text-center leading-relaxed font-light">
            escrito por Juan J. Muñoz O, un corredor primerizo que está entrenando en Lindora para El Reto Más Absurdo Que Se Ha Puesto En La Vida
          </p>
        </div>
        <div className="bg-white border-x-2 border-b-2 border-brand-coral/20 rounded-b-lg p-6 text-center">
          <Link to="/apoyo">
            <Button className="bg-brand-coral hover:bg-brand-red text-white" size="lg">
              Saber más sobre el reto
            </Button>
          </Link>
          <p className="mt-4 text-gray-600">
            Pueden ver y descargar el PDF de abajo, si les parece útil compártanlo 🙏
          </p>
        </div>
      </section>

      {/* PDF/Images Section */}
      <section className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg border-2 border-brand-coral/20 shadow-lg">
          {/* Mobile: Image Gallery */}
          <div className="md:hidden">
            <div className="p-4 text-center border-b border-gray-200">
              <a 
                href="/Correr_en_Lindora.pdf" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-block bg-brand-coral hover:bg-brand-red text-white px-4 py-2 rounded-lg transition-colors"
              >
                📄 Descargar PDF
              </a>
            </div>
            <div className="space-y-4 p-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((pageNum) => (
                <div key={pageNum} className="w-full">
                  <img 
                    src={`/lindora/page_${pageNum}.jpg`}
                    alt={`Página ${pageNum} - Tips para Correr en Lindora`}
                    className="w-full h-auto rounded-lg shadow-sm"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Desktop: PDF Embed */}
          <div className="hidden md:block">
            <iframe 
              src="/Correr_en_Lindora.pdf" 
              width="100%" 
              height="800" 
              className="rounded-lg" 
              title="Tips para Correr en Lindora"
            >
              <p>Tu navegador no soporta la visualización de PDFs. 
                <a href="/Correr_en_Lindora.pdf" target="_blank" rel="noopener noreferrer" className="text-brand-coral hover:text-brand-red underline">
                  Haz clic aquí para descargar el PDF
                </a>
              </p>
            </iframe>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-6 px-4">
        <div className="container mx-auto text-center text-brand-gray-purple">
          <p className="text-sm">&copy; 2025 El reto más absurdo | Datos verificados por Strava</p>
        </div>
      </footer>
    </div>;
};
export default Lindora;