'use server'
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function fetchSpacesToShow() {
    try {
        const listings = await prisma.listing.findMany({
            include: {
                space: {
                    select: {
                        name: true,
                        address: true,
                        city: true,
                        state: true,
                        photos: true,
                        operatingHours: true,
                    }
                }
            }
        })
        return listings;
    } catch (error) {
        return error;
    };
}

export type FullListingData = Prisma.ListingGetPayload<{
    include: {
        space: {
            include: {
                operatingHours: true,
            }
        }
    }
}> | null;

export async function fetchFullListing(listingId: string): Promise<FullListingData> {
    try {
        const listing = await prisma.listing.findUnique({
            where: {
                id: listingId,
            },
            include: {
                space: {
                    include: {
                        operatingHours: true,
                    }
                }
            }
        })
        return listing;
    } catch (error) {
        console.error(error);
        throw Error("Error fetching listing data");
    }

}

export async function FirstListIdFromSpace(listingId: string): Promise<FullListingData> {
    try {
        console.log("Fetching listing for spaceId:", listingId);
        const listing = await prisma.listing.findFirst({
            where: {
                spaceId: listingId,
            },
            include: {
                space: {
                    include: {
                        operatingHours: true,
                    }
                }
            }
        })
        console.log("Listing fetched:", listing);   
        return listing;
    } catch (error) {
        console.error(error);
        throw Error("Error fetching listing data");
    }

}