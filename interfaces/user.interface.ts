import { Timestamp } from "firebase/firestore";

export interface User {
    uid: string;
    email: string;
    password?: string;
    nombre?: string;
    apellido?: string;
    telefono?: string;
    rol: string;
    image?: string;
    createAt?: Timestamp;
}