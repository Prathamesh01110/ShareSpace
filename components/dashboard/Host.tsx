import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { fetchSpaces } from "@/app/actions/fetchSpaces";
import { Space } from "@prisma/client"


export default function Host() {
    const router = useRouter();
    const [spaces, setSpaces] = useState<Space[]>([]);
    useEffect(() => {
        const getSession = async () => {
            const fetchedSpaces = await fetchSpaces() as Space[];
            
            if (Array.isArray(fetchedSpaces)) {
                setSpaces(fetchedSpaces);
            } else if (fetchedSpaces) {
                setSpaces([fetchedSpaces]);
            } else {
                setSpaces([]);
            }
            console.log("This is from the Fetched",fetchedSpaces);
            console.log("This is from the Fetched",spaces);
        };
        getSession();
    }, []);

    const handleDashboardClick = (id: string)=> {
        console.log("Dashboard button pressed");
        router.push(`/dashboard/${id}`);
    };

    async function handleSubmit() {
        try {
            router.push('/becomeHost/createSpace/new');
        } catch (error) {
            console.error("Error creating space", error);
        }
    }

    return (
        <div className="flex flex-col items-start gap-6 py-5 px-4 xl:px-10 mt-6">
        <div className="flex flex-row items-center justify-between w-full">
        <h1 className="text-3xl font-bold text-gray-900">Your Spaces</h1>
        <Button className="rounded-none  font-semibold p-6" variant={"outline"} onClick={handleSubmit}>Add a Space</Button>
        </div>
        <div className="space-y-4 w-full">
            {spaces.length > 0 ? (
                spaces.map((space) => (
                    <div 
                        key={space.id} 
                        className="p-4 md:p-6 rounded-2xl shadow-lg border border-gray-200 bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 relative"
                    >
                        {/* Image & Name */}
                        <div className="flex items-center gap-4">
                            <Image 
                                src={space.photos?.[0] ?? "/default-image.jpg"} 
                                alt={space.name ?? "Space Image"} 
                                width={100} 
                                height={80} 
                                className="rounded-lg object-cover"
                            />
                            <h3 className="font-semibold text-gray-900 text-lg">
                                {space.name ?? "No Name"}
                            </h3>
                        </div>

                        {/* Dashboard Button */}
                        <Button 
                            onClick={() => handleDashboardClick(space.id)} 
                            className="text-white px-4 py-2 font-semibold border rounded-none bg-[#8559EC] transition"
                        >
                            Dashboard
                        </Button>
                    </div>
                ))
            ) : (
                <p className="text-gray-500">No spaces found.</p>
            )}
        </div>
    </div>
    )
}
