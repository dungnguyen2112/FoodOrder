import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import NotPermitted from "./NotPermitted";

const RoleBaseRoute = (props) => {
    const isAdminRoute = window.location.pathname.startsWith('/admin');

    // Lấy user từ Redux trước, nếu không có thì lấy từ localStorage
    const user = useSelector(state => state.account.user);
    // || JSON.parse(localStorage.getItem("userInfo"));

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const userRole = user.roleId;
    console.log("User Role:", userRole);

    if (
        (isAdminRoute && userRole === 1) ||
        (!isAdminRoute && (userRole === 2 || userRole === 1))
    ) {
        return <>{props.children}</>;
    } else {
        return <NotPermitted />;
    }
}

const ProtectedRoute = (props) => {
    // Kiểm tra từ Redux
    const reduxAuth = useSelector(state => state.account.isAuthenticated);

    // Kiểm tra từ localStorage
    const localAuth = localStorage.getItem("isAuthenticated") === "true";

    // Ưu tiên Redux, nếu không có thì lấy từ localStorage
    const isAuthenticated = reduxAuth || localAuth;

    console.log("Is Authenticated:", isAuthenticated);

    return isAuthenticated ? (
        <RoleBaseRoute>
            {props.children}
        </RoleBaseRoute>
    ) : (
        <Navigate to="/login" replace />
    );
}

export default ProtectedRoute;

