
"use server"
import { getServerSession } from "next-auth"
import { NEXT_AUTH } from "../lib/auth"
import { UserSession } from "./fetchUser";
import prisma from "@/lib/prisma";
import { PolicyFormValues } from "../becomeHost/policies/[id]/page";


export async function createPolicy(data: PolicyFormValues, spaceId: string) {
    const session = await getServerSession(NEXT_AUTH) as UserSession;
    if (!session) return { error: "Unauthorized" };
    const { policiesAccepted } = data;
    console.log(data);
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
                agreesToPolicies: policiesAccepted,
                progress: {
                    upsert: {
                        create: {
                            policiesCompleted: true,
                        },
                        update: {
                            policiesCompleted: true,
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
