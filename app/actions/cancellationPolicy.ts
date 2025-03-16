"use server"
import { getServerSession } from "next-auth"
import { NEXT_AUTH } from "../lib/auth"
import { UserSession } from "./fetchUser";
import prisma from "@/lib/prisma";
import { CancellationPolicy } from "@prisma/client";
import { FormValues } from "../becomeHost/cancellationPolicy/[id]/page";


export async function createCancellationPolicy(data: FormValues, spaceId: string) {
    const session = await getServerSession(NEXT_AUTH) as UserSession;
    if (!session) return { error: "Unauthorized" };
    const { cancellationPolicy } = data;
    console.log(cancellationPolicy);
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
                cancellationPolicy: cancellationPolicy as CancellationPolicy,
                progress: {
                    upsert: {
                        create: {
                            cancellationPolicyCompleted: true,
                        },
                        update: {
                            cancellationPolicyCompleted: true,
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
