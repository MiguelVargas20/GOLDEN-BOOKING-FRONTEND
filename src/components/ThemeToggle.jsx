import { useTheme } from './context/ThemeContext';
import { BsSun, BsMoonStarsFill } from 'react-icons/bs'; // Necesitas react-icons

// Componente ThemeToggle
const ThemeToggle = () => {
    const { isDarkMode, toggleTheme } = useTheme();

    // Renderiza un botón que alterna entre el modo oscuro y claro
    return (
        <button
            className="btn btn-outline-warning ms-3"
            onClick={toggleTheme}
            style={{ borderRadius: '50px' }}
        >
            // Renderiza el icono correspondiente según el estado del tema
            {isDarkMode ? <BsSun /> : <BsMoonStarsFill />}
        </button>
    );
};