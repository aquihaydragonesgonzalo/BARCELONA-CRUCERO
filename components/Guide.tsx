import React, { useState, useEffect } from 'react';
import { 
    Activity as ActivityIcon, Clock, Timer, Landmark, Footprints, 
    Navigation, Thermometer, Sun, Cloud, CloudRain, CloudLightning, 
    Wind, CalendarDays, PhoneCall, Send, Languages, Volume2, WifiOff, FileDown 
} from 'lucide-react';
import { jsPDF } from "jspdf";
import { PRONUNCIATIONS, INITIAL_ITINERARY, DATE_OF_VISIT } from '../constants';
import { UserLocation, WeatherData } from '../types';

interface GuideProps {
    userLocation: UserLocation | null;
}

export const Guide: React.FC<GuideProps> = ({ userLocation }) => {
    const [playing, setPlaying] = useState<string | null>(null);
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loadingWeather, setLoadingWeather] = useState(true);
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        const fetchWeather = async () => {
        try {
            const response = await fetch(
            'https://api.open-meteo.com/v1/forecast?latitude=41.38&longitude=2.17&hourly=temperature_2m,weathercode&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=Europe%2FMadrid'
            );
            
            if (!response.ok) throw new Error('Network error');
            
            const data = await response.json();
            if (data.error) throw new Error(data.error);

            setWeather({
                hourly: { time: data.hourly.time, temperature: data.hourly.temperature_2m, code: data.hourly.weathercode },
                daily: { time: data.daily.time, weathercode: data.daily.weathercode, temperature_2m_max: data.daily.temperature_2m_max, temperature_2m_min: data.daily.temperature_2m_min }
            });
            setIsOffline(false);
        } catch (error) { 
            console.error("Clima error:", error);
            setIsOffline(true);
        } finally { 
            setLoadingWeather(false); 
        }
        };
        fetchWeather();
    }, []);

    const playSimulatedAudio = (word: string) => {
        if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'ca-ES';
        utterance.rate = 0.85;
        setPlaying(word);
        utterance.onend = () => setPlaying(null);
        window.speechSynthesis.speak(utterance);
        }
    };

    const handleGeneratePDF = () => {
        const doc = new jsPDF();
        
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 20;
        const timeColWidth = 25;
        const contentX = margin + timeColWidth + 5;
        const contentWidth = pageWidth - contentX - margin;
        
        let y = 20;

        // Helper: Check for page break
        const checkPageBreak = (neededHeight: number) => {
            if (y + neededHeight > pageHeight - 20) {
                doc.addPage();
                y = 20;
                // Reprint simple header on new page
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text("Barcelona 2026 - Itinerario (Cont.)", margin, 10);
            }
        };

        // Header
        doc.setFontSize(22);
        doc.setTextColor(30, 58, 138); // Blue
        doc.setFont("helvetica", "bold");
        doc.text("BARCELONA 2026", margin, y);
        y += 8;
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.setFont("helvetica", "normal");
        doc.text(`Guía de Escala | ${DATE_OF_VISIT}`, margin, y);
        y += 15;

        // Separator
        doc.setDrawColor(30, 58, 138);
        doc.setLineWidth(0.5);
        doc.line(margin, y - 5, pageWidth - margin, y - 5);

        // Itinerary Loop
        INITIAL_ITINERARY.forEach((item, index) => {
            // Data Prep: Remove emojis that break standard PDF fonts
            const cleanTitle = item.title;
            const cleanDesc = item.description.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "");
            const cleanDetails = item.keyDetails.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "");
            const priceTxt = item.priceEUR > 0 ? `${item.priceEUR.toFixed(2)}€` : "GRATIS";
            
            // Calculate Heights (Text Wrapping)
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            const titleLines = doc.splitTextToSize(cleanTitle, contentWidth);
            
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            const descLines = doc.splitTextToSize(cleanDesc, contentWidth);
            const detailLines = doc.splitTextToSize(`TIP: ${cleanDetails}`, contentWidth);

            const titleH = titleLines.length * 5;
            const descH = descLines.length * 4;
            const detailH = detailLines.length * 4;
            const metaH = 5;
            const spacing = 8;
            
            const totalH = titleH + descH + detailH + metaH + spacing;

            checkPageBreak(totalH);

            // Left Col: Time
            doc.setFontSize(10);
            doc.setTextColor(30, 58, 138);
            doc.setFont("helvetica", "bold");
            doc.text(item.startTime, margin, y + 4);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.setFont("helvetica", "normal");
            doc.text(item.endTime, margin, y + 8);

            // Timeline graphics
            doc.setDrawColor(200);
            if (index < INITIAL_ITINERARY.length - 1) {
                doc.line(margin + 18, y + 2, margin + 18, y + totalH);
            }
            doc.setFillColor(30, 58, 138);
            doc.circle(margin + 18, y + 4, 1.5, 'F');

            // Right Col: Content
            // Title
            doc.setTextColor(0);
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text(titleLines, contentX, y + 4);
            let curY = y + 4 + titleH;

            // Meta (Location | Price)
            doc.setTextColor(100);
            doc.setFontSize(8);
            doc.setFont("helvetica", "bold");
            doc.text(`${item.locationName}  •  ${priceTxt}  •  ${item.type.toUpperCase()}`, contentX, curY - 1);
            curY += 4;

            // Desc
            doc.setTextColor(50);
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.text(descLines, contentX, curY);
            curY += descH;

            // Details
            doc.setTextColor(30, 58, 138);
            doc.setFont("helvetica", "italic");
            doc.text(detailLines, contentX, curY);

            // Contingency/Warning
            if (item.notes === 'CRITICAL' || item.contingencyNote) {
                curY += detailH + 2;
                doc.setTextColor(220, 38, 38); // Red
                doc.setFont("helvetica", "bold");
                const note = item.notes === 'CRITICAL' ? "⚠️ HORARIO CRÍTICO" : `⚠️ ${item.contingencyNote}`;
                // Strip emoji for PDF
                const cleanNote = note.replace(/⚠️/g, "(!)");
                doc.text(cleanNote, contentX, curY);
            }

            y += totalH;
        });

        // Page Numbers
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(`Página ${i} de ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        }

        doc.save("Barcelona2026_Itinerario.pdf");
    };

    const getWeatherIcon = (code: number, size = 20) => {
        if (code <= 1) return <Sun size={size} className="text-amber-500" />;
        if (code <= 3) return <Cloud size={size} className="text-slate-400" />;
        if (code <= 67) return <CloudRain size={size} className="text-blue-500" />;
        if (code <= 99) return <CloudLightning size={size} className="text-indigo-600" />;
        return <Wind size={size} className="text-slate-400" />;
    };

    const formatDayName = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date().toLocaleDateString();
        if (date.toLocaleDateString() === today) return "Hoy";
        return new Intl.DateTimeFormat('es-ES', { weekday: 'short' }).format(date);
    };

    return (
        <div className="pb-32 px-4 pt-6 max-w-lg mx-auto h-full overflow-y-auto no-scrollbar">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-blue-900 uppercase tracking-tight">Guía Barcelona</h2>
            <button 
                onClick={handleGeneratePDF}
                className="flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-blue-200 transition-colors shadow-sm active:scale-95"
            >
                <FileDown size={16} /> Descargar PDF
            </button>
        </div>

        {/* Resumen de la Visita */}
        <div className="mb-10">
            <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center uppercase tracking-widest px-1">
            <ActivityIcon size={18} className="mr-2 text-blue-900"/> Resumen de la Escala
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-[2.5rem] border border-blue-50 shadow-sm flex flex-col items-center text-center">
                <div className="bg-blue-100 p-2.5 rounded-2xl mb-3">
                <Clock size={20} className="text-blue-700" />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Tiempo Total</span>
                <span className="text-lg font-black text-blue-900">9h 30m</span>
                <span className="text-[9px] text-slate-500 font-bold">08:00 - 17:30</span>
            </div>

            <div className="bg-white p-5 rounded-[2.5rem] border border-blue-50 shadow-sm flex flex-col items-center text-center">
                <div className="bg-amber-100 p-2.5 rounded-2xl mb-3">
                <Timer size={20} className="text-amber-700" />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Transporte</span>
                <span className="text-lg font-black text-amber-700">~1h 50m</span>
                <span className="text-[9px] text-slate-500 font-bold">Shuttle + Metro</span>
            </div>

            <div className="bg-white p-5 rounded-[2.5rem] border border-blue-50 shadow-sm flex flex-col items-center text-center">
                <div className="bg-emerald-100 p-2.5 rounded-2xl mb-3">
                <Landmark size={20} className="text-emerald-700" />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Turismo Activo</span>
                <span className="text-lg font-black text-emerald-700">~4h 30m</span>
                <span className="text-[9px] text-slate-500 font-bold">Tiempo en Barcelona</span>
            </div>

            <div className="bg-white p-5 rounded-[2.5rem] border border-blue-50 shadow-sm flex flex-col items-center text-center">
                <div className="bg-rose-100 p-2.5 rounded-2xl mb-3">
                <Footprints size={20} className="text-rose-700" />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Distancia Pie</span>
                <span className="text-lg font-black text-rose-700">~5.4 km</span>
                <span className="text-[9px] text-slate-500 font-bold">Total recorrido</span>
            </div>
            </div>

            <div className="mt-4 bg-blue-50 p-4 rounded-3xl border border-blue-100 flex items-start gap-3">
            <div className="bg-blue-600 p-1.5 rounded-full mt-0.5">
                <Navigation size={12} className="text-white" />
            </div>
            <div>
                <p className="text-[11px] font-bold text-blue-900 leading-tight">Nota de Interés:</p>
                <p className="text-[10px] text-blue-700 mt-1 leading-relaxed">
                La terminal de cruceros está a unos 10-15 mins en shuttle del Monumento a Colón. El Metro L3 (verde) es la vía más rápida para cruzar la ciudad de sur a norte.
                </p>
            </div>
            </div>
        </div>

        {/* Weather Section */}
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-sm font-black text-slate-800 flex items-center uppercase tracking-widest">
                <Thermometer size={18} className="mr-2 text-blue-900"/> El Tiempo
            </h3>
            <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">BCN</span>
            </div>
            
            {loadingWeather ? (
                <div className="h-32 bg-white rounded-3xl animate-pulse border border-blue-50"></div>
            ) : isOffline || !weather ? (
                <div className="bg-slate-100 rounded-[2rem] p-6 text-center border border-slate-200">
                    <div className="flex justify-center mb-2"><WifiOff size={24} className="text-slate-400" /></div>
                    <p className="text-sm font-bold text-slate-500">Sin conexión</p>
                    <p className="text-xs text-slate-400 mt-1">La información del clima no está disponible offline.</p>
                </div>
            ) : (
            <div className="space-y-4">
                {/* Hourly */}
                <div className="bg-white p-5 rounded-[2rem] border border-blue-50 shadow-md overflow-hidden">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Previsión por horas</p>
                <div className="flex overflow-x-auto gap-4 no-scrollbar pb-2">
                    {weather.hourly.time.slice(0, 24).filter((_, i) => {
                    const hour = new Date(weather.hourly.time[i]).getHours();
                    return hour >= 8 && hour <= 21;
                    }).map((time, i) => (
                    <div key={time} className="flex flex-col items-center min-w-[50px]">
                        <span className="text-[10px] font-bold text-slate-500 mb-2">{new Date(time).getHours()}:00</span>
                        <div className="bg-slate-50 p-2 rounded-2xl mb-2">
                        {getWeatherIcon(weather.hourly.code[i], 20)}
                        </div>
                        <span className="text-xs font-black text-blue-900">{Math.round(weather.hourly.temperature[i])}°</span>
                    </div>
                    ))}
                </div>
                </div>

                {/* 5 Day */}
                <div className="bg-white p-5 rounded-[2rem] border border-blue-50 shadow-md">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                    <CalendarDays size={14} className="mr-1.5" /> Próximos 5 días
                </p>
                <div className="space-y-3">
                    {weather.daily.time.slice(0, 5).map((day, i) => (
                    <div key={day} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                        <span className="text-xs font-bold text-slate-700 w-12 capitalize">{formatDayName(day)}</span>
                        <div className="flex items-center gap-3">
                        {getWeatherIcon(weather.daily.weathercode[i], 18)}
                        </div>
                        <div className="flex gap-3 text-xs font-black w-20 justify-end">
                        <span className="text-blue-900">{Math.round(weather.daily.temperature_2m_max[i])}°</span>
                        <span className="text-slate-300">{Math.round(weather.daily.temperature_2m_min[i])}°</span>
                        </div>
                    </div>
                    ))}
                </div>
                </div>
            </div>
            )}
        </div>

        <div className="mb-8 bg-rose-700 rounded-[2rem] p-6 shadow-xl text-white relative overflow-hidden border-2 border-white/10">
            <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative z-10">
            <div className="flex items-center mb-3"><PhoneCall size={24} className="text-white animate-pulse mr-3" /><h3 className="font-black text-lg uppercase tracking-widest">ASISTENCIA SOS</h3></div>
            <p className="text-xs text-rose-50 mb-6 leading-relaxed font-medium">Si te desorientas o pierdes el bus, contacta inmediatamente.</p>
            <button onClick={() => window.open('https://wa.me/?text=SOS_Barcelona', '_blank')} className="w-full py-4 bg-white text-rose-800 font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg uppercase tracking-widest text-sm active:scale-95 transition-transform"><Send size={18} /> Enviar Localización</button>
            </div>
        </div>

        <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center uppercase tracking-widest px-1"><Languages size={18} className="mr-2 text-blue-900"/> Catalán Básico</h3>
        <div className="bg-white rounded-3xl shadow-md border border-blue-50 overflow-hidden mb-8">
            {PRONUNCIATIONS.map((item) => (
            <div key={item.word} className="p-5 flex justify-between items-center border-b border-slate-50 last:border-0 hover:bg-blue-50/30 transition-colors group">
                <div><div className="flex items-center gap-3"><p className="font-black text-blue-950 text-lg">{item.word}</p><button onClick={() => playSimulatedAudio(item.word)} className={`p-2 rounded-full transition-all ${playing === item.word ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-50'}`}><Volume2 size={16} /></button></div><p className="text-xs text-slate-500 italic">"{item.simplified}"</p></div>
                <p className="text-[10px] font-black text-blue-500 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-tighter border border-blue-100">{item.meaning}</p>
            </div>
            ))}
        </div>
        </div>
    );
};