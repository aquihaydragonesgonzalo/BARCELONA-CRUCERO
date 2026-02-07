import React, { useState, useEffect, useRef } from 'react';
import { 
    CalendarClock, Map as MapIcon, Wallet, BookOpen, Anchor, 
    Headphones, X, Play, Square, Navigation, Settings, Bell, BellRing, Clock, MapPin, Save, AlignLeft 
} from 'lucide-react';
import { Timeline } from './components/Timeline';
import { Budget } from './components/Budget';
import { Guide } from './components/Guide';
import { MapComponent } from './components/MapComponent';
import { INITIAL_ITINERARY, SHIP_ONBOARD_TIME } from './constants';
import { ItineraryItem, UserLocation, Coords, NotificationSettings, CustomWaypoint } from './types';

const App: React.FC = () => {
    const [itinerary, setItinerary] = useState<ItineraryItem[]>(INITIAL_ITINERARY);
    const [activeTab, setActiveTab] = useState<'timeline' | 'map' | 'budget' | 'guide'>('timeline');
    const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
    const [mapFocus, setMapFocus] = useState<Coords | null>(null);
    const [countdown, setCountdown] = useState('00h 00m 00s');
    const [audioGuideActivity, setAudioGuideActivity] = useState<ItineraryItem | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    
    // Notification State
    const [showSettings, setShowSettings] = useState(false);
    const [sentNotifications, setSentNotifications] = useState<Set<string>>(new Set());
    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => {
        try {
            const saved = localStorage.getItem('barcelona_notification_settings');
            return saved ? JSON.parse(saved) : {
                enabled: false,
                activityAlerts: true,
                criticalAlerts: true,
                minutesBefore: 15
            };
        } catch {
            return { enabled: false, activityAlerts: true, criticalAlerts: true, minutesBefore: 15 };
        }
    });

    // Custom Waypoints State
    const [customWaypoints, setCustomWaypoints] = useState<CustomWaypoint[]>(() => {
        try {
            const saved = localStorage.getItem('barcelona_custom_waypoints');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const [isAddWaypointModalOpen, setIsAddWaypointModalOpen] = useState(false);
    const [newWaypointCoords, setNewWaypointCoords] = useState<Coords | null>(null);
    const [newWaypointTitle, setNewWaypointTitle] = useState('');
    const [newWaypointDescription, setNewWaypointDescription] = useState('');

    // Save Settings & Waypoints
    useEffect(() => {
        localStorage.setItem('barcelona_notification_settings', JSON.stringify(notificationSettings));
    }, [notificationSettings]);

    useEffect(() => {
        localStorage.setItem('barcelona_custom_waypoints', JSON.stringify(customWaypoints));
    }, [customWaypoints]);

    // Request Permissions
    const requestNotificationPermission = async () => {
        if (!('Notification' in window)) return;
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            setNotificationSettings(prev => ({ ...prev, enabled: true }));
            new Notification("Notificaciones Activas", { 
                body: "Te avisaremos de los eventos importantes de tu escala.",
                icon: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgTO8Unw1Rh2yVa2JGn5EqDKRRzmCWqYcp-Cfs83S-XE510ErtaNkBMj73Ucv0qXmgv_7NJRKH6olpiE1Bf4uBBln1jiHfaAKuk_RgrVaISXO1K6HJwZ30r8SqkyV1f7eCCLVlb1UXAry6yfi7k2rNhmJzjYjrE3jBwxFN5462NoLZRPU67Z792PDZUr2o/s192/Gemini_Generated_Image_gn7f5hgn7f5hgn7f.png"
            });
        }
    };

    // Notification Check Loop
    useEffect(() => {
        if (!notificationSettings.enabled || Notification.permission !== 'granted') return;

        const checkInterval = setInterval(() => {
            const now = new Date();
            
            itinerary.forEach(item => {
                // Prevent duplicate alerts
                if (sentNotifications.has(item.id) || item.completed) return;

                const [h, m] = item.startTime.split(':').map(Number);
                const itemTime = new Date();
                itemTime.setHours(h, m, 0, 0);

                const diffMinutes = (itemTime.getTime() - now.getTime()) / (1000 * 60);

                // Check Trigger Conditions
                const isCritical = item.notes === 'CRITICAL';
                const timeWindow = notificationSettings.minutesBefore; // e.g. 15 mins

                let shouldNotify = false;
                let title = "";
                let body = "";

                // Logic: Notify if within window (e.g., between 14 and 15 mins remaining) 
                // Using a range prevents missing the exact millisecond match
                if (diffMinutes > 0 && diffMinutes <= timeWindow) {
                    if (isCritical && notificationSettings.criticalAlerts) {
                        shouldNotify = true;
                        title = `⚠️ IMPORTANTE: ${item.title}`;
                        body = `Quedan ${Math.ceil(diffMinutes)} min. ${item.keyDetails}`;
                    } else if (notificationSettings.activityAlerts && !isCritical) {
                        shouldNotify = true;
                        title = `Próximo: ${item.title}`;
                        body = `Comienza a las ${item.startTime}. ${item.locationName}`;
                    }
                }

                if (shouldNotify) {
                    new Notification(title, { 
                        body, 
                        icon: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgTO8Unw1Rh2yVa2JGn5EqDKRRzmCWqYcp-Cfs83S-XE510ErtaNkBMj73Ucv0qXmgv_7NJRKH6olpiE1Bf4uBBln1jiHfaAKuk_RgrVaISXO1K6HJwZ30r8SqkyV1f7eCCLVlb1UXAry6yfi7k2rNhmJzjYjrE3jBwxFN5462NoLZRPU67Z792PDZUr2o/s192/Gemini_Generated_Image_gn7f5hgn7f5hgn7f.png",
                        vibrate: [200, 100, 200]
                    } as any);
                    setSentNotifications(prev => new Set(prev).add(item.id));
                }
            });
        }, 30000); // Check every 30 seconds

        return () => clearInterval(checkInterval);
    }, [notificationSettings, itinerary, sentNotifications]);

    // Countdown Timer Logic
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const [hours, minutes] = SHIP_ONBOARD_TIME.split(':').map(Number);
            const target = new Date();
            target.setHours(hours, minutes, 0, 0);
            
            // Adjust if target is "tomorrow" relative to now in real usage logic if time passed, 
            // but for simple day-of usage:
            const diff = target.getTime() - now.getTime();
            
            if (diff <= 0) {
                setCountdown("¡A BORDO!");
            } else {
                const h = Math.floor(diff / (1000 * 60 * 60));
                const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const s = Math.floor((diff % (1000 * 60)) / 1000);
                setCountdown(`${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Geolocation Logic
    useEffect(() => {
        if ('geolocation' in navigator) {
            const watchId = navigator.geolocation.watchPosition(
                (pos) => setUserLocation({ 
                    lat: pos.coords.latitude, 
                    lng: pos.coords.longitude,
                    accuracy: pos.coords.accuracy
                }),
                (err) => console.log("GPS no disponible", err),
                { enableHighAccuracy: true, maximumAge: 1000 }
            );
            return () => navigator.geolocation.clearWatch(watchId);
        }
    }, []);

    const handleLocate = (coords: Coords) => { 
        setMapFocus(coords); 
        setActiveTab('map'); 
    };

    const handlePlayAudio = () => {
        if (!audioGuideActivity?.audioGuideText) return;
        if (isPlaying) {
            window.speechSynthesis.cancel();
            setIsPlaying(false);
        } else {
            const utterance = new SpeechSynthesisUtterance(audioGuideActivity.audioGuideText);
            utterance.lang = 'es-ES';
            utterance.rate = 0.95;
            utterance.onend = () => setIsPlaying(false);
            window.speechSynthesis.speak(utterance);
            setIsPlaying(true);
        }
    };

    const handleToggleComplete = (id: string) => { 
        setItinerary(itinerary.map(a => a.id === id ? {...a, completed: !a.completed} : a)); 
    };

    // Custom Waypoint Handlers
    const handleMapClickForWaypoint = (coords: Coords) => {
        setNewWaypointCoords(coords);
        setNewWaypointTitle('');
        setNewWaypointDescription('');
        setIsAddWaypointModalOpen(true);
    };

    const handleSaveWaypoint = () => {
        if (newWaypointCoords && newWaypointTitle) {
            const newWaypoint: CustomWaypoint = {
                id: Date.now().toString(),
                title: newWaypointTitle,
                description: newWaypointDescription,
                coords: newWaypointCoords,
                timestamp: Date.now()
            };
            setCustomWaypoints(prev => [...prev, newWaypoint]);
            setIsAddWaypointModalOpen(false);
            setNewWaypointCoords(null);
        }
    };

    const handleDeleteWaypoint = (id: string) => {
        setCustomWaypoints(prev => prev.filter(wp => wp.id !== id));
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
            {/* Header */}
            <header className="bg-blue-950 text-white p-4 shadow-xl z-20 flex justify-between items-center shrink-0">
                <div className="flex items-center">
                    <button onClick={() => setShowSettings(true)} className="mr-3 text-blue-300 hover:text-white transition-colors">
                         <Settings size={24} />
                    </button>
                    <div>
                        <h1 className="font-black text-[10px] uppercase tracking-[0.2em] text-blue-300">Escala Barcelona</h1>
                        <p className="text-[12px] font-bold text-white/90 leading-tight">12 Abril 2026</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {userLocation && (
                        <div className="flex items-center text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded-full border border-emerald-500/30">
                            <Navigation size={10} className="animate-pulse mr-1" />
                            <span className="text-[8px] font-black uppercase tracking-widest">GPS ON</span>
                        </div>
                    )}
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black uppercase text-amber-400 tracking-widest mb-0.5">Límite Embarque</span>
                        <div className="text-lg font-black font-mono text-white leading-none tracking-tighter">{countdown}</div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden relative">
                {activeTab === 'timeline' && (
                    <div className="h-full overflow-y-auto no-scrollbar">
                        <Timeline 
                            itinerary={itinerary} 
                            onToggleComplete={handleToggleComplete} 
                            onLocate={handleLocate} 
                            userLocation={userLocation} 
                            onOpenAudioGuide={(act) => setAudioGuideActivity(act)}
                        />
                    </div>
                )}
                {activeTab === 'map' && (
                    <MapComponent 
                        activities={itinerary} 
                        userLocation={userLocation} 
                        focusedLocation={mapFocus} 
                        customWaypoints={customWaypoints}
                        onAddWaypoint={handleMapClickForWaypoint}
                        onDeleteWaypoint={handleDeleteWaypoint}
                    />
                )}
                {activeTab === 'budget' && <Budget itinerary={itinerary} />}
                {activeTab === 'guide' && <Guide userLocation={userLocation} />}

                {/* Audio Guide Modal Overlay */}
                {audioGuideActivity && (
                    <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-blue-950/40 backdrop-blur-sm">
                        <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div className="bg-blue-100 p-3 rounded-2xl border border-blue-200">
                                    <Headphones size={24} className="text-blue-700" />
                                </div>
                                <button 
                                    onClick={() => { window.speechSynthesis.cancel(); setIsPlaying(false); setAudioGuideActivity(null); }} 
                                    className="text-slate-300 hover:text-slate-600 transition-colors"
                                >
                                    <X size={28} />
                                </button>
                            </div>
                            <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] mb-2">Audioguía</h3>
                            <h4 className="text-xl font-black text-slate-800 mb-6 leading-tight">{audioGuideActivity.title}</h4>
                            <div className="max-h-[300px] overflow-y-auto pr-2 custom-h-scrollbar mb-8">
                                <p className="text-slate-600 leading-relaxed font-medium italic">{audioGuideActivity.audioGuideText}</p>
                            </div>
                            <button 
                                onClick={handlePlayAudio} 
                                className={`w-full flex items-center justify-center gap-3 py-4 rounded-3xl font-black uppercase tracking-widest text-sm transition-all shadow-lg ${isPlaying ? 'bg-rose-600 text-white' : 'bg-blue-900 text-white'}`}
                            >
                                {isPlaying ? <Square size={18} fill="white" /> : <Play size={18} fill="white" />}
                                {isPlaying ? 'Detener' : 'Escuchar'}
                            </button>
                        </div>
                    </div>
                )}
                
                {/* Settings Modal */}
                {showSettings && (
                    <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-blue-950/40 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-6 animate-in slide-in-from-bottom-10 duration-300">
                             <div className="flex justify-between items-center mb-6">
                                <h3 className="font-black text-lg text-blue-900 uppercase tracking-tight flex items-center gap-2">
                                    <Settings size={20} /> Preferencias
                                </h3>
                                <button onClick={() => setShowSettings(false)} className="bg-slate-100 p-2 rounded-full text-slate-500 hover:bg-slate-200 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Master Switch */}
                                <div className={`p-4 rounded-2xl flex items-center justify-between border transition-colors ${notificationSettings.enabled ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-100 border-slate-200'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${notificationSettings.enabled ? 'bg-white/20' : 'bg-white text-slate-400'}`}>
                                            <BellRing size={20} className={notificationSettings.enabled ? 'text-white' : ''} />
                                        </div>
                                        <div>
                                            <p className={`text-sm font-bold ${notificationSettings.enabled ? 'text-white' : 'text-slate-900'}`}>Notificaciones</p>
                                            <p className={`text-[10px] leading-tight ${notificationSettings.enabled ? 'text-blue-100' : 'text-slate-500'}`}>
                                                {notificationSettings.enabled ? 'Activadas' : 'Desactivadas'}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={notificationSettings.enabled ? () => setNotificationSettings(p => ({...p, enabled: false})) : requestNotificationPermission} 
                                        className={`w-12 h-7 rounded-full transition-all relative ${notificationSettings.enabled ? 'bg-white/30' : 'bg-slate-300'}`}
                                    >
                                        <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full transition-transform shadow-sm ${notificationSettings.enabled ? 'translate-x-5' : ''}`}></div>
                                    </button>
                                </div>

                                {notificationSettings.enabled && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                                        
                                        {/* Event Types Group */}
                                        <div>
                                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Tipos de Alerta</h4>
                                            <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                                                {/* Critical */}
                                                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-rose-100 p-2 rounded-xl text-rose-600">
                                                            <Anchor size={18} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900">Eventos Críticos</p>
                                                            <p className="text-[10px] text-slate-500">Embarque, Shuttle, Horarios límite</p>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={() => setNotificationSettings(p => ({...p, criticalAlerts: !p.criticalAlerts}))}
                                                        className={`w-10 h-6 rounded-full transition-colors relative ${notificationSettings.criticalAlerts ? 'bg-rose-500' : 'bg-slate-200'}`}
                                                    >
                                                        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${notificationSettings.criticalAlerts ? 'translate-x-4' : ''}`}></div>
                                                    </button>
                                                </div>

                                                {/* General Activities */}
                                                <div className="flex items-center justify-between p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
                                                            <CalendarClock size={18} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900">Actividades</p>
                                                            <p className="text-[10px] text-slate-500">Inicio de visitas y paseos</p>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={() => setNotificationSettings(p => ({...p, activityAlerts: !p.activityAlerts}))}
                                                        className={`w-10 h-6 rounded-full transition-colors relative ${notificationSettings.activityAlerts ? 'bg-blue-500' : 'bg-slate-200'}`}
                                                    >
                                                        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${notificationSettings.activityAlerts ? 'translate-x-4' : ''}`}></div>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Timing Control */}
                                        <div>
                                            <div className="flex justify-between items-end mb-3 ml-1">
                                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Antelación</h4>
                                                <span className="text-xs font-black text-blue-900 bg-blue-100 px-2 py-0.5 rounded-md">{notificationSettings.minutesBefore} min</span>
                                            </div>
                                            
                                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                <input 
                                                    type="range" 
                                                    min="5" 
                                                    max="60" 
                                                    step="5"
                                                    value={notificationSettings.minutesBefore}
                                                    onChange={(e) => setNotificationSettings(p => ({...p, minutesBefore: parseInt(e.target.value)}))}
                                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mb-4"
                                                />
                                                <div className="flex justify-between gap-2">
                                                    {[5, 15, 30, 60].map(val => (
                                                        <button 
                                                            key={val}
                                                            onClick={() => setNotificationSettings(p => ({...p, minutesBefore: val}))}
                                                            className={`flex-1 py-2 rounded-xl text-[10px] font-bold transition-all ${
                                                                notificationSettings.minutesBefore === val 
                                                                ? 'bg-blue-600 text-white shadow-md' 
                                                                : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-100'
                                                            }`}
                                                        >
                                                            {val}m
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Waypoint Modal */}
                {isAddWaypointModalOpen && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                         <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-6 animate-in zoom-in-95 duration-200">
                             <div className="flex justify-between items-center mb-6">
                                <h3 className="font-black text-lg text-blue-900 uppercase tracking-tight flex items-center gap-2">
                                    <MapPin size={20} /> Nuevo Punto
                                </h3>
                                <button onClick={() => setIsAddWaypointModalOpen(false)} className="bg-slate-100 p-2 rounded-full text-slate-500 hover:bg-slate-200 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nombre del lugar</label>
                                <input 
                                    type="text" 
                                    placeholder="Ej: Tienda de souvenirs, Restaurante..."
                                    value={newWaypointTitle}
                                    onChange={(e) => setNewWaypointTitle(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300"
                                    autoFocus
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Descripción (Opcional)</label>
                                <textarea 
                                    placeholder="Ej: Tienen buenos precios, baño limpio..."
                                    value={newWaypointDescription}
                                    onChange={(e) => setNewWaypointDescription(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-600 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-300 resize-none h-24"
                                />
                            </div>

                            <button 
                                onClick={handleSaveWaypoint}
                                disabled={!newWaypointTitle.trim()}
                                className="w-full bg-blue-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:shadow-none active:scale-95 transition-all"
                            >
                                <Save size={18} /> Guardar Ubicación
                            </button>
                         </div>
                    </div>
                )}
            </main>

            {/* Navigation */}
            <nav className="bg-white/95 backdrop-blur-md border-t border-slate-100 z-30 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <div className="flex justify-around items-center h-20 px-2 pb-safe">
                    {[
                        { id: 'timeline', icon: CalendarClock, label: 'Itinerario' }, 
                        { id: 'map', icon: MapIcon, label: 'Mapa' }, 
                        { id: 'budget', icon: Wallet, label: 'Gastos' }, 
                        { id: 'guide', icon: BookOpen, label: 'Guía' }
                    ].map(tab => (
                        <button 
                            key={tab.id} 
                            onClick={() => setActiveTab(tab.id as any)} 
                            className={`flex flex-col items-center w-full justify-center transition-all ${activeTab === tab.id ? 'text-blue-900' : 'text-slate-400'}`}
                        >
                            <div className={`p-2 rounded-xl mb-1 ${activeTab === tab.id ? 'bg-blue-50 shadow-sm' : ''}`}>
                                <tab.icon size={22} />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </nav>
        </div>
    );
};

export default App;