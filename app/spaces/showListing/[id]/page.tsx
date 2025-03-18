import React, { Suspense } from 'react';
import ShowListing from '@/components/showListing';
import { Metadata } from 'next';
import { fetchFullListing } from '@/app/actions/fetchSpacesToShow';

function SkeletonLoader() {
    return (
        <div className="p-6 max-w-6xl mx-auto animate-pulse">
            <div className="h-6 bg-gray-300 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-2 gap-4">
                <div className="h-96 bg-gray-300 rounded col-span-1"></div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="h-44 bg-gray-300 rounded"></div>
                    <div className="h-44 bg-gray-300 rounded"></div>
                    <div className="h-44 bg-gray-300 rounded"></div>
                    <div className="h-44 bg-gray-300 rounded relative">
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-400 rounded">
                            <div className="h-6 w-6 bg-gray-500 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex space-x-4 mt-4">
                <div className="h-6 w-12 bg-gray-300 rounded"></div>
                <div className="h-6 w-12 bg-gray-300 rounded"></div>
            </div>
            <div className="h-6 bg-gray-300 rounded w-1/4 my-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/6 mb-4"></div>
            <div className="border p-4 rounded-lg bg-gray-100 mt-6">
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded mb-2"></div>
                <div className="flex space-x-2">
                    <div className="h-10 bg-gray-200 rounded flex-1"></div>
                    <div className="h-10 bg-gray-200 rounded flex-1"></div>
                </div>
                <div className="h-10 bg-gray-300 rounded mt-4"></div>
            </div>
        </div>
    );
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const listing = await fetchFullListing(params.id);
    return {
        title: listing ? `${listing.space.name} | SpaceShare` : 'Space Details | SpaceShare',
        description: listing?.space.description || 'View details about this space on SpaceShare',
        openGraph: {
            title: listing ? `${listing.space.name} | SpaceShare` : 'Space Details | SpaceShare',
            description: listing?.space.description?.slice(0, 160) || 'View details about this space on SpaceShare',
            images: listing?.space.photos?.length
                ? [{ url: listing?.space.photos[0], width: 1200, height: 630 }]
                : [],
        },
    };
}

export default async function Page({ params }: { params: { id: string } }) {
    return (
        <Suspense fallback={<SkeletonLoader />}>
            <ListingDetails id={params.id} />
        </Suspense>
    );
}

async function ListingDetails({ id }: { id: string }) {
    const listing = await fetchFullListing(id);
    if (!listing) return <div>Listing not found</div>;
    return <ShowListing params={{ id }} listing={listing} />;
}
