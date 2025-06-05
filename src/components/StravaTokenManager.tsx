
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Copy, ExternalLink } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  scope: string;
  athlete: {
    id: number;
    firstname: string;
    lastname: string;
  };
}

const StravaTokenManager: React.FC = () => {
  const [step, setStep] = useState(1);
  const [authCode, setAuthCode] = useState('');
  const [tokenResponse, setTokenResponse] = useState<TokenResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<{ [key: string]: boolean }>({});

  // Configuración de Strava
  const CLIENT_ID = '160774';
  const CLIENT_SECRET = '5836512c42bdd300ac801e4b2d81bdff5228d281';
  const REDIRECT_URI = 'http://localhost';
  const SCOPE = 'read,activity:read_all';

  // URL de autorización
  const authUrl = `https://www.strava.com/oauth/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&approval_prompt=force&scope=${encodeURIComponent(SCOPE)}`;

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied({ ...copied, [key]: true });
      setTimeout(() => setCopied({ ...copied, [key]: false }), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  const exchangeCodeForToken = async () => {
    if (!authCode.trim()) {
      setError('Por favor ingresa el código de autorización');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code: authCode.trim(),
          grant_type: 'authorization_code',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const data: TokenResponse = await response.json();
      setTokenResponse(data);
      setStep(4);
      
      console.log('✅ Token obtenido exitosamente:', {
        scope: data.scope,
        athlete: data.athlete,
        expires_at: new Date(data.expires_at * 1000).toISOString()
      });
    } catch (error: any) {
      console.error('❌ Error intercambiando código:', error);
      setError(error.message || 'Error al intercambiar código por token');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Paso 1:</strong> Vamos a autorizar tu aplicación con los permisos correctos.
                El scope actual es "read" pero necesitamos "read,activity:read_all".
              </AlertDescription>
            </Alert>
            
            <div className="space-y-3">
              <p className="text-sm">
                Haz clic en el botón para ir a Strava y autorizar con los permisos completos:
              </p>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => window.open(authUrl, '_blank')}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Autorizar en Strava
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(authUrl, 'authUrl')}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  {copied.authUrl ? 'Copiado!' : 'Copiar URL'}
                </Button>
              </div>
              
              <Alert>
                <div className="text-sm">
                  <strong>URL de autorización:</strong>
                  <div className="bg-muted p-2 rounded mt-2 text-xs break-all">
                    {authUrl}
                  </div>
                </div>
              </Alert>
            </div>
            
            <Button onClick={() => setStep(2)} className="w-full">
              Ya autoricé, continuar al paso 2
            </Button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Paso 2:</strong> Después de autorizar, serás redirigido a una URL como esta:
              </AlertDescription>
            </Alert>
            
            <div className="space-y-3">
              <div className="bg-muted p-3 rounded">
                <p className="text-sm font-medium mb-2">Ejemplo de URL de redirección:</p>
                <code className="text-xs block">
                  http://localhost/?state=&code=XXXXXXXXXXXXXX&scope=read,activity:read_all
                </code>
              </div>
              
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  <strong>Importante:</strong> Copia SOLO el valor después de "code=" y antes de "&scope".
                  En el ejemplo anterior serían las X.
                </AlertDescription>
              </Alert>
            </div>
            
            <Button onClick={() => setStep(3)} className="w-full">
              Ya tengo el código, continuar al paso 3
            </Button>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Paso 3:</strong> Intercambiar el código por tokens
              </AlertDescription>
            </Alert>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="authCode">Código de autorización de Strava</Label>
                <Input
                  id="authCode"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value)}
                  placeholder="Pega aquí el código que obtuviste de la URL"
                  className="mt-1"
                />
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <Button
                onClick={exchangeCodeForToken}
                disabled={isLoading || !authCode.trim()}
                className="w-full"
              >
                {isLoading ? 'Intercambiando código...' : 'Obtener Tokens'}
              </Button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                <strong>¡Éxito!</strong> Tokens obtenidos correctamente con scope completo.
              </AlertDescription>
            </Alert>
            
            {tokenResponse && (
              <div className="space-y-4">
                <div>
                  <Label>Información del atleta:</Label>
                  <div className="bg-muted p-2 rounded text-sm mt-1">
                    ID: {tokenResponse.athlete.id} - {tokenResponse.athlete.firstname} {tokenResponse.athlete.lastname}
                  </div>
                </div>
                
                <div>
                  <Label>Scope obtenido:</Label>
                  <div className="bg-muted p-2 rounded text-sm mt-1">
                    {tokenResponse.scope}
                  </div>
                </div>
                
                <div>
                  <Label>Access Token (para JUAN_STRAVA_ACCESS_TOKEN):</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input value={tokenResponse.access_token} readOnly />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(tokenResponse.access_token, 'accessToken')}
                    >
                      {copied.accessToken ? 'Copiado!' : 'Copiar'}
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label>Refresh Token (para JUAN_STRAVA_REFRESH_TOKEN):</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input value={tokenResponse.refresh_token} readOnly />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(tokenResponse.refresh_token, 'refreshToken')}
                    >
                      {copied.refreshToken ? 'Copiado!' : 'Copiar'}
                    </Button>
                  </div>
                </div>
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Paso 4:</strong> Ahora debes actualizar estos tokens en los secrets de Supabase:
                    <br />• JUAN_STRAVA_ACCESS_TOKEN = {tokenResponse.access_token.substring(0, 20)}...
                    <br />• JUAN_STRAVA_REFRESH_TOKEN = {tokenResponse.refresh_token.substring(0, 20)}...
                  </AlertDescription>
                </Alert>
              </div>
            )}
            
            <Button onClick={() => setStep(1)} variant="outline" className="w-full">
              Reiniciar proceso
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔑 Generador de Tokens Strava
        </CardTitle>
        <CardDescription>
          Obtén tokens con scope "read,activity:read_all" para sincronizar actividades
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Paso {step} de 4</span>
            <span>{Math.round((step / 4) * 100)}% completado</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 mt-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>
        
        {renderStep()}
      </CardContent>
    </Card>
  );
};

export default StravaTokenManager;
