import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAppDispatch } from "../../hooks/reduxHooks";
import { login } from '../../redux/slices/authSlice';
import axios from 'axios';

interface RegisterForm {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export default function Register() {
    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<RegisterForm>();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const onSubmit = async (data: RegisterForm) => {
        try {
            const res = await api.post('/auth/register', {
                name: data.name,
                email: data.email,
                password: data.password
            })
            localStorage.setItem('token', res.data.token)
            dispatch(login(res.data))
            navigate('/dashboard')
        }
        catch(err: unknown) {
            alert(axios.isAxiosError<{ message?: string }>(err) ? err.response?.data?.message ?? 'Registration Failed' : 'Registration Failed')
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm mx-auto mt-20 space-y-4">
            <h1 className="text-2xl font-bold">Create an account</h1>
            
            <div>
                <input 
                    {...register('name', { required: 'Name is required' })}
                    placeholder="Full name"
                    className="w-full border rounded px-3 py-2"
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>
            
            <div>
                <input
                    {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' } })}
                    placeholder="Email"
                    className="w-full border rounded px-3 py-2"
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>
            
            <div>
                <input
                    type="password"
                    {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
                    placeholder="Password"
                    className="w-full border rounded px-3 py-2"
                />
                {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>
            
            <div>
                <input
                    type="password"
                    {...register('confirmPassword', { required: 'Please confirm your password', validate: (val) => val === watch('password') || 'Passwords do not match' })}
                    placeholder="Confirm password"
                    className="w-full border rounded px-3 py-2"
                />
                {errors.confirmPassword && (
                    <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
                )}
            </div>
            
            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 text-white rounded py-2 disabled:opacity-50"
            >
                {isSubmitting ? 'Creating account...' : 'Sign up'}
            </button>
            
            <p className="text-sm text-center text-gray-500">Already have an account?{' '}
                <Link to="/login" className="text-indigo-600 font-medium">Log in</Link>
            </p>
        </form>
    )
}
