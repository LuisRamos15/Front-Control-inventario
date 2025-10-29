export type AlertLevel = 'CRITICA' | 'ADVERTENCIA' | 'INFO';

export type AlertStatus = 'NUEVA' | 'RECONOCIDA' | 'RESUELTA';

export interface Alerta {
  id: string;
  mensaje: string;
  productoNombre: string;
  sku: string;
  stock: number;
  minimo: number;
  nivel: AlertLevel;
  fecha: string;
  status?: AlertStatus;
  createdAt?: string;
  resolvedAt?: string;
}