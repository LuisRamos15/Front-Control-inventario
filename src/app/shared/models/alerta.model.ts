export interface AlertaEvent {
  mensaje: string;
  productoNombre: string;
  sku: string;
  stock: number;
  minimo: number;
  nivel: 'STOCK_BAJO' | 'STOCK_CRITICO' | string;
  fecha: string; 
}

