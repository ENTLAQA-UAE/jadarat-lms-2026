import { configureStore } from '@reduxjs/toolkit'
import organizationSlice from './organization.slice'
import userSlice from './user.slice'
import notificationSlice from './notification.slice'


export const store = configureStore({
    reducer: {
        organization: organizationSlice,
        user: userSlice,
        notification: notificationSlice,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch