import { CoursesType } from "@/app/home/types";
import { User } from "@/app/dashboard/@org_admin/user-management/types";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface userStateType {
    user: User,
    courses: CoursesType[],
    fetched: boolean
}

export const initialState: userStateType = {
    user: {
        role: 'learner',
        organization_id: 0
    },
    courses: [],
    fetched: false
};

export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser(state, action: PayloadAction<User>) {
            state.user = action.payload
            state.fetched = true
        },
        setUserCourses(state, action: PayloadAction<CoursesType[]>) {
            state.courses = action.payload
            state.fetched = true
        },
        resetUser(state) {
            state.courses = []
            state.fetched = false
        }
    },
});

export const { setUser, setUserCourses, resetUser } = userSlice.actions;

export default userSlice.reducer;