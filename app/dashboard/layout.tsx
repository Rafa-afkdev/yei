
'use client';

import { motion } from 'framer-motion';
import React from 'react';
import Sidebar from './components/Sidebar';

export default function LayoutDashboard({children} : {children: React.ReactNode}) {
  
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100'>
        {/* Sidebar */}
        <Sidebar/>
        
        {/* Main Content */}
        <div className="ml-72 flex flex-col min-h-screen">
            {/* Header */}
            <motion.header 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/70 backdrop-blur-xl border-b border-slate-200 shadow-sm px-6 py-4"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">
                            <span className="bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                                Dashboard
                            </span>
                        </h2>
                        <p className="text-slate-600 text-sm">Bienvenido de vuelta</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-purple-800 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white font-semibold text-sm">YP</span>
                        </div>
                    </div>
                </div>
            </motion.header>
            
            {/* Content */}
            <main className='flex-1'>
                <div className='p-6 bg-gradient-to-br from-slate-50/50 via-white/50 to-slate-100/50 min-h-full'>
                    {children}
                </div>
            </main>
        </div>
    </div>
  )
}
