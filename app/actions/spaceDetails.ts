"use server"
import { getServerSession } from "next-auth"
import { NEXT_AUTH } from "../lib/auth"
import { UserSession } from "./fetchUser";
import { SpaceFormValues } from "../becomeHost/spaceDetails/[id]/page";
import prisma from "@/lib/prisma";
import { ParkingOptions } from "@prisma/client";


export async function createSpaceDetails(data: SpaceFormValues, spaceId: string) {
    const session = await getServerSession(NEXT_AUTH) as UserSession;
    if (!session) return { error: "Unauthorized" };
    const { spaceType, overnightStays, hasParking, parkingOptions, parkingDescription, hasSecurityCameras } = data
    console.log(data);
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
                typeOfSpace: spaceType,
                overNightStays: overnightStays,
                hasParking: hasParking,
                parkingOptions: parkingOptions as ParkingOptions[],
                parkingDescription: parkingDescription,
                securityCameras: hasSecurityCameras,
                progress: {
                    upsert: {
                        create: {
                            spaceDetailsCompleted: true,
                        },
                        update: {
                            spaceDetailsCompleted: true,
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

