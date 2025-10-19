/***************************************************************************************************
 * Polyfills de Node para el navegador (Angular 15+ ya no los agrega automáticamente)
 * IMPORTANTE: No modificar otra parte del proyecto.
 **************************************************************************************************/

// Polyfill global
(window as any).global = window;

// Polyfill process
(window as any).process = { env: {} };

// Polyfill Buffer
import { Buffer } from 'buffer';
(window as any).Buffer = Buffer;