"use server"
import { getServerSession } from "next-auth";
import { ActivitiesSchema } from "../hooks/useActivitiesForm";
import { UserSession } from "./fetchUser";
import prisma from "@/lib/prisma";
import { NEXT_AUTH } from "../lib/auth";
import { CleaningRate } from "@prisma/client";

export default async function createActivity(data: ActivitiesSchema, spaceId: string) {
    const session = await getServerSession(NEXT_AUTH) as UserSession;
    if (!session) return { error: "Unauthorized" };

    const { meeting, events, media } = data;

    const space = await prisma.space.findUnique({
        where: {
            id: spaceId,
        }
    });

    if (!space || space.userId !== session?.user?.id)
        return { error: "Unauthorized" };

    console.log(meeting);
    const cleanData = (data: any) => {
        return {
            hourlyRate: Number(data.hourlyRate) || 0,
            minimumHours: Number(data.minimumHours) || 0,
            discount: Number(data.discount) || 0,
            cleaningRate: data.cleaningRate as CleaningRate,
            additionalFee: Number(data.additionalFee) || 0,
            instantBooking: data.instantBooking || 'NONE',
            amenities: Array.isArray(data.amenities) ? data.amenities : [],
            capacity: Number(data.capacity) || 0,
            customAmenities: Array.isArray(data.customAmenities) ? data.customAmenities : []
        };
    };

    try {
        if (meeting?.enabled) {
            await prisma.listing.upsert({
                where: {
                    spaceId_type: {
                        spaceId: spaceId,
                        type: "MEETING",
                    }
                },
                update: { type: "MEETING", ...cleanData(meeting) },
                create: { spaceId, type: "MEETING", ...cleanData(meeting) },
            });
        }

        if (events?.enabled) {
            await prisma.listing.upsert({
                where: {
                    spaceId_type: {
                        spaceId: spaceId,
                        type: "EVENTS",
                    }
                },
                update: { type: "EVENTS", ...cleanData(events) },
                create: { spaceId, type: "EVENTS", ...cleanData(events) },
            });
        }

        if (media?.enabled) {
            await prisma.listing.upsert({
                where: {
                    spaceId_type: {
                        spaceId: spaceId,
                        type: "MEDIA_PRODUCTION",
                    }
                },
                update: { type: "MEDIA_PRODUCTION", ...cleanData(media) },
                create: { spaceId, type: "MEDIA_PRODUCTION", ...cleanData(media) },
            });
        }

        await prisma.space.update({
            where: {
                id: spaceId,
            },
            data: {
                progress: {
                    upsert: {
                        where: {
                            spaceId: spaceId
                        },
                        create: {
                            activityCompleted: true,
                        },
                        update: {
                            activityCompleted: true,
                        }
                    }
                }
            }
        });

        return { success: true };
    } catch (error) {
        console.error("Activity creation error:", error);
        return {
            error: "Failed to create activity",
            message: error instanceof Error ? error.message : "Unknown error"
        };
    }
}
