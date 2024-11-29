import authService from '@/services/authService';
import React from 'react';
import { Navigate, RouteProps } from 'react-router-dom';

interface PrivateRouteProps {
    component: React.ComponentType;
    routeProps?: RouteProps;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ component: Component }) => {
    const isAuthenticated = authService.isAuthenticated();
    return isAuthenticated ? <Component /> : <Navigate to="/" />;
};

export default PrivateRoute;
