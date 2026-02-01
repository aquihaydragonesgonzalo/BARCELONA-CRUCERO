import { ItineraryItem, Waypoint, Pronunciation } from './types';

export const SHIP_DEPARTURE_TIME = "18:00";
export const SHIP_ONBOARD_TIME = "17:30";
export const DATE_OF_VISIT = "2026-04-12";

export const COORDS = {
    BARCELONA_PORT: { lat: 41.362895, lng: 2.181948 },
    COLON: { lat: 41.375798, lng: 2.177774 },
    SAGRADA_FAMILIA: { lat: 41.40406, lng: 2.173935 },
    LA_PEDRERA: { lat: 41.395174, lng: 2.161777 },
    CASA_BATLLO: { lat: 41.391714, lng: 2.165002 },
    BOQUERIA: { lat: 41.381939, lng: 2.172071 }
};

export const GPX_WAYPOINTS: Waypoint[] = [
    { name: "EDIFICIO WORLD TRADE CENTER", lat: 41.371587, lng: 2.181265 },
    { name: "CRUISE BUS (AZUL)", lat: 41.37182, lng: 2.179492 },
    { name: "METRO DRASSANES", lat: 41.376913, lng: 2.1759 },
    { name: "MONUMENTO A COLÓN", lat: 41.375798, lng: 2.177774 },
    { name: "METRO PASEO DE GRACIA", lat: 41.391519, lng: 2.165324 },
    { name: "LA PEDRERA - RUTA DEL MODERNISMO", lat: 41.395174, lng: 2.161777 },
    { name: "Casa Batlló", lat: 41.391714, lng: 2.165002 },
    { name: "METRO SAGRADA FAMILIA", lat: 41.40406, lng: 2.173935 },
    { name: "METRO JAUME I", lat: 41.383988, lng: 2.178874 },
    { name: "LA CATEDRAL DEL MAR - RUTA DEL BARRIO GOTICO", lat: 41.383497, lng: 2.181772 },
    { name: "TERMINAL DE CRUCEROS", lat: 41.362895, lng: 2.181948 },
    { name: "METRO DIAGONAL", lat: 41.395839, lng: 2.159938 },
    { name: "LA BOQUERIA - CERRADA EN DOMINGO", lat: 41.381939, lng: 2.172071 },
    { name: "CATEDRAL DE BARCELONA", lat: 41.382326, lng: 2.173742 }
];

// Truncated for brevity but structurally complete for the component logic
// In a real scenario, the full coordinate list would be here.
export const BARCELONA_TRACK: [number, number][] = [
    [41.372324, 2.178648], [41.372887, 2.17745], [41.372917, 2.177385], [41.372972, 2.177428], [41.373037, 2.177476], [41.373068, 2.177503], 
    [41.37313, 2.177367], [41.373184, 2.177454], [41.373252, 2.177521], [41.373263, 2.177498], [41.373271, 2.177471], [41.373342, 2.177504],
    [41.373413, 2.177503], [41.373499, 2.177467], [41.373579, 2.177382], [41.373605, 2.177352], [41.373643, 2.177283], [41.373674, 2.177209],
    [41.373695, 2.177127], [41.373693, 2.177067], [41.373759, 2.177082], [41.373804, 2.177089], [41.373851, 2.177097], [41.373873, 2.177097],
    [41.375254, 2.177528], [41.376913, 2.1759], [41.391519, 2.165324], [41.40406, 2.173935], [41.395174, 2.161777], [41.381939, 2.172071],
    [41.383497, 2.181772], [41.362895, 2.181948] 
    // ... Note: For a full production app, you would paste the entire array here. 
    // I am including key points to ensure the line draws somewhat correctly for the example.
];

