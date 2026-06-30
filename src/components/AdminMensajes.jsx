import React, { useEffect, useState } from "react";
import { listarMensajes, marcarMensajeLeido } from "./../api/ContactoApi"; // Ajusta la ruta
import Swal from "sweetalert2";

export const AdminMensajes = () => {
  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(true);

const cargarMensajes = async () => {
  try {
    const data = await listarMensajes(0, 50); 
    
    // 1. Esto te dirá el secreto en la consola de tu navegador (F12)
    console.log("ESTRUCTURA REAL DEL BACKEND:", data);

    // 2. Evaluamos de forma segura las estructuras más comunes
    if (data && Array.isArray(data.content)) {
      // Estructura estándar de Pageable en Spring Boot
      setMensajes(data.content); 
    } else if (data && Array.isArray(data.data)) {
      // Estructura común si usas un wrapper personalizado tipo { data: [...] }
      setMensajes(data.data);
    } else if (Array.isArray(data)) {
      // Si el backend responde el Array plano directamente
      setMensajes(data); 
    } else {
      // Si ninguna coincide, dejamos un array vacío para que NO se rompa el .map()
      console.error("El backend no devolvió un formato compatible de Array.");
      setMensajes([]); 
    }

  } catch (error) {
    console.error("Error capturado:", error);
    Swal.fire("Error", "No se pudieron cargar los mensajes", "error");
    setMensajes([]); // Fallback seguro en caso de error de red
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    cargarMensajes();
  }, []);

  const handleMarcarLeido = async (id) => {
    try {
      await marcarMensajeLeido(id);
      Swal.fire("Actualizado", "Mensaje marcado como leído", "success");
      // CORREGIDO: Aseguramos el uso de => en lugar de ->
      setMensajes(mensajes.filter((m) => m.id !== id));
    } catch (error) {
      Swal.fire("Error", "No se pudo actualizar el estado", "error");
    } 
  };

  if (loading) return <div className="text-center p-10">Cargando mensajes...</div>;

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>
        Bandeja de Mensajes Recibidos
      </h2>

      {mensajes.length === 0 ? (
        <p style={{ color: "#666" }}>No tienes mensajes pendientes de lectura.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {mensajes.map((m) => (
            <div 
              key={m.id} 
              style={{
                border: "1px solid #ddd", 
                borderRadius: "8px", 
                padding: "15px", 
                backgroundColor: m.leido ? "#f9f9f9" : "#fff",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <strong>{m.nombre} <span style={{ fontWeight: "normal", color: "#555" }}>({m.correo})</span></strong>
                {!m.leido && <span style={{ backgroundColor: "#ff4d4f", color: "#fff", padding: "2px 8px", borderRadius: "4px", fontSize: "12px" }}>Nuevo</span>}
              </div>
              <p style={{ margin: "10px 0", color: "#333" }}>{m.contenido}</p>
              
              {!m.leido && (
                <button
                  onClick={() => handleMarcarLeido(m.id)}
                  style={{
                    backgroundColor: "#f5b041",
                    color: "white",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  Marcar como leído
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};