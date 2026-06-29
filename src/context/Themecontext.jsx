import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

/**
 * Componente ThemeProvider
 * Proveedor de contexto global encargado de gestionar el estado del tema de la aplicación 
 * (Modo Claro / Modo Oscuro) y su persistencia en el navegador.
 */
export const ThemeProvider = ({ children }) => {
    
    // Inicialización del estado: Intenta leer una preferencia guardada en localStorage.
    // Si no existe, recurre a la configuración del sistema operativo del usuario.
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    });

    // Efecto secundario: Se ejecuta cada vez que el estado 'isDarkMode' cambia.
    // Actualiza el atributo raíz de Bootstrap y sincroniza el localStorage.
    useEffect(() => {
        const root = document.documentElement; // Accede directamente a la etiqueta <html>
        
        if (isDarkMode) {
            root.setAttribute('data-bs-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.setAttribute('data-bs-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    /**
     * Alterna de forma directa el estado entre Modo Claro y Modo Oscuro.
     */
    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

/**
 * Hook personalizado useTheme
 * Facilita el consumo del contexto del tema en cualquier componente secundario 
 * sin necesidad de importar 'useContext' ni 'ThemeContext' manualmente.
 */
export const useTheme = () => useContext(ThemeContext);