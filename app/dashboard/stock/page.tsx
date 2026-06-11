/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/hooks/use-user';
import { Productos } from '@/interfaces/productos.interface';
import { StockMovimiento } from '@/interfaces/stock.interface';
import { getCollection } from '@/lib/firebase';
import { orderBy } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Plus, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import CreateMovimientoStockForm from './components/create-movimiento-stock.form';
import TableViewStock from './components/table-view-stock';

export default function StockPage() {
	const user = useUser();
	const [movimientos, setMovimientos] = useState<StockMovimiento[]>([]);
	const [productos, setProductos] = useState<Productos[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	const getMovimientos = async () => {
		const path = `stock_movimientos`;
		const query = [orderBy("fecha", "desc")];
		setIsLoading(true);
		try {
			const res = await getCollection(path, query) as StockMovimiento[];
			setMovimientos(res);
		} catch (error) {
			console.error("Error fetching movimientos:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const getProductos = async () => {
		const path = `productos`;
		const query = [orderBy("nombre", "asc")];
		try {
			const res = await getCollection(path, query) as Productos[];
			setProductos(res);
		} catch (error) {
			console.error("Error fetching productos:", error);
		}
	};

	useEffect(() => {
		if (user) {
			getMovimientos();
			getProductos();
		}
	}, [user]);

	// Para el select del formulario
	const productosForForm = productos
		.filter((prod): prod is Productos => typeof prod.id === 'string' && prod.id !== undefined)
		.map(prod => ({ id: prod.id as string, nombre: prod.nombre }));

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
				<div>
					<h1 className="text-3xl font-bold text-slate-900">
						<span className="bg-gradient-to-r from-yellow-600 to-orange-700 bg-clip-text text-transparent">
							Movimientos de Stock
						</span>
					</h1>
					<p className="text-slate-600 mt-1">Registra y consulta entradas y salidas de inventario</p>
				</div>
				<div className="flex items-center gap-3">
					<CreateMovimientoStockForm productos={productosForForm} getMovimientosAction={getMovimientos}>
						<Button type="button">
							<Plus className="w-4 h-4 mr-2" />
							Nuevo Movimiento
						</Button>
					</CreateMovimientoStockForm>
				</div>
			</div>

			{/* Estadísticas rápidas */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{[
					{ title: 'Total Movimientos', value: isLoading ? '...' : movimientos.length.toString(), icon: TrendingUp, color: 'from-yellow-500 to-orange-600' },
					{ title: 'Entradas', value: isLoading ? '...' : movimientos.filter(m => m.tipo === 'entrada').length.toString(), icon: Plus, color: 'from-green-500 to-green-600' },
				].map((stat, index) => (
					<motion.div
						key={index}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.1 }}
						whileHover={{ scale: 1.02, y: -2 }}
					>
						<Card className="bg-white/70 backdrop-blur-xl border border-slate-200 shadow-lg">
							<CardContent className="p-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-slate-600 font-medium">{stat.title}</p>
										<p className="text-2xl font-bold text-slate-900">{stat.value}</p>
									</div>
									<div className={`p-3 bg-gradient-to-r ${stat.color} rounded-xl shadow-lg`}>
										<stat.icon className="w-6 h-6 text-white" />
									</div>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				))}
			</div>

			{/* Tabla de movimientos */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.4 }}
			>
				<Card className="bg-white/70 backdrop-blur-xl border border-slate-200 shadow-xl">
					<CardHeader>
						<CardTitle className="text-xl font-bold text-slate-900">
							<span className="bg-gradient-to-r from-yellow-600 to-orange-700 bg-clip-text text-transparent">
								Lista de Movimientos
							</span>
						</CardTitle>
						<CardDescription className="text-slate-600">
							Consulta todos los movimientos de stock registrados
						</CardDescription>
					</CardHeader>
					<CardContent>
						<TableViewStock
							movimientos={movimientos}
							productos={productosForForm}
							isLoading={isLoading}
						/>
					</CardContent>
				</Card>
			</motion.div>
		</div>
	);
}
