
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
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

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
            <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Solución de problemas con Strava</DialogTitle>
                <DialogDescription>
                  Si tienes problemas para conectar con Strava, prueba los siguientes pasos:
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">1. Error "accounts.google.com refused to connect"</h3>
                  <p className="text-sm text-muted-foreground">
                    Si ves este error al intentar iniciar sesión con Google, prueba:
                  </p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground ml-2 mt-1">
                    <li>Limpiar las cookies y caché del navegador</li>
                    <li>Probar con otro navegador (Chrome, Firefox, Safari)</li>
                    <li>Desactivar temporalmente extensiones del navegador</li>
                    <li>Iniciar sesión directamente con tus credenciales de Strava (no usar Google)</li>
                    <li>Verificar tu conexión a internet</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium">2. Error "www.strava.com refused to connect"</h3>
                  <p className="text-sm text-muted-foreground">
                    Este error suele estar relacionado con la configuración en la API de Strava:
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium">3. Verifica la configuración de la API de Strava</h3>
                  <p className="text-sm text-muted-foreground">
                    Asegúrate de que el dominio configurado en tu aplicación de Strava sea exactamente:<br />
                    <Popover>
                      <PopoverTrigger asChild>
                        <span className="font-mono bg-muted p-1 rounded cursor-pointer">{window.location.host}</span>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-2">
                        <p className="text-xs">Haz clic para copiar</p>
                      </PopoverContent>
                    </Popover><br />
                    (sin http://, https:// ni barras al final)
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium">4. Limpia las cookies del navegador</h3>
                  <p className="text-sm text-muted-foreground">
                    A veces, las cookies antiguas pueden causar problemas de conexión.
                    <br />
                    <strong>En Chrome</strong>: Configuración → Privacidad y seguridad → Borrar datos de navegación
                    <br />
                    <strong>En Firefox</strong>: Menú → Opciones → Privacidad → Borrar historial
                    <br />
                    <strong>En Safari</strong>: Preferencias → Privacidad → Administrar datos de sitios web
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium">5. Usa otro navegador</h3>
                  <p className="text-sm text-muted-foreground">Intenta conectar desde Chrome, Firefox o Safari si estás teniendo problemas.</p>
                </div>
                
                <div>
                  <h3 className="font-medium">6. Desactiva extensiones</h3>
                  <p className="text-sm text-muted-foreground">
                    Algunas extensiones como bloqueadores de anuncios, VPNs o herramientas de privacidad pueden interferir con el proceso de autenticación.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium">7. Verifica que Strava esté en funcionamiento</h3>
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
