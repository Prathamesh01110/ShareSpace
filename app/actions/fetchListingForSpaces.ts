'use server'
import prisma from "@/lib/prisma";

export async function fetchListingForSpaces(spaceId: string) {
    try {
        const space = await prisma.space.findUnique({
            where: {
                id: spaceId,
            },
        })
        const operatingHours = await prisma.operatingHours.findMany({
            where: {
                spaceId: spaceId,
            },
        });
        return [space, operatingHours];
    }
    catch (error) {
        return error;
    }
}

