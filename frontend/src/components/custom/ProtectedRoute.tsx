import { useAuthStore } from "@/store/useAuthStore"
import { Navigate, useLocation } from "react-router-dom"

const ProtectedRoute = ({children}: {children: React.ReactNode}) => {
    const token = useAuthStore((s) => s.token)
    const location = useLocation()

    if (!token) {
        return <Navigate to="/login" replace state={{from: location}} />;
    }

    return children;
}

export default ProtectedRoute