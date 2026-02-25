'use server'

import { createClient } from "@/utils/supabase/server";
import axios from "axios";

export async function createCoassembleCourse(flow: string | null): Promise<string> {
  const supabase = await createClient()
  const { data } = await supabase.rpc("get_creator_details")

  try {
    const response = await axios.get(
      `https://api.coassemble.com/api/v1/headless/course/edit`,
      {
        params: {
          clientIdentifier: data[0].creator_organization,
          identifier: data[0].creator_user,
          ...(flow && { flow })
        },
        headers: {
          'Authorization': process.env.COASSEMBLE || ""
        }
      }
    );

    return response.data;

  } catch (error) {
    console.error('Coassemble course creation error:', error);
    throw new Error('Failed to create a course on Coassemble');
  }
}