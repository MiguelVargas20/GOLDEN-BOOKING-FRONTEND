import logo from '../assets/LOGO.png'
import calendario from '../assets/CALENDARIO.png'
import '../styles/Login.css'

export default function Login() {
    return (
        <>
        <div className='container'>
            {/*PANEL IZQUIERDO*/}
            <div className="left-panel">
                {/*LOGO*/}
            <div className="logo">
                <img src={logo} alt="Logo" />
            </div>
                <h1>Bienvenido !</h1>
                <p className="subtitle">¿Estas listo para reservar?</p>
            {/*FORMULARIO*/}
            <form className="form">
                <input type="email" id="email" placeholder="Ingrese su email" required />
                <input type="password" id="password" placeholder="Ingrese su contraseña" required/>   
            <div className="options">
                <label className="check">
                    <input type="checkbox"/> 
                    <span className="check">Recordarme</span>
                </label>
                <a href="Forgot" className="forgot">¿Olvidaste tu contraseña?</a>
            </div>
                <button type="submit" className="btn">INGRESAR</button>
            </form>
            </div>
            {/*PANEL DERECHO*/}
            <div className="right-panel">
                <img src={calendario} alt="Calendario"  className="calendar-img" />
            </div>
        </div>
        </>
    )
}