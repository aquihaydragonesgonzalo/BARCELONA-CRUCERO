import React, { useState, useEffect, useMemo } from 'react';
import { Wallet, Info, Plus, X, Save, Trash2, ShoppingBag, Coffee, Car, Star, Tag } from 'lucide-react';
import { ItineraryItem } from '../types';

interface BudgetProps {
    itinerary: ItineraryItem[];
}

interface CustomExpense {
    id: string;
    title: string;
    price: number;
    category: 'shopping' | 'food' | 'transport' | 'other';
    timestamp: number;
}

export const Budget: React.FC<BudgetProps> = ({ itinerary }) => {
    const COLORS = ['#1e3a8a', '#be123c', '#d97706', '#64748b'];
    
    // Load custom expenses from local storage
    const [customExpenses, setCustomExpenses] = useState<CustomExpense[]>(() => {
        try {
            const saved = localStorage.getItem('barcelona_custom_expenses');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newItem, setNewItem] = useState({
        title: '',
        price: '',
        category: 'food' as CustomExpense['category']
    });

    // Save to local storage whenever customExpenses changes
    useEffect(() => {
        localStorage.setItem('barcelona_custom_expenses', JSON.stringify(customExpenses));
    }, [customExpenses]);

    const paidActivities = useMemo(() => itinerary.filter(a => a.priceEUR > 0), [itinerary]);
    const itineraryTotal = useMemo(() => paidActivities.reduce((acc, curr) => acc + curr.priceEUR, 0), [paidActivities]);
    const customTotal = useMemo(() => customExpenses.reduce((acc, curr) => acc + curr.price, 0), [customExpenses]);
    const grandTotal = itineraryTotal + customTotal;

    const handleAddExpense = () => {
        if (!newItem.title || !newItem.price) return;
        
        const expense: CustomExpense = {
            id: Date.now().toString(),
            title: newItem.title,
            price: parseFloat(newItem.price),
            category: newItem.category,
            timestamp: Date.now()
        };

        setCustomExpenses(prev => [...prev, expense]);
        setNewItem({ title: '', price: '', category: 'food' });
        setIsModalOpen(false);
    };

    const handleDeleteExpense = (id: string) => {
        setCustomExpenses(prev => prev.filter(item => item.id !== id));
    };

    const getCategoryIcon = (cat: string) => {
        switch(cat) {
            case 'food': return <Coffee size={14} />;
            case 'shopping': return <ShoppingBag size={14} />;
            case 'transport': return <Car size={14} />;
            default: return <Star size={14} />;
        }
    };

    const getCategoryLabel = (cat: string) => {
        switch(cat) {
            case 'food': return 'Comida';
            case 'shopping': return 'Compras';
            case 'transport': return 'Transporte';
            default: return 'Otro';
        }
    };

    return (
        <div className="pb-24 px-4 pt-6 max-w-lg mx-auto h-full overflow-y-auto no-scrollbar relative">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-blue-900 flex items-center uppercase tracking-tight">
                <Wallet className="mr-2" /> Gastos
                </h2>
            </div>

            {/* Total Card */}
            <div className="bg-gradient-to-br from-blue-800 to-blue-950 rounded-[2rem] p-6 text-white shadow-xl mb-8 border-2 border-white/10 relative overflow-hidden transition-all">
                <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-amber-400/20 rounded-full blur-2xl"></div>
                <div className="relative z-10">
                    <p className="text-blue-100 text-xs mb-1 uppercase tracking-widest font-black opacity-80">Presupuesto Total</p>
                    <div className="text-4xl font-black mb-1">€{grandTotal.toFixed(2)}</div>
                    
                    <div className="flex gap-4 mt-4 pt-4 border-t border-white/10">
                        <div>
                            <span className="block text-[9px] text-blue-300 uppercase tracking-widest">Itinerario</span>
                            <span className="font-bold text-sm">€{itineraryTotal.toFixed(2)}</span>
                        </div>
                        <div>
                            <span className="block text-[9px] text-blue-300 uppercase tracking-widest">Extras</span>
                            <span className="font-bold text-sm text-amber-400">€{customTotal.toFixed(2)}</span>
                        </div>
                    </div>

                    <p className="text-[10px] text-blue-100 mt-4 flex items-center font-bold uppercase tracking-tighter opacity-70">
                    <Info size={14} className="mr-1 text-amber-400"/> Incluye gastos fijos y añadidos.
                    </p>
                </div>
            </div>

            {/* Official Itinerary Breakdown */}
            <div className="bg-white rounded-3xl shadow-sm border border-blue-50 mb-8 overflow-hidden">
                <h3 className="px-5 py-4 border-b border-blue-50 font-black text-xs text-slate-800 uppercase tracking-widest bg-slate-50/50">Gastos Itinerario</h3>
                {paidActivities.length === 0 ? (
                    <div className="p-5 text-center text-slate-400 text-sm italic">No hay gastos programados.</div>
                ) : (
                    paidActivities.map((act, index) => (
                    <div key={act.id} className="flex justify-between items-center p-5 border-b border-slate-50 last:border-0">
                        <div className="flex items-center">
                        <div className="w-2.5 h-2.5 rounded-full mr-3 shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <div>
                            <p className="text-sm font-bold text-slate-800 leading-tight">{act.title}</p>
                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">{act.type}</p>
                        </div>
                        </div>
                        <div className="font-black text-blue-900 shrink-0">€{act.priceEUR.toFixed(2)}</div>
                    </div>
                    ))
                )}
            </div>

            {/* Custom Expenses Breakdown */}
            <div className="bg-white rounded-3xl shadow-sm border border-blue-50 mb-20 overflow-hidden">
                <h3 className="px-5 py-4 border-b border-blue-50 font-black text-xs text-slate-800 uppercase tracking-widest bg-slate-50/50 flex justify-between items-center">
                    <span>Mis Gastos Extra</span>
                    <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">{customExpenses.length}</span>
                </h3>
                
                {customExpenses.length === 0 ? (
                    <div className="p-8 text-center flex flex-col items-center">
                        <div className="bg-slate-100 p-3 rounded-full mb-3 text-slate-300">
                            <Tag size={24} />
                        </div>
                        <p className="text-slate-400 text-sm font-medium">Añade tus gastos personales aquí.</p>
                        <p className="text-slate-300 text-xs mt-1">Comidas, souvenirs, taxis...</p>
                    </div>
                ) : (
                    customExpenses.map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-5 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="bg-amber-100 text-amber-700 p-2 rounded-xl shrink-0">
                                    {getCategoryIcon(item.category)}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-slate-800 truncate">{item.title}</p>
                                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">{getCategoryLabel(item.category)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <span className="font-black text-slate-800">€{item.price.toFixed(2)}</span>
                                <button 
                                    onClick={() => handleDeleteExpense(item.id)}
                                    className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Floating Action Button */}
            <div className="fixed bottom-24 right-6 z-20">
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-900 text-white p-4 rounded-2xl shadow-xl shadow-blue-900/30 hover:scale-105 active:scale-95 transition-all border border-blue-800 flex items-center justify-center"
                >
                    <Plus size={28} />
                </button>
            </div>

            {/* Add Expense Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-6 animate-in slide-in-from-bottom-10 duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-black text-lg text-blue-900 uppercase tracking-tight">Nuevo Gasto</h3>
                            <button onClick={() => setIsModalOpen(false)} className="bg-slate-100 p-2 rounded-full text-slate-500 hover:bg-slate-200 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Concepto</label>
                                <input 
                                    type="text" 
                                    placeholder="Ej: Tapas, Imán, Taxi..."
                                    value={newItem.title}
                                    onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Precio (€)</label>
                                <input 
                                    type="number" 
                                    inputMode="decimal"
                                    placeholder="0.00"
                                    value={newItem.price}
                                    onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Categoría</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {[
                                        { id: 'food', icon: Coffee, label: 'Comida' },
                                        { id: 'shopping', icon: ShoppingBag, label: 'Compras' },
                                        { id: 'transport', icon: Car, label: 'Transp.' },
                                        { id: 'other', icon: Star, label: 'Otro' }
                                    ].map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setNewItem({...newItem, category: cat.id as any})}
                                            className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                                                newItem.category === cat.id 
                                                ? 'bg-blue-100 border-blue-200 text-blue-800' 
                                                : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
                                            }`}
                                        >
                                            <cat.icon size={18} className="mb-1" />
                                            <span className="text-[9px] font-black uppercase">{cat.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handleAddExpense}
                            disabled={!newItem.title || !newItem.price}
                            className="w-full mt-8 bg-blue-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:shadow-none active:scale-95 transition-all"
                        >
                            <Save size={18} /> Guardar Gasto
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};