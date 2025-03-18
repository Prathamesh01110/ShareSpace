'use server'
import prisma from "@/lib/prisma";

export async function fetchPhotos(listingId: string): Promise<string[] | []> {
    try {
        const listing = await prisma.listing.findUnique({
            where: {
                id: listingId,
            },
            select: {
                space: {
                    select: {
                        photos: true,
                    }
                }
            }
        })
        console.log(listing);
        return listing?.space.photos || [];
    } catch (error) {
        console.log("Error while fetching Photos", error);
        return [];
    }
}
