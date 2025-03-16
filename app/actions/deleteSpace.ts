'use server'
import { getServerSession } from "next-auth";
import { UserSession } from "./fetchUser";
import { NEXT_AUTH } from "../lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteSpace(spaceId: string) {
    const session = await getServerSession(NEXT_AUTH) as UserSession;
    if (!session) return null;
    try {
        await prisma?.space?.delete({
            where: {
                id: spaceId,
            },
        });
        revalidatePath("/becomeHost");
    } catch (error) {
        return error;
    }
}
