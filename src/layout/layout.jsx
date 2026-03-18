import { useState, useRef, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Footer from '../components/Footer'; 
import logo from "../assets/LOGO.PNG";
import "./layout.css";
import Navbar from "../components/Navbar";

export default function Layout() {
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Cerrar si se hace clic afuera
    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="contenedor">

            <div className="Navbar">
                <Navbar />
            </div>

     

            <div className="content">
                <Outlet />
            </div>

            <div className="footer">
                <Footer />
            </div>

        </div>
    );
}
