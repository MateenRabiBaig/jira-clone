import { useAppSelector } from "../../hooks/reduxHooks";

function WelcomeBanner() {
    const user = useAppSelector((state) => state.auth.user);

    return (
        <div className="border border-[#36373a] bg-[#242528] p-4">
            <h1 className="text-xl font-semibold text-[#e0e1e3]">Welcome back, {" "} {user?.name}!</h1>

            <p className="mt-1 text-xs text-[#96999e]">Manage your projects, tasks and team from one place.</p>
        </div>
    );
}

export default WelcomeBanner;
