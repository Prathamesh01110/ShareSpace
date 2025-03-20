'use client';
import { useState, useEffect } from "react";
import { FirstListIdFromSpace } from "@/app/actions/fetchSpacesToShow";
import { useParams } from "next/navigation";
import ShowSpace from "./ShowSpace";

export default function Preview() {
    const { id } = useParams();
    const [listing, setListing] = useState(null);
    useEffect(() => {
        console.log('ID:', id);
        const renderList = async () => {
            if (!id) return; 
    
            try {
                const response = await FirstListIdFromSpace(id); // Await here
                console.log('Response:', response);
                setListing(response);
            } catch (error) {
                console.error("Error fetching listing:", error);
            }
        };
    
        renderList();
    }, [id]); 
    
    return(
        <div>
            <ShowSpace params={{ id }} listing={listing}/>
        </div>
    )
}