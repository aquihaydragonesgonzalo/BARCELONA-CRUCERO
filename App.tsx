import React, { useState, useEffect } from 'react';
import { 
    CalendarClock, Map as MapIcon, Wallet, BookOpen, Anchor, 
    Headphones, X, Play, Square, Navigation 
} from 'lucide-react';
import { Timeline } from './components/Timeline';
import { Budget } from './components/Budget';
import { Guide } from './components/Guide';
import { MapComponent } from './components/MapComponent';
import { INITIAL_ITINERARY, SHIP_ONBOARD_TIME } from './constants';
import { ItineraryItem, UserLocation, Coords } from './types';

const App: React.FC = () => {
    const [itinerary, setItinerary] = useState<ItineraryItem[]>(INITIAL_ITINERARY);
    const [activeTab, setActiveTab] = useState<'timeline' | 'map' | 'budget' | 'guide'>('timeline');
    const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
    const [mapFocus, setMapFocus] = useState<Coords | null>(null);
    const [countdown, setCountdown] = useState('00h 00m 00s');
    const [audioGuideActivity, setAudioGuideActivity] = useState<ItineraryItem | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

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

    return (
        <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
            {/* Header */}
            <header className="bg-blue-950 text-white p-4 shadow-xl z-20 flex justify-between items-center shrink-0">
                <div className="flex items-center">
                    <Anchor className="mr-3 text-amber-500" size={24} />
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