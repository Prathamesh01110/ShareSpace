'use client'
import { fetchListingDetails } from "@/app/actions/fetchListingDetails";
import { fetchListingsToEdit } from "@/app/actions/fetchSpacesToEdit";
import { Listing } from "@prisma/client";
import { ChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, use } from "react";

export default function ShowPhotos(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params);
    const listingId = params.id;
    const [photos, setPhotos] = useState<string[]>([]);

    useEffect(() => {
        async function getPhotos() {
            const listing = await fetchListingsToEdit(listingId) as Listing;
            setPhotos(listing?.photos);
        }
        getPhotos();
    }, [listingId]);

    return <>
        <div className="p-10 pt-12">
            <Link href={`/becomeHost/showListing/${listingId}`} className="flex flex-row gap-2 items-center pb-8">
                <ChevronLeft />
                <span className="text-lg">Back</span>
            </Link>
            <div className=" grid grid-cols-3 gap-8 ">
                {photos && photos.length > 0 ? (
                    photos.map((photo, index) => (
                        <img
                            key={index}
                            src={photo}
                            alt={`listing image ${index + 1}`}
                            className="w-full h-[450px] rounded-md"
                        />
                    ))
                ) : (
                    <span>No photos available</span>
                )}
            </div>
        </div>
    </>
}
