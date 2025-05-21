
import React from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';

const StravaTroubleshooting: React.FC = () => {
  return (
    <div className="mt-4">
      <Alert variant="warning">
        <AlertDescription className="flex items-center justify-between">
          <span>¿Problemas para conectar con Strava?</span>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <HelpCircle className="w-4 h-4 mr-1" />
                Ayuda
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Solución de problemas con Strava</DialogTitle>
                <DialogDescription>
                  Si ves el error "www.strava.com refused to connect", prueba estos pasos:
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">1. Verifica la configuración de la API de Strava</h3>
                  <p className="text-sm text-muted-foreground">
                    Asegúrate de que el dominio configurado en tu aplicación de Strava sea exactamente:<br />
                    <span className="font-mono bg-muted p-1 rounded">{window.location.host}</span><br />
                    (sin http://, https:// ni barras al final)
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">2. Verifica tu conexión a internet</h3>
                  <p className="text-sm text-muted-foreground">Asegúrate de tener una conexión a internet estable.</p>
                </div>
                <div>
                  <h3 className="font-medium">3. Limpia las cookies del navegador</h3>
                  <p className="text-sm text-muted-foreground">A veces, las cookies antiguas pueden causar problemas de conexión.</p>
                </div>
                <div>
                  <h3 className="font-medium">4. Usa otro navegador</h3>
                  <p className="text-sm text-muted-foreground">Intenta conectar desde Chrome, Firefox o Safari si estás teniendo problemas.</p>
                </div>
                <div>
                  <h3 className="font-medium">5. Verifica que Strava esté en funcionamiento</h3>
                  <p className="text-sm text-muted-foreground">Visita <a href="https://status.strava.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">status.strava.com</a> para comprobar si hay algún problema conocido.</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default StravaTroubleshooting;
