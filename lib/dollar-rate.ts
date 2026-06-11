// Utilidades para manejo de tasa del dólar
import { useState } from 'react';

export interface DollarRateResponse {
  success: boolean;
  rate: number;
  date: string;
  source: string;
  error?: string;
}

/**
 * Obtiene la tasa del dólar desde la API local que hace scraping del BCV
 */
export async function fetchDollarRate(): Promise<DollarRateResponse> {
  try {
    const response = await fetch('/api/dollar-rate', {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: DollarRateResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching dollar rate:', error);
    return {
      success: false,
      rate: 0,
      date: new Date().toISOString().split('T')[0],
      source: 'Error',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

/**
 * Establece una tasa manual del dólar
 */
export async function setManualDollarRate(rate: number): Promise<DollarRateResponse> {
  try {
    if (isNaN(rate) || rate <= 0) {
      throw new Error('Tasa inválida');
    }

    const response = await fetch('/api/dollar-rate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rate }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: DollarRateResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error setting manual rate:', error);
    return {
      success: false,
      rate: 0,
      date: new Date().toISOString().split('T')[0],
      source: 'Error',
      error: error instanceof Error ? error.message : 'Error al establecer tasa manual'
    };
  }
}

/**
 * Convierte un precio en USD a bolívares usando la tasa proporcionada
 */
export function convertUsdToBs(usdAmount: number, dollarRate: number): number {
  if (isNaN(usdAmount) || isNaN(dollarRate) || usdAmount < 0 || dollarRate <= 0) {
    return 0;
  }
  return Math.round((usdAmount * dollarRate) * 100) / 100; // Redondear a 2 decimales
}

/**
 * Convierte un precio en bolívares a USD usando la tasa proporcionada
 */
export function convertBsToUsd(bsAmount: number, dollarRate: number): number {
  if (isNaN(bsAmount) || isNaN(dollarRate) || bsAmount < 0 || dollarRate <= 0) {
    return 0;
  }
  return Math.round((bsAmount / dollarRate) * 100) / 100; // Redondear a 2 decimales
}

/**
 * Formatea un número como moneda en bolívares
 */
export function formatBsCurrency(amount: number): string {
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: 'VES',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formatea un número como moneda en USD
 */
export function formatUsdCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Valida si una tasa del dólar es válida
 */
export function isValidDollarRate(rate: number): boolean {
  return !isNaN(rate) && rate > 0 && rate < 1000; // Asumiendo que una tasa mayor a 1000 es sospechosa
}

/**
 * Hook personalizado para manejar la tasa del dólar (para usar en componentes React)
 */
export function useDollarRate() {
  const [dollarRate, setDollarRate] = useState<number>(0);
  const [rateSource, setRateSource] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRate = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fetchDollarRate();
      
      if (result.success) {
        setDollarRate(result.rate);
        setRateSource(result.source);
      } else {
        setError(result.error || 'Error al obtener la tasa');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const setManualRate = async (rate: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await setManualDollarRate(rate);
      
      if (result.success) {
        setDollarRate(result.rate);
        setRateSource(result.source);
      } else {
        setError(result.error || 'Error al establecer tasa manual');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    dollarRate,
    rateSource,
    isLoading,
    error,
    fetchRate,
    setManualRate,
    convertUsdToBs: (usd: number) => convertUsdToBs(usd, dollarRate),
    convertBsToUsd: (bs: number) => convertBsToUsd(bs, dollarRate),
  };
}
