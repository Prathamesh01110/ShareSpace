"use server"
import { getServerSession } from "next-auth"
import { NEXT_AUTH } from "../lib/auth"
import { UserSession } from "./fetchUser";
import prisma from "@/lib/prisma";
import { FormAddress } from "../becomeHost/address/[id]/page";

export async function createAddress(data: FormAddress, spaceId: string) {
    const session = await getServerSession(NEXT_AUTH) as UserSession;
    if (!session) return { error: "Unauthorized" };
    const { address, landmark, state, city, pincode } = data
    try {
        if (spaceId === 'new') {
            const space = await prisma?.space?.create({
                data: {
                    userId: session?.user?.id || " ",
                    name: "Untitled",
                }
            })
            spaceId = space.id;
        }
        await prisma?.space?.update({
            where: {
                id: spaceId,
            },
            data: {
                address: address,
                landmark: landmark,
                state: state,
                city: city,
                pincode: pincode,
                progress: {
                    upsert: {
                        create: {
                            addressCompleted: true,
                        },
                        update:{
                            addressCompleted: true,
                        }
                    }
                }
            }
        })
        return spaceId;
    } catch (error) {
        return {
            error: error || "Unknown error",
        }
    }
}
