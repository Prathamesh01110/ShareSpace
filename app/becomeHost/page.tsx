"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { Space } from "@prisma/client"
import { fetchSpaces } from "../actions/fetchSpaces"
import { deleteSpace } from "../actions/deleteSpace"

export default function BecomeHostPage() {
    const router = useRouter();
    const { status } = useSession();
    const [space, setSpace] = useState<Space[]>([]);

    async function handleSubmit() {
        try {
            router.push('/becomeHost/createSpace/new');
        } catch (error) {
            console.error("Error creating space", error);
        }
    }
    async function handleDeleteSpace(spaceId: string) {
        try {
            await deleteSpace(spaceId);
            console.log("Deleted space");
            setSpace((prevSpaces) => prevSpaces.filter((item) => item.id !== spaceId));
        }
        catch (error) {
            console.log("Error deleting space", error);
        }
    }
    async function handleResume(spaceId: string) {
        try {
            router.push(`/becomeHost/createSpace/${spaceId}`);
        } catch (error) {
            console.error("Error creating space", error);
        }
    }
    useEffect(() => {
        async function getSpace() {
            try {
                const result = await fetchSpaces() as Space[];
                setSpace(result);
            } catch (error) {
                console.error("Error fetching spaces", error);
            }
        }
        if (status === 'authenticated') {
            getSpace();
        }
    }, [status]);

    useEffect(() => {
        if (status === 'loading') return;
        if (status === 'unauthenticated') {
            router.push('/');
        }
    }, [status, router])
    if (status === "loading") {
        return <div>Loading...</div>;
    }
    return (
        <div>
            <nav className={"w-full z-50 transition-all duration-300 fixed top-0 bg-black/90"}>
                <div className="flex items-center justify-between px-6 py-2 mx-auto">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="text-4xl font-bold text-white p-3">SpaceShare</span>
                    </Link>
                    <span className="text-white text-lg mr-10  font-medium">My Spaces</span>
                </div>
            </nav>
            <main>
                <div className="w-[58%] pt-32 flex-col flex mx-auto ">
                    <div className="flex flex-row items-center justify-between pb-10">
                        <h1 className="font-bold text-3xl ">Spaces</h1>
                        <Button className="rounded-none  font-semibold p-6" variant={"outline"} onClick={handleSubmit}>Add a Space</Button>
                    </div>
                    {space?.length > 0 ? (space?.map((space,index) => (
                        <div className="border w-full h-24 flex flex-row items-center p-8 justify-between mb-10" key={index}>
                            <span className="font-bold text-2xl">{space.name}</span>
                            <div className="flex flex-row items-center gap-6">
                                <Button className="w-24 h-12 rounded-none bg-[#8559EC] font-bold " onClick={() => handleResume(space.id)} >Resume</Button>
                                <Trash2 onClick={() => handleDeleteSpace(space.id)} />
                            </div>
                        </div>))) : (
                        <span className="text-xl font-medium text-gray-400">No Spaces found :(</span>
                    )}
                </div>
            </main>
        </div>
    )
}
