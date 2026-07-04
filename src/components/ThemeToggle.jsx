import React from 'react';
import { useTheme } from '../context/Themecontext.jsx';
import { BsSun, BsMoonStarsFill } from 'react-icons/bs';

// Componente ThemeToggle exportado por defecto
export default function ThemeToggle() {
    const { isDarkMode, toggleTheme } = useTheme();

    // Renderiza un botón que alterna entre el modo oscuro y claro
    return (
        <button
            className="btn btn-outline-warning ms-3"
            onClick={toggleTheme}
            style={{ borderRadius: '50px' }}
        >
            {isDarkMode ? <BsSun /> : <BsMoonStarsFill />}
        </button>
    );
}