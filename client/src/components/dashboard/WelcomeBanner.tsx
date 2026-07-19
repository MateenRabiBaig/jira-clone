import { useAppSelector } from "../../hooks/reduxHooks";

function WelcomeBanner() {
    const user = useAppSelector((state) => state.auth.user);

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h1 className="text-3xl font-semibold text-slate-900">Welcome back, {" "} {user?.name}!</h1>
        
            <p className="mt-2 text-slate-500">Manage your projects, tasks and team from one place.</p>
        </div>
    );
}

export default WelcomeBanner;