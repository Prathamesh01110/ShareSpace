"use server"
import { getServerSession } from "next-auth"
import prisma from "@/lib/prisma";
import { NEXT_AUTH } from "../lib/auth";

export interface UserSession {
    user: {
        name: string | null,
        email: string,
        image: string | null,
        id: string,
    } | null,
}
export const fetchBookingForID = async  (spaceId: string): Promise<any> => {
    const session = await getServerSession(NEXT_AUTH) as UserSession;

    if (!session?.user?.id) {
        return null;
    }

    const spaces = await prisma.booking.findMany({
        where: {
            spaceId: spaceId,
        }
    });

    console.log("Spaces", spaces);

    return spaces;
};

export const fetchBookingForUserID = async  (): Promise<any> => {
    const session = await getServerSession(NEXT_AUTH) as UserSession;

    if (!session?.user?.id) {
        return null;
    }

    const spaces = await prisma.booking.findMany({
        where: {
            userId: session.user.id,
        }
    });

    console.log("Spaces", spaces);

    return spaces;
};

export const ChangeBookingStatus = async (bookingId: string) => {
    const session = await getServerSession(NEXT_AUTH) as UserSession;

    if (!session?.user?.id) {
        return null;
    }

    const updatedBooking = await prisma.booking.update({
        where: {
            id: bookingId,
        },
        data: {
            status: 'CONFIRMED',
        }
    });

    return updatedBooking;
}

export const ChangePaymentStatus = async (bookingId: string) => {    
    const session = await getServerSession(NEXT_AUTH) as UserSession;

    if (!session?.user?.id) {
        return null;
    }

    const ChangedPayment = await prisma.booking.update({
        where: {
            id: bookingId,
        },
        data: {
            paymentStatus: 'PAID',
        }
    });

    const ChangedStatus = await prisma.booking.update({
        where:{
            id: bookingId,
        },
        data:{
            status: 'COMPLETED',
        }
    });

    return {ChangedPayment, ChangedStatus};
}