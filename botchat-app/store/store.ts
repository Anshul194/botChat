import { configureStore } from '@reduxjs/toolkit';

import authReducer from './slices/authSlice';
import settingsReducer from './slices/settingsSlice';
import usersReducer from './slices/usersSlice';
import plansReducer from './slices/plansSlice';
import modulesReducer from './slices/modulesSlice';
import aiTrainingReducer from './slices/aiTrainingSlice';
import bioReducer from './slices/bioSlice';
import linksReducer from './slices/linksSlice';
import vcardsReducer from './slices/vcardsSlice';
import socialPostingReducer from './slices/socialPostingSlice';
import carouselReducer from './slices/carouselSlice';
import domainsReducer from './slices/domainsSlice';
import pixelsReducer from './slices/pixelsSlice';
import smartInboxReducer from './slices/smartInboxSlice';
import subscriptionReducer from './slices/subscriptionSlice';
import paymentReducer from './slices/paymentSlice';
import superadminSubscriptionReducer from './slices/superadminSubscriptionSlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        settings: settingsReducer,
        users: usersReducer,
        plans: plansReducer,
        modules: modulesReducer,
        aiTraining: aiTrainingReducer,
        bio: bioReducer,
        links: linksReducer,
        vcards: vcardsReducer,
        socialPosting: socialPostingReducer,
        carousel: carouselReducer,
        domains: domainsReducer,
        pixels: pixelsReducer,
        smartInbox: smartInboxReducer,
        subscription: subscriptionReducer,
        payment: paymentReducer,
        superadminSubscription: superadminSubscriptionReducer,
        notification: notificationReducer,
    },
    devTools: process.env.NODE_ENV !== 'production',

});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
