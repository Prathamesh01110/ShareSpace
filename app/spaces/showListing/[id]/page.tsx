import React from 'react';
import ShowListing from '@/components/showListing';
import { Metadata } from 'next';
import { Listing, OperatingHours, Prisma } from '@prisma/client';
import { fetchListingForSpaces } from '@/app/actions/fetchListingForSpaces';
import { fetchFullListing } from '@/app/actions/fetchSpacesToShow';

//here i actually once the call is made to getListingData, and that sends to both Page and generateMetadata functions using the same data since caching is done in the server side
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
    const listing = await fetchFullListing(params.id);

    if (!listing) return <div>Listing not found</div>;

    return (
        <div>
            <ShowListing params={{ id: params.id }} listing={listing} />
        </div>
    );
}
