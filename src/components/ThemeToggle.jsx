import { useTheme } from './context/ThemeContext';
import { BsSun, BsMoonStarsFill } from 'react-icons/bs'; // Necesitas react-icons

const ThemeToggle = () => {
    const { isDarkMode, toggleTheme } = useTheme();

    return (
        <button
            className="btn btn-outline-warning ms-3"
            onClick={toggleTheme}
            style={{ borderRadius: '50px' }}
        >
            {isDarkMode ? <BsSun /> : <BsMoonStarsFill />}
        </button>
    );
};