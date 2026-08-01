import { useState } from "react";
import { userApi } from "../../api/userApi";
import { projectApi } from "../../api/projectApi";
import type { User } from "../../types";
import axios from 'axios';

interface Props {
    projectId: string;
    onClose: () => void;
    onAdded: () => void;
}

export default function AddMemberModal({ projectId, onClose, onAdded }: Props) {
    const [email, setEmail] = useState('')
    const [foundUser, setFoundUser] = useState<User | null>(null)
    const [error, setError] = useState('')
    const [searching, setSearching] = useState(false)
    const [adding, setAdding] = useState(false)

    const handleSearch = async() => {
        setError('')
        setFoundUser(null)
        if(!email.trim()) return
        setSearching(true)

        try {
            const user = await userApi.searchByEmail(email.trim())
            setFoundUser(user)
        }
        catch(err: unknown) {
            setError(axios.isAxiosError<{ message?: string }>(err) ? err.response?.data?.message ?? 'User not found' : 'User not found')
        }
        finally {
            setSearching(false)
        }
    }

    const handleAdd = async() => {
        if(!foundUser) return
        setAdding(true)

        try {
            await projectApi.addMember(projectId, foundUser.id)
            onAdded()
            onClose()
        }
        catch(err: unknown) {
            setError(axios.isAxiosError<{ message?: string }>(err) ? err.response?.data?.message ?? 'Failed to add member' : 'Failed to add member')
        }
        finally {
            setAdding(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-[#242528] border border-[#55575c] p-5 w-full max-w-sm shadow-2xl">
                <h2 className="text-lg font-bold mb-4 text-[#e0e1e3]">Add Member</h2>
                
                <div className="flex gap-2">
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter member's email"
                        className="flex-1 border border-[#55575c] bg-[#1c1d1f] text-[#e0e1e3] placeholder:text-[#85878a] px-3 py-2 text-sm"
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button onClick={handleSearch} disabled={searching} className="border border-[#55575c] text-[#d0d2d5] px-3 py-2 text-sm disabled:opacity-50">
                        {searching ? '...' : 'Find'}
                    </button>
                </div>
                
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                
                {foundUser && (
                    <div className="mt-4 flex items-center justify-between bg-[#1c1d1f] border border-[#36373a] p-3">
                        <div>
                            <p className="font-medium text-sm text-[#e0e1e3]">{foundUser.name}</p>
                            <p className="text-[#96999e] text-xs">{foundUser.email}</p>
                        </div>
                        <button onClick={handleAdd} disabled={adding} className="bg-[#6f9deb] text-[#101214] font-semibold text-sm px-3 py-1.5 disabled:opacity-50">
                            {adding ? 'Adding...' : 'Add'}
                        </button>
                    </div>
                )}
                
                <div className="flex justify-end mt-6">
                    <button onClick={onClose} className="text-sm text-[#96999e]">Close</button>
                </div>
            </div>
        </div>
    )
}
