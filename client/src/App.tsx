import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AppRoutes from './routes/AppRoutes';
import { useAppDispatch } from './hooks/reduxHooks';
import { sessionExpired } from './redux/slices/authSlice';

function App() {
    const dispatch = useAppDispatch();

    useEffect(() => {
        // The axios interceptor raises this when any API call gets a 401,
        // so the session state stays in sync with an expired token.
        const onSessionExpired = () => dispatch(sessionExpired());
        window.addEventListener('auth/sessionExpired', onSessionExpired);
        return () => window.removeEventListener('auth/sessionExpired', onSessionExpired);
    }, [dispatch]);

    return (
        <>
            <AppRoutes />
            <ToastContainer
                theme="dark"
                position="bottom-right"
                autoClose={3500}
                closeOnClick
                pauseOnFocusLoss={false}
            />
        </>
    );
}

export default App;
