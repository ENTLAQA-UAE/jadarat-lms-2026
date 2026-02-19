import axios from "axios"

export const getSelectedCourse = async (id: number) => {
    const { data } = await axios.get('https://api.coassemble.com/api/v1/headless/courses', {
        headers: {
            "Authorization": process.env.NEXT_PUBLIC_COASSEMBLE
        }
    })

    return data.find((e: any) => e.id === id)
}