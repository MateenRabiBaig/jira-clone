import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAppDispatch } from '../../hooks/reduxHooks';
import { registerUser } from '../../redux/slices/authSlice';
import { getErrorMessage } from '../../api/axios';

interface RegisterForm {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

const inputClass =
    'w-full border border-[#55575c] bg-[#1c1d1f] text-[#e0e1e3] placeholder:text-[#85878a] px-3 py-2 text-sm focus:border-[#75a4f7] focus:outline-none';

export default function Register() {
    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<RegisterForm>();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [serverError, setServerError] = useState<string | null>(null);

    const onSubmit = async (data: RegisterForm) => {
        setServerError(null);
        try {
            await dispatch(
                registerUser({ name: data.name.trim(), email: data.email.trim(), password: data.password }),
            ).unwrap();
            toast.success('Account created. Welcome!');
            navigate('/dashboard', { replace: true });
        } catch (err: unknown) {
            setServerError(getErrorMessage(err, 'Registration failed'));
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="w-full max-w-sm bg-[#242528] border border-[#36373a] p-6 space-y-4">
                <div className="flex items-center gap-2.5 mb-1">
                    <img src="/jira.png" alt="Jira" className="w-7 h-7 object-contain rounded-md" />
                    <h1 className="text-xl font-bold text-[#e0e1e3]">Create an account</h1>
                </div>

                <div>
                    <label htmlFor="register-name" className="block text-xs font-semibold text-[#b7b9bc] mb-1">Full name</label>
                    <input
                        id="register-name"
                        autoComplete="name"
                        {...register('name', { required: 'Name is required', maxLength: { value: 80, message: 'Name is too long' } })}
                        placeholder="Ada Lovelace"
                        className={inputClass}
                    />
                    {errors.name && <p className="text-[#f15b50] text-xs mt-1">{errors.name.message}</p>}
                </div>

                <div>
                    <label htmlFor="register-email" className="block text-xs font-semibold text-[#b7b9bc] mb-1">Email</label>
                    <input
                        id="register-email"
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
                    <label htmlFor="register-password" className="block text-xs font-semibold text-[#b7b9bc] mb-1">Password</label>
                    <input
                        id="register-password"
                        type="password"
                        autoComplete="new-password"
                        {...register('password', {
                            required: 'Password is required',
                            minLength: { value: 6, message: 'Use at least 6 characters' },
                        })}
                        placeholder="At least 6 characters"
                        className={inputClass}
                    />
                    {errors.password && <p className="text-[#f15b50] text-xs mt-1">{errors.password.message}</p>}
                </div>

                <div>
                    <label htmlFor="register-confirm" className="block text-xs font-semibold text-[#b7b9bc] mb-1">Confirm password</label>
                    <input
                        id="register-confirm"
                        type="password"
                        autoComplete="new-password"
                        {...register('confirmPassword', {
                            required: 'Please confirm your password',
                            validate: (value) => value === watch('password') || 'Passwords do not match',
                        })}
                        placeholder="Repeat your password"
                        className={inputClass}
                    />
                    {errors.confirmPassword && <p className="text-[#f15b50] text-xs mt-1">{errors.confirmPassword.message}</p>}
                </div>

                {serverError && <p className="text-[#f15b50] text-sm" role="alert">{serverError}</p>}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#6f9deb] text-[#101214] font-semibold rounded py-2 text-sm hover:bg-[#87adf0] disabled:opacity-50"
                >
                    {isSubmitting ? 'Creating account...' : 'Sign up'}
                </button>

                <p className="text-sm text-center text-[#96999e]">
                    Already have an account?{' '}
                    <Link to="/login" className="text-[#75a4f7] font-medium hover:underline">Log in</Link>
                </p>
            </form>
        </div>
    );
}
