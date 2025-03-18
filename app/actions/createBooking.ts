'use server'

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { NEXT_AUTH } from "../lib/auth"
import { UserSession } from "./fetchUser"
import { BookingType } from "@/components/spacecomp/slug/Booking";

export async function createBooking(data: BookingType) {
    const session = await getServerSession(NEXT_AUTH) as UserSession;
    if (!session?.user?.id) return { error: "Unauthorized" };
    console.log(data);
    try {
        await prisma?.booking.create({
            data: {
                listingId: data.listingId,
                userId: session.user.id,
                date: data.date,
                startTime: data.startTime,
                endTime: data.endTime,
                attendees: data.attendees,
                totalPrice: data.totalPrice,
                subtotal: data.subtotal,
                processingFee: data.processingFee,
                discountAmount: data.discountAmount,
                hours: data.hours,
            }
        })
    } catch (error) {
        console.error("Error while creating Booking ", error);
    }
}
