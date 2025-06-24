
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Upload, AlertTriangle, CheckCircle } from 'lucide-react';

interface CSVRow {
  fechaHora: string;
  titulo: string;
  descripcion: string;
  distanciaKm: number;
  tiempoSegundos: number;
  elevacion: number;
}

interface ProcessedRun {
  startTime: string;
  title: string;
  distanceKm: number;
  durationHours: number;
  durationMinutes: number;
  durationSeconds: number;
  avgPace: number;
  totalElevation: number;
}

const ImportRuns = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [processedData, setProcessedData] = useState<ProcessedRun[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'retomongon') {
      setIsAuthenticated(true);
      setError(null);
    } else {
      setError('Contraseña incorrecta');
    }
  };

  const parseCSV = (text: string): CSVRow[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const data: CSVRow[] = [];
    
    // Skip header row (primera línea)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const columns = line.split(',').map(col => col.trim().replace(/"/g, ''));
      
      if (columns.length !== 6) {
        throw new Error(`Línea ${i + 1}: Esperaba 6 columnas, encontradas ${columns.length}`);
      }
      
      const [fechaHora, titulo, descripcion, distancia, tiempo, elevacion] = columns;
      
      data.push({
        fechaHora,
        titulo,
        descripcion,
        distanciaKm: parseFloat(distancia),
        tiempoSegundos: parseInt(tiempo),
        elevacion: parseInt(elevacion)
      });
    }
    
    return data;
  };

  const processData = (csvData: CSVRow[]): ProcessedRun[] => {
    return csvData.map(row => {
      // Convertir segundos a horas, minutos y segundos
      const totalSeconds = row.tiempoSegundos;
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      
      // Calcular pace (min/km)
      const totalMinutes = totalSeconds / 60;
      const avgPace = totalMinutes / row.distanciaKm;
      
      return {
        startTime: row.fechaHora,
        title: row.titulo,
        distanceKm: row.distanciaKm,
        durationHours: hours,
        durationMinutes: minutes,
        durationSeconds: seconds,
        avgPace,
        totalElevation: row.elevacion
      };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    if (!selectedFile.name.endsWith('.csv')) {
      setError('Por favor selecciona un archivo CSV');
      return;
    }
    
    setFile(selectedFile);
    setError(null);
    setIsProcessing(true);
    
    try {
      const text = await selectedFile.text();
      const parsed = parseCSV(text);
      const processed = processData(parsed);
      
      setCsvData(parsed);
      setProcessedData(processed);
      
      console.log('📊 Datos procesados:', processed.slice(0, 3));
    } catch (err: any) {
      setError(`Error procesando CSV: ${err.message}`);
      setCsvData([]);
      setProcessedData([]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    if (processedData.length === 0) return;
    
    setIsImporting(true);
    setError(null);
    
    try {
      console.log('🗑️ Eliminando carreras existentes...');
      
      // Eliminar todas las carreras manuales existentes
      const { error: deleteError } = await supabase
        .from('manual_runs')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Eliminar todas
      
      if (deleteError) {
        throw new Error(`Error eliminando datos existentes: ${deleteError.message}`);
      }
      
      console.log('📥 Insertando nuevas carreras...');
      
      // Insertar nuevas carreras
      const insertData = processedData.map(run => ({
        start_time: run.startTime,
        title: run.title,
        distance_km: run.distanceKm,
        duration_hours: run.durationHours,
        duration_minutes: run.durationMinutes,
        duration_seconds: run.durationSeconds,
        avg_pace: run.avgPace,
        total_elevation: run.totalElevation,
        has_pr: false
      }));
      
      const { error: insertError } = await supabase
        .from('manual_runs')
        .insert(insertData);
      
      if (insertError) {
        throw new Error(`Error insertando datos: ${insertError.message}`);
      }
      
      setImportSuccess(true);
      toast({
        title: "Importación exitosa",
        description: `Se importaron ${processedData.length} carreras correctamente`,
      });
      
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error en la importación",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Importar Datos Históricos</CardTitle>
            <CardDescription>Ingresa la contraseña para acceder</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full">
                Acceder
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate('/')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Dashboard
          </Button>
          
          <h1 className="text-3xl font-bold text-brand-gray-purple mb-2">
            Importar Datos Históricos
          </h1>
          <p className="text-gray-600">
            Carga un archivo CSV con tus carreras históricas
          </p>
        </div>

        {importSuccess ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-green-700 mb-2">
                  ¡Importación Exitosa!
                </h2>
                <p className="text-gray-600 mb-4">
                  Se importaron {processedData.length} carreras correctamente.
                </p>
                <Button onClick={() => navigate('/')}>
                  Ver Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Instrucciones */}
            <Card>
              <CardHeader>
                <CardTitle>Formato del CSV</CardTitle>
                <CardDescription>
                  El archivo debe tener exactamente estas 6 columnas (con encabezado):
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <code className="text-sm">
                    Fecha_y_hora,Titulo,Descripcion,Distancia_km,Tiempo_segundos,Elevacion
                    <br />
                    2024-06-17 05:06:00,Morning Run,Carrera matutina,5.2,1860,45
                  </code>
                </div>
              </CardContent>
            </Card>

            {/* Carga de archivo */}
            <Card>
              <CardHeader>
                <CardTitle>Cargar Archivo CSV</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      disabled={isProcessing}
                    />
                    {isProcessing && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-coral"></div>}
                  </div>
                  
                  {error && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Vista previa */}
            {processedData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Vista Previa</CardTitle>
                  <CardDescription>
                    {processedData.length} carreras encontradas. Revisa los datos antes de importar.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-auto mb-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha/Hora</TableHead>
                          <TableHead>Título</TableHead>
                          <TableHead>Distancia</TableHead>
                          <TableHead>Tiempo</TableHead>
                          <TableHead>Pace</TableHead>
                          <TableHead>Elevación</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {processedData.slice(0, 10).map((run, index) => (
                          <TableRow key={index}>
                            <TableCell>{run.startTime}</TableCell>
                            <TableCell>{run.title}</TableCell>
                            <TableCell>{run.distanceKm}km</TableCell>
                            <TableCell>
                              {run.durationHours}h {run.durationMinutes}m {run.durationSeconds}s
                            </TableCell>
                            <TableCell>
                              {Math.floor(run.avgPace)}'{Math.round((run.avgPace % 1) * 60)}"
                            </TableCell>
                            <TableCell>{run.totalElevation}m</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {processedData.length > 10 && (
                    <p className="text-sm text-gray-500 mb-4">
                      Mostrando las primeras 10 carreras de {processedData.length} total
                    </p>
                  )}
                  
                  <Alert className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>¡Atención!</strong> Esta acción eliminará todas las carreras existentes 
                      y las reemplazará con los datos del CSV. Esta acción no se puede deshacer.
                    </AlertDescription>
                  </Alert>
                  
                  <Button 
                    onClick={handleImport}
                    disabled={isImporting}
                    className="w-full"
                  >
                    {isImporting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Importando...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Importar {processedData.length} carreras
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportRuns;
