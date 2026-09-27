import Spinner from "react-bootstrap/Spinner";

export default function LoadingSpinner() {
    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
            <Spinner animation="border" style={{ color: "#ff8800", width: "3rem", height: "3rem" }} />
        </div>
    );
}