import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../../types";
import { clearStoredToken, setStoredToken } from "../../config/env";
import { authApi } from "../../api/authApi";

export type AuthStatus = "initializing" | "authenticated" | "unauthenticated";

interface AuthState {
    status: AuthStatus;
    user: User | null;
}

// A stored token means we may still have a valid session; /auth/me will tell us.
const initialState: AuthState = {
    status: localStorage.getItem("token") ? "initializing" : "unauthenticated",
    user: null,
};

interface AuthPayload {
    user: User;
    token: string;
}

const applyAuth = (payload: AuthPayload) => {
    setStoredToken(payload.token);
    return payload.user;
};

export const initializeAuth = createAsyncThunk<User>("auth/initialize", async () => {
    const { user } = await authApi.getMe();
    return user;
});

export const loginUser = createAsyncThunk<User, { email: string; password: string }>(
    "auth/login",
    async (credentials) => applyAuth(await authApi.login(credentials)),
);

export const registerUser = createAsyncThunk<User, { name: string; email: string; password: string }>(
    "auth/register",
    async (data) => applyAuth(await authApi.register(data)),
);

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        /** Fired when the axios interceptor sees a 401 on an expired token. */
        sessionExpired(state) {
            clearStoredToken();
            state.status = "unauthenticated";
            state.user = null;
        },

        logout(state) {
            clearStoredToken();
            state.status = "unauthenticated";
            state.user = null;
        },

        userUpdated(state, action: PayloadAction<User>) {
            state.user = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(initializeAuth.fulfilled, (state, action) => {
                state.user = action.payload;
                state.status = "authenticated";
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.user = action.payload;
                state.status = "authenticated";
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.user = action.payload;
                state.status = "authenticated";
            })
            .addCase(initializeAuth.rejected, (state) => {
                clearStoredToken();
                state.status = "unauthenticated";
                state.user = null;
            });
    },
});

export const { sessionExpired, logout, userUpdated } = authSlice.actions;
export default authSlice.reducer;
