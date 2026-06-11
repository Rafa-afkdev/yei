import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface DollarRateResponse {
  success: boolean;
  rate: number;
  date: string;
  source: string;
  error?: string;
}

export async function GET() {
  console.log('🚀 Iniciando obtención de tasa del BCV...');
  
  // 1. Intentar obtener de DolarApi
  const apiResult = await tryGetFromDolarApi();
  if (apiResult.success) {
    return NextResponse.json(apiResult);
  }

  // 2. Si falla, intentar raspando el BCV directamente
  console.log('⚠️ DolarApi no disponible, intentando raspar el BCV directamente...');
  const bcvResult = await tryScrapeBCV();
  if (bcvResult.success) {
    return NextResponse.json(bcvResult);
  }
  
  // 3. Si ambos fallan, usar datos de fallback
  console.log('⚠️ BCV y DolarApi no disponibles, usando datos de fallback...');
  const fallbackResult = getFallbackRate();
  return NextResponse.json(fallbackResult);
}

async function tryGetFromDolarApi(): Promise<DollarRateResponse> {
  try {
    console.log('📡 Haciendo petición a DolarApi...');
    const response = await axios.get('https://ve.dolarapi.com/v1/dolares', {
      timeout: 10000,
    });
    
    if (response.status !== 200 || !Array.isArray(response.data)) {
      throw new Error(`Respuesta inválida de DolarApi. Status: ${response.status}`);
    }
    
    interface DolarApiItem {
      fuente: string;
      promedio: number;
      fechaActualizacion?: string;
    }

    const oficial = response.data.find((item: DolarApiItem) => item.fuente === 'oficial');
    if (!oficial || typeof oficial.promedio !== 'number') {
      throw new Error('No se encontró la tasa oficial en DolarApi');
    }
    
    const rate = oficial.promedio;
    const date = oficial.fechaActualizacion 
      ? oficial.fechaActualizacion.split('T')[0] 
      : new Date().toISOString().split('T')[0];
      
    console.log(`✅ Tasa obtenida de DolarApi: ${rate} Bs/$ (${date})`);
    
    return {
      success: true,
      rate: rate,
      date: date,
      source: 'BCV (DolarApi)'
    };
  } catch (error) {
    console.error('❌ Error al obtener tasa de DolarApi:', error);
    return {
      success: false,
      rate: 0,
      date: new Date().toISOString().split('T')[0],
      source: 'DolarApi',
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

async function tryScrapeBCV(): Promise<DollarRateResponse> {
  try {
    // Configurar axios con headers similares al código C#
    const config = {
      headers: {
        'Cache-Control': 'no-cache',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-VE,es;q=0.8,en;q=0.5,en-US;q=0.3',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      timeout: 15000, // 15 segundos de timeout
      validateStatus: function (status: number) {
        return status >= 200 && status < 300; // default
      }
    };

    console.log('📡 Haciendo petición al BCV...');
    
    // Hacer la petición al BCV
    const response = await axios.get('https://www.bcv.org.ve/', config);
    console.log(`✅ Respuesta recibida. Status: ${response.status}, Content-Length: ${response.data.length}`);
    
    const html = response.data;

    // Cargar el HTML con cheerio
    const $ = cheerio.load(html);

    console.log('🔍 Buscando elementos de tasa en el HTML...');
    
    // Intentar diferentes selectores para encontrar el dólar
    let dolarElement = $('#dolar strong').first();
    console.log(`Selector #dolar strong: ${dolarElement.length} elementos encontrados`);
    
    if (dolarElement.length === 0) {
      dolarElement = $('.recuadro strong').first();
      console.log(`Selector .recuadro strong: ${dolarElement.length} elementos encontrados`);
    }
    
    if (dolarElement.length === 0) {
      dolarElement = $('div:contains("USD") strong').first();
      console.log(`Selector div:contains("USD") strong: ${dolarElement.length} elementos encontrados`);
    }
    
    if (dolarElement.length === 0) {
      dolarElement = $('strong').filter((_, el) => {
        const text = $(el).text();
        return text.includes(',') && /\d+,\d+/.test(text);
      }).first();
      console.log(`Selector strong con formato numérico: ${dolarElement.length} elementos encontrados`);
    }
    
    // Intentar selectores adicionales más generales
    if (dolarElement.length === 0) {
      console.log('🔍 Probando selectores adicionales...');
      
      // Buscar cualquier elemento que contenga un patrón de precio
      const allElements = $('span, div, p, td, th').filter((_, el) => {
        const text = $(el).text().trim();
        // Buscar patrones como "36,25" o "36.25" o "36,25 Bs"
        return /\d{2,3}[,.]\d{2}/.test(text) && text.length < 20;
      });
      dolarElement = allElements.first();
      console.log(`Selector genérico con patrón de precio: ${dolarElement.length} elementos encontrados`);
    }

    if (dolarElement.length === 0) {
      throw new Error('No se pudo encontrar la tasa del dólar en la página del BCV');
    }

    // Extraer y limpiar el texto
    let dolarText = dolarElement.text().trim();
    console.log('Texto del dólar encontrado:', dolarText);

    // Limpiar el texto: remover puntos de miles y convertir coma decimal a punto
    dolarText = dolarText.replace(/\./g, '').replace(',', '.');
    console.log('Texto del dólar limpio:', dolarText);

    // Convertir a número
    const rate = parseFloat(dolarText);
    
    if (isNaN(rate) || rate <= 0) {
      throw new Error(`Tasa inválida parseada: ${dolarText}`);
    }

    // Intentar obtener la fecha
    let fechaTasa = new Date().toISOString().split('T')[0]; // Por defecto usar hoy
    const fechaElement = $('.date-display-single').first();
    
    if (fechaElement.length > 0) {
      const fechaText = fechaElement.text().trim();
      console.log('Fecha encontrada:', fechaText);
      
      // Intentar parsear la fecha del BCV (formato dd/MM/yyyy)
      const fechaMatch = fechaText.match(/(\d{2})\/(\d{2})\/(\d{4})/);
      if (fechaMatch) {
        const [, day, month, year] = fechaMatch;
        fechaTasa = `${year}-${month}-${day}`;
      }
    }

    const today = new Date().toISOString().split('T')[0];
    
    // Si la fecha es futura, podría ser un error en el scraping
    if (fechaTasa > today) {
      console.warn(`Fecha futura detectada (${fechaTasa}), usando fecha actual`);
      fechaTasa = today;
    }

    console.log(`Tasa obtenida del BCV: ${rate} Bs/$ (${fechaTasa})`);

    const result: DollarRateResponse = {
      success: true,
      rate: rate,
      date: fechaTasa,
      source: 'BCV'
    };

    return result;

  } catch (error) {
    console.error('❌ Error al obtener tasa del BCV:', error);
    
    let errorMessage = 'Error desconocido';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    const errorResult: DollarRateResponse = {
      success: false,
      rate: 0,
      date: new Date().toISOString().split('T')[0],
      source: 'BCV',
      error: `Error del BCV: ${errorMessage}`
    };

    // No devolver status 500, sino 200 con success: false para mejor manejo en el frontend
    return errorResult;
  }
}

function getFallbackRate(): DollarRateResponse {
  // Tasa de fallback basada en datos históricos recientes
  // En un caso real, esto podría venir de una base de datos o cache
  const fallbackRate = 572.00; // Tasa aproximada actualizada
  
  console.log(`📊 Usando tasa de fallback: ${fallbackRate} Bs/$`);
  
  return {
    success: true,
    rate: fallbackRate,
    date: new Date().toISOString().split('T')[0],
    source: 'Fallback',
    error: 'BCV no disponible, usando tasa de referencia'
  };
}

// Método POST para entrada manual de tasa
export async function POST(request: Request) {
  try {
    const { rate } = await request.json();
    
    if (!rate || isNaN(rate) || rate <= 0) {
      return NextResponse.json(
        { success: false, error: 'Tasa inválida' },
        { status: 400 }
      );
    }

    const result: DollarRateResponse = {
      success: true,
      rate: parseFloat(rate),
      date: new Date().toISOString().split('T')[0],
      source: 'Manual'
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error en entrada manual:', error);
    return NextResponse.json(
      { success: false, error: 'Error al procesar tasa manual' },
      { status: 500 }
    );
  }
}
