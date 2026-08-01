import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAppDispatch } from '../../hooks/reduxHooks';
import { login } from '../../redux/slices/authSlice';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface LoginForm {
  email: string;
  password: string;
}

export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onSubmit = async (data: LoginForm) => {
    try {
      const res = await api.post('/auth/login', data);
      localStorage.setItem('token', res.data.token);
      dispatch(login(res.data));
      navigate('/dashboard');
    }
    catch (err: unknown) {
      alert(axios.isAxiosError<{ message?: string }>(err) ? err.response?.data?.message ?? 'Login failed' : 'Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm mx-auto mt-20 space-y-4">
      <h1 className="text-2xl font-bold">Log in</h1>
      <input
        {...register('email', { required: 'Email is required' })}
        placeholder="Email"
        className="w-full border rounded px-3 py-2"
      />
      {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}

      <input
        type="password"
        {...register('password', { required: 'Password is required' })}
        placeholder="Password"
        className="w-full border rounded px-3 py-2"
      />
      {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-indigo-600 text-white rounded py-2 disabled:opacity-50"
      >
        {isSubmitting ? 'Logging in...' : 'Log in'}
      </button>

      <p className="text-sm text-center text-gray-500">Don't have an account?{' '}
        <Link to="/register" className="text-indigo-600 font-medium">Sign up</Link>
      </p>
    </form>
  );
}
