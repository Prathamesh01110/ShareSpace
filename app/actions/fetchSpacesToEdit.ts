'use server'
import { getServerSession } from "next-auth";
import { NEXT_AUTH } from "../lib/auth";
import prisma from "@/lib/prisma";
import { UserSession } from "./fetchUser";

export async function fetchSpacesToEdit(spaceId: string) {
    const session = await getServerSession(NEXT_AUTH) as UserSession;
    if (!session?.user?.id) {
        return null;
    }
    try {
        const space = await prisma.space.findUnique({
            where: {
                id: spaceId,
            },
        })
        return space;
    }
    catch (error) {
        return error;
    }
}
