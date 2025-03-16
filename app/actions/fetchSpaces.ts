'use server'
import { getServerSession } from "next-auth";
import { NEXT_AUTH } from "../lib/auth";
import prisma from "@/lib/prisma";
import { UserSession } from "./fetchUser";

export async function fetchSpaces() {
    const session = await getServerSession(NEXT_AUTH) as UserSession;
    if (!session?.user?.id) {
        return null;
    }
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: session.user.id,
            },
            select: {
                spaces: true,
            },
        })
        return user?.spaces;
    }
    catch (error) {
        return error;
    }
}
