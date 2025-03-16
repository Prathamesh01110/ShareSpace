"use server"
import { getServerSession } from "next-auth"
import prisma from "@/lib/prisma";
import { NEXT_AUTH } from "../lib/auth";
import { UserSession } from "./fetchUser";

export const fetchProgress = async (spaceId: string) => {
    const session = await getServerSession(NEXT_AUTH) as UserSession;

    if (!session?.user?.id) {
        return null;
    }

    const progress = await prisma.spaceProgress.findUnique({
        where: {
            spaceId: spaceId,
        },
        select: {
            addressCompleted: true,
            spaceDetailsCompleted: true,
            photosCompleted: true,
            policiesCompleted: true,
            healthSafetyCompleted: true,
            operatingHoursCompleted: true,
            cancellationPolicyCompleted: true,
            typeOfSpaceCompleted: true,
            activityCompleted: true,
        }
    });

    return progress;
}
