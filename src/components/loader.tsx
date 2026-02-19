'use client'

import { useLottie } from "lottie-react";
import animationData from "../../public/animation/loading.json";

export const LoadingAnimation = () => {
    const { View } = useLottie({
        animationData: animationData,
        loop: true,
        autoplay: true,
        style: {
            width: 150
        }
    })

    return (
        <div className='w-full h-screen flex justify-center items-center'>
            {View}
        </div>
    )
}