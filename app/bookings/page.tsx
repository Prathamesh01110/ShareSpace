'use client'

import { Booking } from "@prisma/client";
import { useEffect, useState } from "react";
import { fetchBookings } from "../actions/fetchBookings";

export default function Bookings() {
    const [bookings, setBookings] = useState<Booking[]>([]);

    useEffect(() => {
        async function loadBookings() {
            const fetchedBookings = await fetchBookings();
            setBookings(fetchedBookings);
        };
        loadBookings();
    }, [])
    console.log(bookings);
    return (
    <div>hi</div>
    );
}
