import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../redux/hooks';

interface Props {
  allowedRoles: string[];
}

const ProtectedRoute = ({ allowedRoles }: Props) => {
  const { isAuthenticated, account } = useAppSelector((state) => state.user);
  const role = account?.role as string | undefined;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
