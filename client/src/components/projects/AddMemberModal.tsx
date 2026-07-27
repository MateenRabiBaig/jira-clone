import { useState } from "react";
import { userApi } from "../../api/userApi";
import { projectApi } from "../../api/projectApi";
import type { User } from "../../types";

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
        catch(err: any) {
            setError(err.response?.data?.message ?? 'User not found')
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
        catch(err: any) {
            setError(err.response?.data?.message ?? 'Failed to add member')
        }
        finally {
            setAdding(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg">
                <h2 className="text-lg font-bold mb-4">Add Member</h2>
                
                <div className="flex gap-2">
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter member's email"
                        className="flex-1 border rounded px-3 py-2 text-sm"
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button onClick={handleSearch} disabled={searching} className="border rounded px-3 py-2 text-sm disabled:opacity-50">
                        {searching ? '...' : 'Find'}
                    </button>
                </div>
                
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                
                {foundUser && (
                    <div className="mt-4 flex items-center justify-between bg-gray-50 rounded p-3">
                        <div>
                            <p className="font-medium text-sm">{foundUser.name}</p>
                            <p className="text-gray-500 text-xs">{foundUser.email}</p>
                        </div>
                        <button onClick={handleAdd} disabled={adding} className="bg-indigo-600 text-white text-sm px-3 py-1.5 rounded disabled:opacity-50">
                            {adding ? 'Adding...' : 'Add'}
                        </button>
                    </div>
                )}
                
                <div className="flex justify-end mt-6">
                    <button onClick={onClose} className="text-sm text-gray-500">Close</button>
                </div>
            </div>
        </div>
    )
}