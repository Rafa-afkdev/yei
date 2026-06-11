"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchDollarRate, setManualDollarRate, DollarRateResponse } from "@/lib/dollar-rate";
import { showToast } from "nextjs-toast-notify";

export default function TestDollarRatePage() {
  const [result, setResult] = useState<DollarRateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [manualRate, setManualRateInput] = useState("");

  const handleFetchRate = async () => {
    setIsLoading(true);
    try {
      const data = await fetchDollarRate();
      setResult(data);
      
      if (data.success) {
        showToast.success(`Tasa obtenida: ${data.rate.toFixed(2)} Bs/$`);
      } else {
        showToast.error(data.error || "Error al obtener la tasa");
      }
    } catch (error) {
      console.error("Error:", error);
      showToast.error("Error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetManualRate = async () => {
    const rate = parseFloat(manualRate);
    if (isNaN(rate) || rate <= 0) {
      showToast.error("Por favor ingrese una tasa válida");
      return;
    }

    setIsLoading(true);
    try {
      const data = await setManualDollarRate(rate);
      setResult(data);
      
      if (data.success) {
        showToast.success(`Tasa manual establecida: ${data.rate.toFixed(2)} Bs/$`);
        setManualRateInput("");
      } else {
        showToast.error(data.error || "Error al establecer tasa manual");
      }
    } catch (error) {
      console.error("Error:", error);
      showToast.error("Error inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Prueba de Tasa del Dólar</h1>
      
      <div className="space-y-6">
        {/* Obtener tasa del BCV */}
        <Card>
          <CardHeader>
            <CardTitle>Obtener Tasa del BCV</CardTitle>
            <CardDescription>
              Hace web scraping del sitio del Banco Central de Venezuela
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleFetchRate} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Obteniendo..." : "Obtener Tasa del BCV"}
            </Button>
          </CardContent>
        </Card>

        {/* Establecer tasa manual */}
        <Card>
          <CardHeader>
            <CardTitle>Establecer Tasa Manual</CardTitle>
            <CardDescription>
              Ingrese una tasa manualmente si el BCV no está disponible
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                type="number"
                step="0.01"
                placeholder="Ej: 36.25"
                value={manualRate}
                onChange={(e) => setManualRateInput(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleSetManualRate}
                disabled={isLoading || !manualRate || parseFloat(manualRate) <= 0}
              >
                Establecer
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resultado */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Resultado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Estado:</span>
                  <span className={result.success ? "text-green-600" : "text-red-600"}>
                    {result.success ? "✅ Éxito" : "❌ Error"}
                  </span>
                </div>
                
                {result.success ? (
                  <>
                    <div className="flex justify-between">
                      <span className="font-medium">Tasa:</span>
                      <span className="font-bold text-lg">
                        {result.rate.toFixed(2)} Bs/$
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Fuente:</span>
                      <span>{result.source}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Fecha:</span>
                      <span>{result.date}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between">
                    <span className="font-medium">Error:</span>
                    <span className="text-red-600">{result.error}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ejemplo de conversión */}
        {result && result.success && (
          <Card>
            <CardHeader>
              <CardTitle>Ejemplo de Conversión</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>$1.00 USD =</span>
                  <span className="font-medium">{result.rate.toFixed(2)} Bs</span>
                </div>
                <div className="flex justify-between">
                  <span>$10.00 USD =</span>
                  <span className="font-medium">{(result.rate * 10).toFixed(2)} Bs</span>
                </div>
                <div className="flex justify-between">
                  <span>$100.00 USD =</span>
                  <span className="font-medium">{(result.rate * 100).toFixed(2)} Bs</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
