import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Camera, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { userUpdated } from '../../redux/slices/authSlice';
import { authApi } from '../../api/authApi';
import { getErrorMessage } from '../../api/axios';
import Avatar from '../../components/common/Avatar';

interface ProfileForm {
    name: string;
    email: string;
    bio: string;
}

interface PasswordForm {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

const inputClass =
    'w-full border border-[#55575c] bg-[#1c1d1f] text-[#e0e1e3] placeholder:text-[#85878a] px-3 py-2 text-sm focus:border-[#75a4f7] focus:outline-none';
const labelClass = 'block text-xs font-semibold text-[#b7b9bc] mb-1';

export default function Profile() {
    const user = useAppSelector((state) => state.auth.user);
    const dispatch = useAppDispatch();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [savingProfile, setSavingProfile] = useState(false);
    const [profileError, setProfileError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [savingPassword, setSavingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);

    const profileForm = useForm<ProfileForm>({
        values: { name: user?.name ?? '', email: user?.email ?? '', bio: user?.bio ?? '' },
    });
    const passwordForm = useForm<PasswordForm>();

    if (!user) return null;

    const onProfileSubmit = async (data: ProfileForm) => {
        setSavingProfile(true);
        setProfileError(null);
        try {
            const { user: updated } = await authApi.updateMe({
                name: data.name.trim(),
                email: data.email.trim(),
                bio: data.bio,
            });
            dispatch(userUpdated(updated));
            toast.success('Profile updated');
        } catch (err: unknown) {
            setProfileError(getErrorMessage(err, 'Could not update profile'));
        } finally {
            setSavingProfile(false);
        }
    };

    const onPasswordSubmit = async (data: PasswordForm) => {
        setPasswordError(null);
        setSavingPassword(true);
        try {
            const { token } = await authApi.changePassword({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            });
            localStorage.setItem('token', token); // the server rotates the JWT after a password change
            passwordForm.reset();
            toast.success('Password updated');
        } catch (err: unknown) {
            setPasswordError(getErrorMessage(err, 'Could not change password'));
        } finally {
            setSavingPassword(false);
        }
    };

    const onAvatarSelected = async (file: File) => {
        setUploading(true);
        setUploadProgress(0);
        try {
            const { avatarUrl } = await authApi.uploadAvatar(file, setUploadProgress);
            dispatch(userUpdated({ ...user, avatarUrl }));
            toast.success('Avatar updated');
        } catch (err: unknown) {
            toast.error(getErrorMessage(err, 'Could not upload avatar'));
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6">
            <h1 className="text-2xl font-bold text-[#e0e1e3]">Profile</h1>

            {/* Identity card */}
            <section className="bg-[#242528] border border-[#36373a] p-5">
                <div className="flex items-center gap-5">
                    <div className="relative">
                        <Avatar name={user.name} src={user.avatarUrl} size={72} />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            aria-label="Change avatar"
                            title="Change avatar"
                            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#6f9deb] text-[#101214] flex items-center justify-center hover:bg-[#87adf0] disabled:opacity-60"
                        >
                            {uploading ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} />}
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/gif,image/webp"
                            className="hidden"
                            onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (file) void onAvatarSelected(file);
                                event.target.value = '';
                            }}
                        />
                    </div>
                    <div className="min-w-0">
                        <p className="text-lg font-semibold text-[#e0e1e3] truncate">{user.name}</p>
                        <p className="text-sm text-[#96999e] truncate">{user.email}</p>
                        {uploading && (
                            <p className="text-[11px] text-[#75a4f7] mt-1" role="status">Uploading avatar... {uploadProgress}%</p>
                        )}
                        <p className="text-[11px] text-[#85878a] mt-1.5">
                            JPG, PNG, GIF or WebP, up to 5 MB.
                        </p>
                    </div>
                </div>
            </section>

            {/* Edit profile */}
            <section className="bg-[#242528] border border-[#36373a] p-5">
                <h2 className="text-base font-semibold text-[#e0e1e3] mb-4">Edit profile</h2>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4" noValidate>
                    <div>
                        <label htmlFor="profile-name" className={labelClass}>Full name</label>
                        <input
                            id="profile-name"
                            {...profileForm.register('name', { required: 'Name is required', maxLength: { value: 80, message: 'Name is too long' } })}
                            className={inputClass}
                        />
                        {profileForm.formState.errors.name && (
                            <p className="text-[#f15b50] text-xs mt-1">{profileForm.formState.errors.name.message}</p>
                        )}
                    </div>
                    <div>
                        <label htmlFor="profile-email" className={labelClass}>Email</label>
                        <input
                            id="profile-email"
                            type="email"
                            {...profileForm.register('email', {
                                required: 'Email is required',
                                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
                            })}
                            className={inputClass}
                        />
                        {profileForm.formState.errors.email && (
                            <p className="text-[#f15b50] text-xs mt-1">{profileForm.formState.errors.email.message}</p>
                        )}
                    </div>
                    <div>
                        <label htmlFor="profile-bio" className={labelClass}>Bio</label>
                        <textarea
                            id="profile-bio"
                            rows={3}
                            {...profileForm.register('bio', { maxLength: { value: 400, message: 'Bio must be 400 characters or fewer' } })}
                            placeholder="A few words about you"
                            className={inputClass}
                        />
                        {profileForm.formState.errors.bio && (
                            <p className="text-[#f15b50] text-xs mt-1">{profileForm.formState.errors.bio.message}</p>
                        )}
                    </div>

                    {profileError && <p className="text-[#f15b50] text-sm" role="alert">{profileError}</p>}

                    <div className="flex justify-end gap-2 pt-1">
                        <button
                            type="button"
                            onClick={() => {
                                profileForm.reset({ name: user.name, email: user.email, bio: user.bio ?? '' });
                                setProfileError(null);
                            }}
                            className="px-4 py-2 border border-[#55575c] text-[#b7b9bc] text-sm hover:bg-[#2c2d30]"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={savingProfile}
                            className="px-4 py-2 bg-[#6f9deb] text-[#101214] font-semibold text-sm hover:bg-[#87adf0] disabled:opacity-50"
                        >
                            {savingProfile ? 'Saving...' : 'Save changes'}
                        </button>
                    </div>
                </form>
            </section>

            {/* Change password */}
            <section className="bg-[#242528] border border-[#36373a] p-5">
                <h2 className="text-base font-semibold text-[#e0e1e3] mb-4">Change password</h2>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4" noValidate>
                    <div>
                        <label htmlFor="current-password" className={labelClass}>Current password</label>
                        <input
                            id="current-password"
                            type="password"
                            autoComplete="current-password"
                            {...passwordForm.register('currentPassword', { required: 'Current password is required' })}
                            className={inputClass}
                        />
                        {passwordForm.formState.errors.currentPassword && (
                            <p className="text-[#f15b50] text-xs mt-1">{passwordForm.formState.errors.currentPassword.message}</p>
                        )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="new-password" className={labelClass}>New password</label>
                            <input
                                id="new-password"
                                type="password"
                                autoComplete="new-password"
                                {...passwordForm.register('newPassword', {
                                    required: 'New password is required',
                                    minLength: { value: 6, message: 'At least 6 characters' },
                                })}
                                className={inputClass}
                            />
                            {passwordForm.formState.errors.newPassword && (
                                <p className="text-[#f15b50] text-xs mt-1">{passwordForm.formState.errors.newPassword.message}</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="confirm-password" className={labelClass}>Confirm new password</label>
                            <input
                                id="confirm-password"
                                type="password"
                                autoComplete="new-password"
                                {...passwordForm.register('confirmPassword', {
                                    required: 'Please confirm the new password',
                                    validate: (value) => value === passwordForm.getValues('newPassword') || 'Passwords do not match',
                                })}
                                className={inputClass}
                            />
                            {passwordForm.formState.errors.confirmPassword && (
                                <p className="text-[#f15b50] text-xs mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>
                            )}
                        </div>
                    </div>

                    {passwordError && <p className="text-[#f15b50] text-sm" role="alert">{passwordError}</p>}

                    <div className="flex justify-end gap-2 pt-1">
                        <button
                            type="button"
                            onClick={() => {
                                passwordForm.reset();
                                setPasswordError(null);
                            }}
                            className="px-4 py-2 border border-[#55575c] text-[#b7b9bc] text-sm hover:bg-[#2c2d30]"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={savingPassword}
                            className="px-4 py-2 bg-[#6f9deb] text-[#101214] font-semibold text-sm hover:bg-[#87adf0] disabled:opacity-50"
                        >
                            {savingPassword ? 'Updating...' : 'Update password'}
                        </button>
                    </div>
                </form>
            </section>

            <p className="text-xs text-[#85878a]">
                Notification preferences live in <Link to="/settings" className="text-[#75a4f7] hover:underline">Settings</Link>.
            </p>
        </div>
    );
}
