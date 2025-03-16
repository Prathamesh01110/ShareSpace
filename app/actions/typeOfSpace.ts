"use server"
import { getServerSession } from "next-auth"
import { NEXT_AUTH } from "../lib/auth"
import { UserSession } from "./fetchUser";
import prisma from "@/lib/prisma";
import { SpaceFormData } from "../becomeHost/typeOfSpace/[id]/page";


export async function createTypeOfSpace(data: SpaceFormData, spaceId: string) {
    const session = await getServerSession(NEXT_AUTH) as UserSession;
    if (!session) return { error: "Unauthorized" };
    console.log(data);
    const {
        spaceTitle,
        spaceDescription,
        bookingSize,
        houseRules,
        allowedGuests,
        wifiName,
        wifiPassword,
        arrivalInstructions,
    } = data
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
                name: spaceTitle,
                description: spaceDescription,
                size: bookingSize,
                rules: houseRules,
                age: allowedGuests,
                wifiName: wifiName,
                wifiPassword: wifiPassword,
                arrivalInstructions: arrivalInstructions,
                progress: {
                    upsert: {
                        create: {
                            typeOfSpaceCompleted: true,
                        },
                        update: {
                            typeOfSpaceCompleted: true,
                        }
                    }
                }
            }
        })
    } catch (error) {
        return {
            error: error || "Unknown error",
        }
    }
}
