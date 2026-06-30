import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export function useRequierePerfilCompleto() {
    const navigate = useNavigate();

    const verificarPerfil = (user) => {
        // Adaptación a la estructura anidada de tu interfaz RegisterData
        const docUsuario = user?.documento?.numero; 
        
        if (!docUsuario) {
            Swal.fire({
                title: "Perfil incompleto",
                text: "No encontramos tu número de documento. Actualiza tu perfil antes de continuar con la reserva.",
                icon: "error",
                showCancelButton: true,
                confirmButtonText: "Ir a mi perfil",
                cancelButtonText: "Cancelar",
                confirmButtonColor: "#f38d1e",
                cancelButtonColor: "#6c757d",
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate("/mi-perfil");
                }
            });
            return false;
        }
        return docUsuario; // Retorna el número de documento limpio si existe
    };

    return { verificarPerfil };
}