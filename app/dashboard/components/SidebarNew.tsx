'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { gsap } from 'gsap';
import {
    Archive,
    BarChart3,
    Box,
    ChevronLeft,
    ChevronRight,
    DollarSign,
    FileText,
    LayoutDashboard,
    LogOut,
    Package,
    Plus,
    Settings,
    ShoppingBag,
    ShoppingCart,
    Star,
    TrendingUp,
    UserCheck,
    Users,
    Zap
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { sigOutAccount } from '../../../lib/firebase';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  route?: string;
  submenu?: MenuItem[];
}

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className = '' }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      route: '/dashboard'
    },
    {
      id: 'inventory',
      label: 'Inventario',
      icon: Package,
      badge: '24',
      submenu: [
        { id: 'products', label: 'Productos', icon: Box, route: '/dashboard/productos' },
        { id: 'categories', label: 'Categorías', icon: Archive, route: '/dashboard/categoria' },
        { id: 'stock', label: 'Stock', icon: FileText, route: '/dashboard/stock' },
        { id: 'suppliers', label: 'Proveedores', icon: Users, route: '/dashboard/proveedores' }
      ]
    },
    {
      id: 'sales',
      label: 'Ventas',
      icon: ShoppingCart,
      badge: '12',
      submenu: [
        { id: 'new-sale', label: 'Nueva Venta', icon: Plus, route: '/dashboard/nueva-venta' },
        { id: 'orders', label: 'Pedidos', icon: ShoppingBag, route: '/dashboard/pedidos' },
        { id: 'invoices', label: 'Facturas', icon: FileText, route: '/dashboard/facturas' },
        { id: 'customers', label: 'Clientes', icon: UserCheck, route: '/dashboard/clientes' }
      ]
    },
    {
      id: 'analytics',
      label: 'Análisis',
      icon: TrendingUp,
      submenu: [
        { id: 'reports', label: 'Reportes', icon: BarChart3, route: '/dashboard/reportes' },
        { id: 'revenue', label: 'Ingresos', icon: DollarSign, route: '/dashboard/ingresos' },
        { id: 'performance', label: 'Rendimiento', icon: Star, route: '/dashboard/rendimiento' }
      ]
    },
    {
      id: 'users',
      label: 'Usuarios',
      icon: Users,
      route: '/dashboard/usuarios'
    },
    {
      id: 'settings',
      label: 'Configuración',
      icon: Settings,
      route: '/dashboard/configuracion'
    }
  ];

  useEffect(() => {
    // Animación de entrada épica para el sidebar
    const ctx = gsap.context(() => {
      gsap.fromTo(sidebarRef.current,
        { x: -300, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      );

      // Animación de los items del menú
      gsap.fromTo(".menu-item",
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, stagger: 0.1, delay: 0.3, ease: "power2.out" }
      );
    }, sidebarRef);

    return () => ctx.revert();
  }, []);

  // Detectar ruta activa
  useEffect(() => {
    const currentPath = pathname;
    
    // Buscar en items principales
    const mainItem = menuItems.find(item => item.route === currentPath);
    if (mainItem) {
      setActiveMenu(mainItem.id);
      setActiveSubmenu(null);
      return;
    }

    // Buscar en subitems
    for (const item of menuItems) {
      if (item.submenu) {
        const subItem = item.submenu.find(sub => sub.route === currentPath);
        if (subItem) {
          setActiveMenu(item.id);
          setActiveSubmenu(item.id);
          return;
        }
      }
    }
  }, [pathname]);

  const handleMenuClick = (menuId: string, route?: string) => {
    const menuItem = menuItems.find(item => item.id === menuId);
    
    if (route) {
      router.push(route);
    }
    
    if (menuItem?.submenu) {
      setActiveSubmenu(activeSubmenu === menuId ? null : menuId);
    } else {
      setActiveSubmenu(null);
    }
    
    setActiveMenu(menuId);
  };

  const handleSubMenuClick = (route: string) => {
    router.push(route);
  };

  return (
    <motion.div
      ref={sidebarRef}
      className={`relative z-10 bg-white/80 backdrop-blur-2xl border-r border-gray-200/50 shadow-2xl transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-72'
      } ${className}`}
    >
      {/* Header del Sidebar */}
      <div className="p-6 border-b border-gray-200/50">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Yei Project</h1>
                <p className="text-xs text-gray-500">Sistema de Inventario</p>
              </div>
            </motion.div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-600 hover:text-gray-800"
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Navegación */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <div key={item.id} className="menu-item">
            <motion.div
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              className="w-full"
            >
              <Button
                variant={activeMenu === item.id ? "secondary" : "ghost"}
                onClick={() => handleMenuClick(item.id, item.route)}
                className={`w-full justify-start gap-3 h-auto p-3 ${
                  activeMenu === item.id
                    ? 'bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-purple-500/20 text-gray-800 shadow-lg shadow-purple-500/5'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
                }`}
              >
                <item.icon className={`w-5 h-5 ${activeMenu === item.id ? 'text-purple-600' : 'group-hover:text-purple-600'} transition-colors`} />
                
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left font-medium">{item.label}</span>
                    {item.badge && (
                      <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs shadow-lg">
                        {item.badge}
                      </Badge>
                    )}
                    {item.submenu && (
                      <motion.div
                        animate={{ rotate: activeSubmenu === item.id ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </motion.div>
                    )}
                  </>
                )}
              </Button>
            </motion.div>

            {/* Submenu */}
            <AnimatePresence>
              {!isCollapsed && item.submenu && activeSubmenu === item.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="ml-8 mt-2 space-y-1 border-l border-purple-500/30 pl-4"
                >
                  {item.submenu.map((subItem) => (
                    <motion.div
                      key={subItem.id}
                      whileHover={{ scale: 1.02, x: 3 }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`w-full justify-start gap-2 hover:bg-gray-100 ${
                          pathname === subItem.route 
                            ? 'text-purple-600 bg-purple-50' 
                            : 'text-gray-500 hover:text-gray-800'
                        }`}
                        onClick={() => handleSubMenuClick(subItem.route!)}
                      >
                        <subItem.icon className="w-4 h-4" />
                        <span>{subItem.label}</span>
                      </Button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>

      {/* Footer del Sidebar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200/50">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="destructive"
            className="w-full justify-start gap-3 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200"
            onClick={async () => {
              await sigOutAccount();
              router.push('/auth');
            }}
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span className="font-medium">Cerrar Sesión</span>}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
