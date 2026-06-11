# Implementación de Web Scraping para Tasa del Dólar BCV

## Descripción

Esta implementación reemplaza la API externa que ya no funciona con un sistema de web scraping que obtiene la tasa del dólar directamente del sitio web del Banco Central de Venezuela (BCV). Incluye funcionalidades de fallback manual y manejo robusto de errores.

## Archivos Creados/Modificados

### 1. API Route: `/app/api/dollar-rate/route.ts`
- **Función**: Endpoint que hace web scraping del sitio del BCV
- **Métodos**:
  - `GET`: Obtiene la tasa del dólar del BCV
  - `POST`: Permite establecer una tasa manual
- **Dependencias**: `axios`, `cheerio`

### 2. Utilidades: `/lib/dollar-rate.ts`
- **Función**: Funciones reutilizables para manejo de tasa del dólar
- **Incluye**:
  - `fetchDollarRate()`: Obtiene tasa del BCV
  - `setManualDollarRate()`: Establece tasa manual
  - `convertUsdToBs()`: Convierte USD a Bolívares
  - `convertBsToUsd()`: Convierte Bolívares a USD
  - Funciones de formateo de moneda
  - Hook personalizado `useDollarRate()`

### 3. Componente Actualizado: `/app/dashboard/productos/components/create-update-pruductos-form.tsx`
- **Mejoras**:
  - Integración con nueva API de scraping
  - Interfaz para entrada manual de tasa
  - Cálculo automático de precios en Bs
  - Mejor manejo de errores

### 4. Página de Prueba: `/app/test-dollar-rate/page.tsx`
- **Función**: Interfaz para probar la funcionalidad de obtención de tasa
- **Características**:
  - Botón para obtener tasa del BCV
  - Input para establecer tasa manual
  - Visualización de resultados
  - Ejemplos de conversión

## Cómo Funciona

### 1. Obtención Automática del BCV
```typescript
// El sistema intenta obtener la tasa del BCV automáticamente
const data = await fetchDollarRate();
if (data.success) {
    // Usar la tasa obtenida
    setDollarRate(data.rate);
}
```

### 2. Fallback Manual
```typescript
// Si falla la obtención automática, permite entrada manual
if (!data.success) {
    setShowManualInput(true); // Muestra interfaz manual
}
```

### 3. Web Scraping del BCV
El sistema utiliza múltiples selectores CSS para encontrar la tasa:
- `#dolar strong`
- `.recuadro strong`
- `div:contains("USD") strong`
- `strong` que contenga formato numérico

## Características Principales

### ✅ **Web Scraping Robusto**
- Múltiples selectores para mayor confiabilidad
- Headers HTTP que simulan navegador real
- Timeout de 10 segundos
- Logging detallado para debugging

### ✅ **Entrada Manual de Respaldo**
- Interfaz amigable para entrada manual
- Validación de datos de entrada
- Persistencia de tasa manual

### ✅ **Cálculo Automático**
- Conversión automática USD → Bs
- Redondeo a 2 decimales
- Actualización en tiempo real

### ✅ **Manejo de Errores**
- Notificaciones toast informativas
- Fallback automático a entrada manual
- Logging de errores para debugging

### ✅ **Interfaz Mejorada**
- Indicador visual de fuente de tasa (BCV/Manual)
- Botones para cambiar entre automático y manual
- Validación en tiempo real

## Uso en Componentes

### Importar Utilidades
```typescript
import { fetchDollarRate, setManualDollarRate, convertUsdToBs } from "@/lib/dollar-rate";
```

### Obtener Tasa
```typescript
const data = await fetchDollarRate();
if (data.success) {
    console.log(`Tasa: ${data.rate} Bs/$`);
}
```

### Convertir Monedas
```typescript
const bsAmount = convertUsdToBs(100, dollarRate); // $100 USD a Bs
```

## Configuración de Dependencias

### Instaladas
```bash
npm install cheerio axios
```

### Tipos (si es necesario)
```bash
npm install --save-dev @types/cheerio
```

## Testing

### Página de Prueba
Visita `/test-dollar-rate` para probar la funcionalidad:
1. Hacer clic en "Obtener Tasa del BCV"
2. Verificar que se obtiene la tasa correcta
3. Probar entrada manual si es necesario

### API Directa
```bash
# GET - Obtener tasa del BCV
curl http://localhost:3000/api/dollar-rate

# POST - Establecer tasa manual
curl -X POST http://localhost:3000/api/dollar-rate \
  -H "Content-Type: application/json" \
  -d '{"rate": 36.25}'
```

## Solución de Problemas

### 1. Error de CORS
- El scraping se hace del lado del servidor (API route)
- No hay problemas de CORS

### 2. BCV no disponible
- El sistema automáticamente ofrece entrada manual
- Se muestra notificación al usuario

### 3. Selectores no encuentran datos
- Se utilizan múltiples selectores de respaldo
- Se registra en logs para debugging

### 4. Tasa inválida
- Validación tanto en frontend como backend
- Mensajes de error claros al usuario

## Ventajas sobre la API Anterior

1. **Independencia**: No depende de APIs externas
2. **Confiabilidad**: Obtiene datos directamente del BCV
3. **Flexibilidad**: Permite entrada manual cuando sea necesario
4. **Mantenibilidad**: Código propio que se puede ajustar
5. **Sin costos**: No requiere suscripciones a APIs

## Mantenimiento

### Actualizar Selectores CSS
Si el BCV cambia su estructura HTML, actualizar en `/app/api/dollar-rate/route.ts`:
```typescript
// Agregar nuevos selectores aquí
let dolarElement = $('#nuevo-selector strong').first();
```

### Logs y Debugging
Los logs se pueden ver en la consola del servidor:
```bash
npm run dev
# Revisar logs en la terminal
```

## Consideraciones de Rendimiento

- **Cache**: Considerar implementar cache para evitar scraping excesivo
- **Rate Limiting**: El BCV podría implementar límites de requests
- **Timeout**: Configurado a 10 segundos para evitar bloqueos

## Próximas Mejoras

1. **Cache Redis**: Para evitar scraping frecuente
2. **Cron Job**: Actualización automática periódica
3. **Múltiples Fuentes**: Agregar fuentes alternativas
4. **Historial**: Guardar historial de tasas
5. **Notificaciones**: Alertas de cambios significativos
