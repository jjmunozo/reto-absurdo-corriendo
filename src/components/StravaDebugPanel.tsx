
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Activity, AlertCircle, CheckCircle } from 'lucide-react';
import { runStravaDiagnostics, DiagnosticResult } from '@/utils/stravaDiagnostics';

const StravaDebugPanel: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const handleRunDiagnostics = async () => {
    setLoading(true);
    try {
      const results = await runStravaDiagnostics();
      setDiagnostics(results);
      
      // Auto-expandir elementos con errores
      const errorSteps = results
        .filter(r => r.status === 'error')
        .map(r => r.step);
      setOpenItems(new Set(errorSteps));
      
    } catch (error) {
      console.error('Error ejecutando diagnósticos:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (step: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(step)) {
      newOpenItems.delete(step);
    } else {
      newOpenItems.add(step);
    }
    setOpenItems(newOpenItems);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Panel de Diagnóstico de Strava
        </CardTitle>
        <CardDescription>
          Ejecuta pruebas detalladas para identificar problemas con la carga de datos de Strava
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            onClick={handleRunDiagnostics} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Ejecutando diagnósticos...' : 'Ejecutar Diagnósticos'}
          </Button>

          {diagnostics.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Resultados del Diagnóstico</h3>
              <div className="space-y-2">
                {diagnostics.map((result, index) => (
                  <Collapsible key={index}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between h-auto p-3"
                        onClick={() => toggleItem(result.step)}
                      >
                        <div className="flex items-center gap-3">
                          {getStatusIcon(result.status)}
                          <span className="font-medium">{result.step}</span>
                          <Badge className={getStatusColor(result.status)}>
                            {result.status}
                          </Badge>
                        </div>
                        {openItems.has(result.step) ? 
                          <ChevronDown className="h-4 w-4" /> : 
                          <ChevronRight className="h-4 w-4" />
                        }
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="pl-6 pb-3 space-y-2">
                        <p className="text-sm text-gray-600">{result.message}</p>
                        {result.data && (
                          <div className="bg-gray-50 p-3 rounded text-xs font-mono">
                            <pre>{JSON.stringify(result.data, null, 2)}</pre>
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StravaDebugPanel;
