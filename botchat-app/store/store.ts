import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import settingsReducer from './slices/settingsSlice';
import usersReducer from './slices/usersSlice';
import plansReducer from './slices/plansSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        settings: settingsReducer,
        users: usersReducer,
        plans: plansReducer,
    },
    devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
