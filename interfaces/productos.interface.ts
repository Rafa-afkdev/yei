import { Timestamp } from "firebase/firestore";

export interface Productos {
    id?: string;
    nombre: string;
    descripcion: string;
    precio_compra_usd: number;
    precio_compra_bs: number;
    precio_venta_usd: number;
    precio_venta_bs: number;
    categoriaId: string;
    stock_actual: number;
    stock_minimo: number;
    activa: boolean;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}