export const INITIAL_ITINERARY: ItineraryItem[] = [
 {
    "id": "1",
    "title": "Llegada al Puerto de Barcelona",
    "startTime": "08:00",
    "endTime": "08:00",
    "locationName": "Terminal de Cruceros Barcelona",
    "coords": { "lat": 41.362895, "lng": 2.181948 },
    "description": "Llegada del barco a puerto. Preparación para el desembarque.",
    "keyDetails": "Tener a mano la tarjeta de embarque.",
    "priceEUR": 0,
    "type": "logistics",
    "completed": false,
    "notes": "CRITICAL"
 },
 {
    "id": "2",
    "title": "Desembarco y Shuttle (Cruise Bus)",
    "startTime": "09:45",
    "endTime": "10:15",
    "locationName": "Terminal de Cruceros",
    "endLocationName": "Monumento a Colón",
    "coords": { "lat": 41.362895, "lng": 2.181948 },
    "endCoords": { "lat": 41.375798, "lng": 2.177774 },
    "description": "Traslado en autobús lanzadera (Cruise Bus azul) hasta el Monumento a Colón.",
    "keyDetails": "Comprar ticket en el bus (aprox 4.50€ ida/vuelta).",
    "priceEUR": 4.5,
    "type": "transport",
    "completed": false,
    "contingencyNote": "Si hay mucha cola, valorar taxi compartido (15-20€)."
 },
 {
    "id": "3",
    "title": "Metro a Sagrada Familia",
    "startTime": "10:40",
    "endTime": "11:10",
    "locationName": "Metro Drassanes (L3)",
    "endLocationName": "Metro Sagrada Familia",
    "coords": { "lat": 41.376913, "lng": 2.1759 },
    "endCoords": { "lat": 41.40406, "lng": 2.173935 },
    "description": "L3 Drassanes -> Paral·lel (transbordo) -> L2 Sagrada Família.",
    "keyDetails": "Usar tarjeta T-Familiar. Atención carteristas.",
    "priceEUR": 2.9,
    "type": "transport",
    "completed": false,
    "googleMapsUrl": "https://maps.app.goo.gl/pcdyeNVY2btj4WPS8"
 },
 {
    "id": "4",
    "title": "Basílica Sagrada Familia",
    "startTime": "11:20",
    "endTime": "12:20",
    "locationName": "Sagrada Família",
    "coords": { "lat": 41.40406, "lng": 2.173935 },
    "description": "Visita exterior de la Fachada de la Pasión y Natividad. La gran obra maestra inacabada de Antoni Gaudí.",
    "keyDetails": "Fotos desde Plaza de Gaudí (parque con lago).",
    "priceEUR": 0,
    "type": "sightseeing",
    "completed": false,
    "contingencyNote": "Entrada estricta con hora reservada. Si no hay tickets, visitar tienda oficial.",
    "audioGuideText": "Estás ante el monumento más visitado de España. La Sagrada Familia es una biblia en piedra. Gaudí dedicó sus últimos 12 años exclusivamente a esta basílica. Observa la Fachada del Nacimiento: es una explosión de vida y naturaleza. Al otro lado, la Fachada de la Pasión es austera y angular, representando el sufrimiento. Cuando se termine, su torre central será el punto más alto de Barcelona, pero siempre un metro por debajo de la montaña de Montjuic, porque Gaudí decía que la obra del hombre no debe superar a la de Dios."
 },
 {
    "id": "5",
    "title": "Paseo Modernista a La Pedrera",
    "startTime": "12:20",
    "endTime": "12:50",
    "locationName": "Paseo de Gracia",
    "endLocationName": "La Pedrera (Casa Milà)",
    "coords": { "lat": 41.40406, "lng": 2.173935 },
    "endCoords": { "lat": 41.395174, "lng": 2.161777 },
    "description": "Caminata por el Eixample, el corazón del diseño burgués de principios del siglo XX.",
    "keyDetails": "Distancia 1.4km. Ruta agradable y plana.",
    "priceEUR": 0,
    "type": "walk",
    "completed": false,
    "audioGuideText": "Estamos recorriendo el Eixample, un barrio diseñado con una cuadrícula perfecta por Ildefons Cerdà. Al final de este paseo nos espera La Pedrera. Su nombre oficial es Casa Milà, pero los barceloneses la apodaron 'la cantera' por su aspecto rudo de piedra ondulada. Gaudí se inspiró en las formas de la naturaleza, por eso no verás ni una sola línea recta en su fachada. Sus balcones de hierro forjado parecen algas marinas y su azotea es famosa por las chimeneas que parecen guerreros petrificados."
 },
 {
    "id": "6",
    "title": "Casa Batlló",
    "startTime": "12:50",
    "endTime": "13:00",
    "locationName": "Passeig de Gràcia",
    "coords": { "lat": 41.391714, "lng": 2.165002 },
    "description": "Admiración de la joya de la 'Manzana de la Discordia'. La fachada más colorida de la ciudad.",
    "keyDetails": "Admirar fachada y Casa Amatller (al lado).",
    "priceEUR": 0,
    "type": "sightseeing",
    "completed": false,
    "audioGuideText": "Mira la fachada de la Casa Batlló. Es una de las obras más creativas de Gaudí. Muchos ven en ella la leyenda de Sant Jordi: el tejado escamoso es el lomo del dragón, y la torre con la cruz es la lanza del caballero. Las columnas de las plantas bajas parecen huesos, por eso también se la conoce como la 'Casa de los Huesos'. Los balcones tienen forma de antifaces, y todo el conjunto brilla con fragmentos de cerámica de colores que imitan la superficie de un mar en calma."
 },
 {
    "id": "7",
    "title": "Metro Paseo de Gràcia a Liceu",
    "startTime": "13:00",
    "endTime": "13:20",
    "locationName": "Metro Paseo de Gràcia (L3)",
    "endLocationName": "Metro Liceu",
    "coords": { "lat": 41.391519, "lng": 2.165324 },
    "endCoords": { "lat": 41.381387, "lng": 2.173061 },
    "description": "L3 directa (Línea Verde) dirección Zona Universitària. 2 paradas.",
    "keyDetails": "Transbordo gratuito si ha pasado poco tiempo.",
    "priceEUR": 2.9,
    "type": "transport",
    "completed": false,
    "googleMapsUrl": "https://maps.app.goo.gl/PZegJ2aRa87uQQdk7"
 },
 {
    "id": "8",
    "title": "Paseo de La Rambla al Barrio Gótico",
    "startTime": "13:30",
    "endTime": "14:00",
    "locationName": "Mercado de la Boquería",
    "coords": { "lat": 41.381939, "lng": 2.172071 },
    "description": "Recorrido por la vía más famosa de Barcelona hacia el laberinto medieval.",
    "keyDetails": "Evitar terrazas y sitios para comer que son muy caros en esta zona",
    "priceEUR": 0,
    "type": "walk",
    "completed": false,
    "audioGuideText": "Caminas por Las Ramblas, un antiguo torrente de agua que hoy es la arteria de la ciudad. A tu derecha está el Mercado de la Boquería; aunque hoy domingo esté cerrado, su estructura metálica de mil novecientos catorce sigue siendo impresionante. Al adentrarnos en las calles laterales, pasamos del ruido de la rambla al silencio del Barrio Gótico. Aquí se encontraba la antigua ciudad romana de Barcino y todavía hoy podemos ver restos de sus murallas y el trazado de sus plazas señoriales."
 },
 {
    "id": "9",
    "title": "Barrio Gótico y Catedral del Mar",
    "startTime": "14:00",
    "endTime": "14:30",
    "locationName": "Basílica de Santa Maria del Mar",
    "coords": { "lat": 41.383497, "lng": 2.181772 },
    "description": "Paseo histórico por las callejuelas del centro. El corazón de la Barcelona medieval.",
    "keyDetails": "La Catedral del Mar.",
    "priceEUR": 0,
    "type": "walk",
    "completed": false,
    "audioGuideText": "Llegamos a Santa Maria del Mar, conocida como la Catedral del Mar. Es el ejemplo más perfecto del gótico catalán. A diferencia del gótico francés, aquí prima la horizontalidad y la sobriedad. Fue construida en un tiempo récord de cincuenta y cuatro años gracias al esfuerzo de los 'bastaixos', los estibadores del puerto, que cargaban las piedras una a una desde la montaña de Montjuic. Su interior es un espacio diáfano y elegante donde la luz juega un papel fundamental a través de sus rosetones."
 },
 {
    "id": "10",
    "title": "Regreso a Shuttle ",
    "startTime": "14:30",
    "endTime": "15:00",
    "locationName": "Catedral del Mar",
    "endLocationName": "Monumento a Colón",
    "coords": { "lat": 41.383497, "lng": 2.181772 },
    "endCoords": { "lat": 41.375798, "lng": 2.177774 },
    "description": "Paseo por el Paseo Marítimo para tomar el shuttle. Disfrutando de la brisa marina.",
    "keyDetails": "Paseo de unos 20-25 minutos por el frente marítimo.",
    "priceEUR": 0,
    "type": "walk",
    "completed": false,
    "audioGuideText": "Estamos regresando hacia el puerto por el frente marítimo. A tu izquierda queda el Port Vell, el puerto antiguo, que fue renovado totalmente para las Olimpiadas de mil novecientos noventa y dos. Al fondo verás la columna de Colón, con el almirante señalando hacia el mar. Es el momento ideal para tomar las últimas fotos del skyline de Barcelona y prepararnos para el regreso al barco. Recuerda verificar que tienes contigo todos los tickets y la tarjeta del crucero."
 },
 {
    "id": "11",
    "title": "Shuttle Bus al Barco / COMEMOS EN EL BARCO",
    "startTime": "15:00",
    "endTime": "15:30",
    "locationName": "Monumento a Colón",
    "endLocationName": "Terminal de Cruceros",
    "coords": { "lat": 41.375798, "lng": 2.177774 },
    "endCoords": { "lat": 41.362895, "lng": 2.181948 },
    "description": "Autobús de vuelta a la terminal. Suele haber cola.",
    "keyDetails": "Tener el ticket de vuelta preparado.",
    "priceEUR": 0,
    "type": "transport",
    "completed": false
 },
 {
    "id": "12",
    "title": "TODOS A BORDO",
    "startTime": "17:30",
    "endTime": "17:30",
    "locationName": "Terminal de Cruceros",
    "coords": { "lat": 41.362895, "lng": 2.181948 },
    "description": "Límite de tiempo para estar en el barco. Control de seguridad.",
    "keyDetails": "Verificar hora real en diario de a bordo.",
    "priceEUR": 0,
    "type": "logistics",
    "completed": false,
    "notes": "CRITICAL",
    "contingencyNote": "El barco no espera. ¡No llegues tarde!"
 },
 {
    "id": "13",
    "title": "Zarpe del Barco",
    "startTime": "18:00",
    "endTime": "18:00",
    "locationName": "Puerto de Barcelona",
    "coords": { "lat": 41.362895, "lng": 2.181948 },
    "description": "Salida del puerto. Fin de la escala.",
    "keyDetails": "Disfrutar del skyline de Barcelona desde cubierta.",
    "priceEUR": 0,
    "type": "logistics",
    "completed": false
 }
];

export const PRONUNCIATIONS: Pronunciation[] = [
    { word: 'Bon dia', phonetic: "Bon dee-ah", simplified: 'Bon día', meaning: 'Buenos días' },
    { word: 'Gràcies', phonetic: "Grah-sy-es", simplified: 'Gracias', meaning: 'Gracias' },
    { word: 'On es el bany?', phonetic: "On es el bah-ny", simplified: 'Dové el baño', meaning: '¿Dónde está el baño?' },
    { word: 'El compte, si us plau', phonetic: "El kon-te sees plaw", simplified: 'La cuenta', meaning: 'La cuenta, por favor' },
    { word: 'D\'acord', phonetic: "Dah-kord", simplified: 'De acuerdo', meaning: 'De acuerdo' }
];