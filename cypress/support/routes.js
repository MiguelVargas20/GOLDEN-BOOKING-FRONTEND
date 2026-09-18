// ***********************************************
// Registro central de rutas de Golden Booking
// baseUrl (http://localhost:5173) vive en cypress.config.js
// Aquí solo se define el PATH de cada página, para no
// repetir strings sueltos en cada spec.
// ***********************************************

export const ROUTES = {
  login: "/login",
  registro: "/registro",
  home: "/home",
  contactos: "/contactos",
  mensajes: "/mensajes",
  reservasHospedaje: "/reservas-hospedaje",
  crearHabitacion: "/crear-habitacion",
  gestionarHabitaciones: "/gestionar-habitaciones",
  misReservasHotel: "/mis-reservas-hotel",
  reservasDeportivas: "/reservas-deportivas",
  reservarEspacioD: "/reservas-deportivas/reservar-espacio",
  gestionarReservasD: "/reservas-deportivas/gestionar",
  misReservasDeporte: "/reservas-deportivas/mis-reservas",
};