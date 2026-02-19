'use client'

import HomePage from "@/components/app/home";
import { useAppSelector } from "@/hooks/redux.hook";
import GeneralPage from "./lmsDashboard";

function Home() {
    const user = useAppSelector(state => state.user)

    if (!user.user.id) {
        return <></>
    } 
    switch (user.user.role) {

        case "organizationAdmin":
            return <HomePage />

        case "LMSAdmin":
            return <GeneralPage />

        default:
            return <></>
    }
}

export default Home