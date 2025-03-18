'use client'
import { fetchPhotos } from "@/app/actions/fetchPhotos";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react"

export default function ShowPhotos({ params }: { params: { id: string } }) {
    const listingId = params.id;
    const [photos, setPhotos] = useState<string[]>([]);

    useEffect(() => {
        async function getPhotos() {
            const photos = await fetchPhotos(listingId);
            setPhotos(photos);
        }
        getPhotos();
    }, [listingId]);

    return <>
        <div className="md:p-10 p-6 pt-12">
            <Link href={`/spaces/showListing/${listingId}`} className="flex flex-row gap-2 items-center pb-8">
                <ChevronLeft />
                <span className="text-lg">Back</span>
            </Link>
            <div className="grid md:grid-cols-3 grid-cols-1 sm:grid-cols-2 gap-8 ">
                {photos && photos.length > 0 ? (
                    photos.map((photo, index) => (
                        <img
                            key={index}
                            src={photo}
                            alt={`listing image ${index + 1}`}
                            className="w-full md:h-[450px] h-[300px] rounded-md"
                        />
                    ))
                ) : (
                    <span>No photos available</span>
                )}
            </div>
        </div>
    </>
}
