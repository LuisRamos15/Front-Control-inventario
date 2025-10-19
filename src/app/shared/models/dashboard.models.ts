export interface Resumen {
  totalProductos: number;
  totalMovimientos: number;
  totalEntradas: number;
  totalSalidas: number;
}

export interface MovimientoDia {
  fecha: string;
  cantidad: number;
}

export interface TopProducto {
  nombre: string;
  cantidad: number;
}