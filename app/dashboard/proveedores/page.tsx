/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useUser } from '@/hooks/use-user';
import { Proveedor } from '@/interfaces/proveedor.interface';
import { deleteDocument, getCollection } from '@/lib/firebase';
import { orderBy } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { Plus, Search, Users, UserCheck } from 'lucide-react';
import { showToast } from 'nextjs-toast-notify';
import { useEffect, useState } from 'react';
import CreateUpdateProveedorForm from './components/create-update-proveedor.form';
import TableViewProveedores from './components/table-view-proveedores';

export default function ProveedoresPage() {
	const user = useUser();
	const [proveedores, setProveedores] = useState<Proveedor[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	const getProveedores = async () => {
		const path = `proveedores`;
		const query = [orderBy("nombre", "asc")];
		setIsLoading(true);
		try {
			const res = await getCollection(path, query) as Proveedor[];
			setProveedores(res);
		} catch (error) {
			console.error("Error fetching proveedores:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (user) getProveedores();
	}, [user]);

	const deleteProveedor = async (proveedor: Proveedor) => {
		const path = `proveedores/${proveedor.id}`;
		setIsLoading(true);
		try {
			await deleteDocument(path);
			showToast.success("El proveedor fue eliminado exitosamente");
			const newProveedores = proveedores.filter((i) => i.id !== proveedor.id);
			setProveedores(newProveedores);
		} catch (error: any) {
			showToast.error(error.message, { duration: 2500 });
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="space-y-6">
			{/* Header con título y búsqueda */}
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
				<div>
					<h1 className="text-3xl font-bold text-slate-900">
						<span className="bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
							Gestión de Proveedores
						</span>
					</h1>
					<p className="text-slate-600 mt-1">Administra y organiza tus proveedores</p>
				</div>

				<div className="flex items-center gap-3">
					{/* Barra de búsqueda */}
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
						<Input
							type="text"
							placeholder="Buscar proveedores..."
							className="pl-10 w-64"
						/>
					</div>

					{/* Botón para nuevo proveedor */}
					<CreateUpdateProveedorForm getProveedoresAction={getProveedores}>
						<Button type="button">
							<Plus className="w-4 h-4 mr-2" />
							Nuevo Proveedor
						</Button>
					</CreateUpdateProveedorForm>
				</div>
			</div>

			{/* Estadísticas rápidas */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{[
					{ title: 'Total Proveedores', value: isLoading ? '...' : proveedores.length.toString(), icon: Users, color: 'from-green-500 to-green-600' },
					{ title: 'Proveedores Activos', value: isLoading ? '...' : proveedores.filter(p => p.activo !== false).length.toString(), icon: UserCheck, color: 'from-blue-500 to-blue-600' },
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

			{/* Tabla de proveedores */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.4 }}
			>
				<Card className="bg-white/70 backdrop-blur-xl border border-slate-200 shadow-xl">
					<CardHeader>
						<CardTitle className="text-xl font-bold text-slate-900">
							<span className="bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
								Lista de Proveedores
							</span>
						</CardTitle>
						<CardDescription className="text-slate-600">
							Gestiona todos los proveedores registrados
						</CardDescription>
					</CardHeader>
					<CardContent>
						<TableViewProveedores
							proveedores={proveedores}
							deleteProveedor={deleteProveedor}
							getProveedoresAction={getProveedores}
							isLoading={isLoading}
						/>
					</CardContent>
				</Card>
			</motion.div>
		</div>
	);
}
