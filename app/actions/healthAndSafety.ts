"use server"
import { getServerSession } from "next-auth"
import prisma from "@/lib/prisma";
import { NEXT_AUTH } from "../lib/auth"
import { UserSession } from "./fetchUser";

export async function createHealthAndSafety(data: any, spaceId: string) {
    const session = await getServerSession(NEXT_AUTH) as UserSession;
    if (!session) return { error: "Unauthorized" };
    console.log(data);
    const { cleaningMeasures, protectiveGear, distanceMeasures, covidSignage } = data;

    const space = await prisma?.space?.findUnique({
        where: {
            id: spaceId,
        }
    });
    if (!space || space.userId !== session?.user?.id) {
        return null;
    }

    try {
        await prisma?.space?.update({
            where: {
                id: spaceId,
            },
            data: {
                cleaningMeasures: cleaningMeasures,
                protectiveGear: protectiveGear,
                distanceMeasures: distanceMeasures,
                covidSignage: covidSignage,
                progress: {
                    upsert: {
                        create: {
                            healthSafetyCompleted: true,
                        },
                        update: {
                            healthSafetyCompleted: true,
                        }
                    }
                }
            }
        })
    } catch (error) {
        return {
            error: error || "Unknwon error",
        }
    }
}

