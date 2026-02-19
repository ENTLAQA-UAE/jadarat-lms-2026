"use server"
import { createClient } from "@/utils/supabase/server";
import axios from "axios";

export const getSignedURL = async (id: string) => {
    const supabase = await createClient()
    const { data: creatorDetails } = await supabase.rpc("get_creator_details")
    try {
        const { data } = await axios.get('https://api.coassemble.com/api/v1/headless/course/view', {
            params: {
                id: parseFloat(id),
                identifier: creatorDetails[0].creator_user,
                clientIdentifier: creatorDetails[0].creator_organization
            },
            headers: {
                'Authorization': process.env.COASSEMBLE || ""
            }
        });

        return data || undefined; // Return undefined if no data is returned
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 400) {
            return undefined; // Return undefined for 400 status
        }
        throw error; // Re-throw other errors
    }
};

export const getSignedURLForEdit = async (id: string) => {
    const supabase = await createClient()
    const { data: creatorDetails } = await supabase.rpc("get_creator_details")
    const { data } = await axios.get('https://api.coassemble.com/api/v1/headless/course/edit', {
        params: {
            id: parseFloat(id),
            identifier: creatorDetails[0].creator_user,
            clientIdentifier: creatorDetails[0].creator_organization
        },
        headers: {
            'Authorization': process.env.COASSEMBLE || ""
        }
    });

    return data;
};
