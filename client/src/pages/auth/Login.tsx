import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAppDispatch } from '../../hooks/reduxHooks';
import { loginUser } from '../../redux/slices/authSlice';
import { getErrorMessage } from '../../api/axios';

interface LoginForm {
  email: string;
  password: string;
}

const inputClass =
  'w-full border border-[#55575c] bg-[#1c1d1f] text-[#e0e1e3] placeholder:text-[#85878a] px-3 py-2 text-sm focus:border-[#75a4f7] focus:outline-none';

export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);

  const onSubmit = async (data: LoginForm) => {
    setServerError(null);
    try {
      await dispatch(loginUser({ email: data.email.trim(), password: data.password })).unwrap();
      toast.success('Welcome back!');
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from && from !== '/login' ? from : '/dashboard', { replace: true });
    } catch (err: unknown) {
      setServerError(getErrorMessage(err, 'Login failed'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="w-full max-w-sm bg-[#242528] border border-[#36373a] p-6 space-y-4">
        <div className="flex items-center gap-2.5 mb-1">
          <img src="/jira.png" alt="Jira" className="w-7 h-7 object-contain rounded-md" />
          <h1 className="text-xl font-bold text-[#e0e1e3]">Log in to Jira</h1>
        </div>

        <div>
          <label htmlFor="login-email" className="block text-xs font-semibold text-[#b7b9bc] mb-1">Email</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
            })}
            placeholder="you@example.com"
            className={inputClass}
          />
          {errors.email && <p className="text-[#f15b50] text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="login-password" className="block text-xs font-semibold text-[#b7b9bc] mb-1">Password</label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            {...register('password', { required: 'Password is required' })}
            placeholder="Your password"
            className={inputClass}
          />
          {errors.password && <p className="text-[#f15b50] text-xs mt-1">{errors.password.message}</p>}
        </div>

        {serverError && (
          <p className="text-[#f15b50] text-sm" role="alert">{serverError}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#6f9deb] text-[#101214] font-semibold rounded py-2 text-sm hover:bg-[#87adf0] disabled:opacity-50"
        >
          {isSubmitting ? 'Logging in...' : 'Log in'}
        </button>

        <p className="text-sm text-center text-[#96999e]">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#75a4f7] font-medium hover:underline">Sign up</Link>
        </p>
      </form>
    </div>
  );
}
