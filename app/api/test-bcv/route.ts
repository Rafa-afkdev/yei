import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  console.log('🧪 Probando conectividad con BCV...');
  
  try {
    const config = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
      },
      timeout: 10000,
    };

    const response = await axios.get('https://www.bcv.org.ve/', config);
    
    return NextResponse.json({
      success: true,
      status: response.status,
      contentLength: response.data.length,
      contentType: response.headers['content-type'],
      message: 'Conexión exitosa con BCV',
      htmlPreview: response.data.substring(0, 500) + '...'
    });
    
  } catch (error) {
    console.error('❌ Error conectando con BCV:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      message: 'No se pudo conectar con BCV'
    });
  }
}
