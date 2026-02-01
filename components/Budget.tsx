import React, { useMemo } from 'react';
import { Wallet, Info } from 'lucide-react';
import { ItineraryItem } from '../types';

interface BudgetProps {
    itinerary: ItineraryItem[];
}

export const Budget: React.FC<BudgetProps> = ({ itinerary }) => {
    const COLORS = ['#1e3a8a', '#be123c', '#d97706', '#64748b'];
    const paidActivities = useMemo(() => itinerary.filter(a => a.priceEUR > 0), [itinerary]);
    const total = useMemo(() => paidActivities.reduce((acc, curr) => acc + curr.priceEUR, 0), [paidActivities]);

    return (
        <div className="pb-24 px-4 pt-6 max-w-lg mx-auto h-full overflow-y-auto no-scrollbar">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-blue-900 flex items-center uppercase tracking-tight">
            <Wallet className="mr-2" /> Gastos
            </h2>
        </div>

        <div className="bg-gradient-to-br from-blue-800 to-blue-950 rounded-[2rem] p-6 text-white shadow-xl mb-8 border-2 border-white/10 relative overflow-hidden">
            <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-amber-400/20 rounded-full blur-2xl"></div>
            <p className="text-blue-100 text-xs mb-1 uppercase tracking-widest font-black opacity-80">Presupuesto Escala</p>
            <div className="text-4xl font-black">€{total}</div>
            <p className="text-[10px] text-blue-100 mt-4 flex items-center font-bold uppercase tracking-tighter opacity-70">
            <Info size={14} className="mr-1 text-amber-400"/> Incluye transporte Cruise Bus y Metro T-Familiar.
            </p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-blue-50 mb-8 overflow-hidden">
            <h3 className="px-5 py-4 border-b border-blue-50 font-black text-xs text-slate-800 uppercase tracking-widest bg-slate-50/50">Desglose Barcelona</h3>
            {paidActivities.map((act, index) => (
            <div key={act.id} className="flex justify-between items-center p-5 border-b border-slate-50 last:border-0">
                <div className="flex items-center">
                <div className="w-2.5 h-2.5 rounded-full mr-3" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <div>
                    <p className="text-sm font-bold text-slate-800">{act.title}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">{act.type}</p>
                </div>
                </div>
                <div className="font-black text-blue-900">€{act.priceEUR}</div>
            </div>
            ))}
        </div>
        </div>
    );
};