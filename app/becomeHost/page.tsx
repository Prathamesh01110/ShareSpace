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
                        <span className="text-2xl sm:text-4xl font-bold text-white py-4 sm:p-3">SpaceShare</span>
                    </Link>
                    <span className="text-white text-lg mr-10 sm:block hidden font-medium">My Spaces</span>
                </div>
            </nav>
            <main>
                <div className="lg:w-[58%] w-[85%] md:w-[80%] pt-32 flex-col flex mx-auto">
                    <div className="flex flex-row items-center justify-between pb-10">
                        <h1 className="font-bold text-3xl ">Spaces</h1>
                        <Button className="rounded-none  font-semibold p-6" variant={"outline"} onClick={handleSubmit}>Add a Space</Button>
                    </div>
                    {space?.length > 0 ? (space?.map((space,index) => (
                        <div className="border w-full sm:h-24 h-30 flex flex-col sm:flex-row sm:items-center sm:p-8 p-4 sm:justify-between mb-10" key={index}>
                            <span className="font-bold sm:text-2xl text-xl">{space.name}</span>
                            <div className="flex flex-row items-center sm:gap-6 pt-4 gap-4 justify-between">
                                <Button className="sm:w-24 w-full sm:h-12 h-10 rounded-none bg-[#8559EC] font-bold " onClick={() => handleResume(space.id)} >Resume</Button>
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
