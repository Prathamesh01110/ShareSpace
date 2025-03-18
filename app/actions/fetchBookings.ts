'use server'

import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { NEXT_AUTH } from "../lib/auth"
import { UserSession } from "./fetchUser"
import { Booking } from "@prisma/client"

export async function fetchBookings(): Promise<Booking[]> {
    const session = await getServerSession(NEXT_AUTH) as UserSession;
        console.log("userId: ",session?.user?.id);
    if (!session?.user?.id) {
        console.log("Unauthorized");
        return [];
    }
    try {
        const bookings = await prisma.booking.findMany({
            where: { userId: session?.user?.id },
        })
        console.log("bookings: ", bookings);
        return bookings;
    } catch (error) {
        console.error("Error fetching bookings ", error);
        return [];
    }
}
