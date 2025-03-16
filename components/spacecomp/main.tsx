'use client';
import React, { useState, useEffect } from 'react';
import { Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { fetchSpacesToShow } from '@/app/actions/fetchSpacesToShow';
import { Listing } from '@prisma/client';

const DynamicMap = dynamic(() => import('./Map'), { ssr: false });

interface ListingData extends Listing {
    space: {
        name: string,
        address: string,
        city: string,
        state: string,
        photos: string[],
    }
}

function Main() {
    const [showMap, setShowMap] = useState(true);
    const [listings, setListings] = useState<ListingData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [photoIndices, setPhotoIndices] = useState<Record<string, number>>({});
    const router = useRouter();

    useEffect(() => {
        async function loadListings() {
            const data = await fetchSpacesToShow() as ListingData[];

            const initialIndices: Record<string, number> = {};
            data.forEach(listing => {
                initialIndices[listing.id] = 0;
            });

            console.log(data);
            setPhotoIndices(initialIndices);
            setListings(data);
            setIsLoading(false);
        }
        loadListings();
    }, []);

    function handlePrevPhoto(event: React.MouseEvent<HTMLElement, MouseEvent>, listingId: string, maxPhotos: number) {
        event.stopPropagation();
        setPhotoIndices(prev => ({
            ...prev,
            [listingId]: (prev[listingId] > 0) ? prev[listingId] - 1 : maxPhotos - 1
        }));
    }

    function handleNextPhoto(event: React.MouseEvent<HTMLElement, MouseEvent>, listingId: string, maxPhotos: number) {
        event.stopPropagation();
        setPhotoIndices(prev => ({
            ...prev,
            [listingId]: (prev[listingId] < maxPhotos - 1) ? prev[listingId] + 1 : 0
        }));
    }

    return (
        <div className="w-full mt-40">
            <div className={showMap ? 'grid lg:grid-cols-[2fr_1fr] gap-4' : ''}>
                <div className={`grid gap-6 mx-5 my-5 ${showMap ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
                    {isLoading &&
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="animate-pulse space-y-3">
                                <div className="h-80 bg-gray-300 rounded-xl"></div>
                                <div className="h-4 w-3/4 bg-gray-300 rounded"></div>
                                <div className="h-4 w-1/2 bg-gray-300 rounded"></div>
                            </div>
                        ))
                    }

                    {!isLoading && listings?.map((listing) => {
                        const photoCount = listing.space.photos?.length || 1;
                        const currentIndex = photoIndices[listing.id] || 0;

                        return (
                            <div
                                key={listing.id}
                                className="group relative cursor-pointer"
                                onClick={() => router.push(`/spaces/showListing/${listing.id}`)}
                            >
                                <div className="group relative">
                                    <div className="aspect-square overflow-hidden rounded-xl">
                                        <img
                                            src={listing.space.photos && listing.space.photos.length > 0
                                                ? listing.space.photos[currentIndex]
                                                : "https://via.placeholder.com/400x400?text=No+Image"}
                                            alt={listing?.space.name || "Space"}
                                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                        />
                                        <Button
                                            variant="ghost"
                                            className="absolute right-4 top-4 backdrop-blur-sm"
                                        >
                                            <Heart className="h-5 w-5" />
                                        </Button>

                                        {/* Only show navigation buttons if there are multiple photos */}
                                        {photoCount > 1 && (
                                            <>
                                                <div className="absolute left-3 top-48 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        className="h-8 w-8 rounded-full p-0 shadow-md"
                                                        onClick={(e) => handlePrevPhoto(e, listing.id, photoCount)}
                                                    >
                                                        <ChevronLeft className="h-5 w-5" />
                                                    </Button>
                                                </div>
                                                <div className="absolute right-3 top-48 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        className="h-8 w-8 rounded-full p-0 shadow-md"
                                                        onClick={(e) => handleNextPhoto(e, listing.id, photoCount)}
                                                    >
                                                        <ChevronRight className="h-5 w-5" />
                                                    </Button>
                                                </div>

                                                {/* Photo indicator dots */}
                                                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1">
                                                    {Array.from({ length: photoCount }).map((_, i) => (
                                                        <div
                                                            key={i}
                                                            className={`h-2 w-2 rounded-full ${
                                                                i === currentIndex ? 'bg-white' : 'bg-white/50'
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <div className="mt-2">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold">{listing.space.name}</h3>
                                        </div>
                                        <p className="text-muted-foreground">
                                            {listing.space.address}, {listing.space.city}, {listing.space.state}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Map component section commented out in your original code */}
            </div>
        </div>
    );
}

export default Main;
