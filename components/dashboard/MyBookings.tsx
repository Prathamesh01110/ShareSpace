"use client";
import { useEffect, useState } from "react";
import { fetchBookingForUserID, ChangePaymentStatus } from "@/app/actions/fetechBookingForID";
import { Button } from "@/components/ui/button";

export default function MyBookings() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState<"all" | "accepted" | "requested">("all");
    const [render, setRender] = useState<boolean>(false);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                setLoading(true);
                const data = await fetchBookingForUserID();
                setBookings(data);
            } catch (error) {
                console.error("Error fetching bookings:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, [render]);

    const handlePayNow = async (bookingId: string) => {
        try {
            await ChangePaymentStatus(bookingId);
            alert("Payment successful!");
            setRender(prev => !prev);
        } catch (error) {
            console.error("Payment failed:", error);
            alert("Payment failed. Try again!");
        }
    };

    const formatTime = (hour: number): string => {
        const ampm = hour >= 12 ? "PM" : "AM";
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}.00 ${ampm}`;
    };

    const unpaidBookings = bookings.filter(booking => booking.paymentStatus === "UNPAID" && booking.status === "CONFIRMED");
    const paidOrConfirmedBookings = bookings.filter(booking => booking.paymentStatus !== "UNPAID");
    const acceptedBookings = bookings.filter(booking => booking.status === "COMPLETED" && booking.paymentStatus === "PAID");
    const requestedBookings = bookings.filter(booking => booking.status === "PENDING" );

    const changeTab = (tab: "all" | "accepted" | "requested") => {
        setActiveTab(tab);
    };

    useEffect(() => {
        const hash = window.location.hash.replace("#", "");
        if (["all", "accepted", "requested"].includes(hash)) {
            setActiveTab(hash as "all" | "accepted" | "requested");
        }
    }, []);

    if (loading) return <p className="text-center py-10 text-xl">Loading...</p>;

    return (
        <div className="flex flex-col-reverse custom-xl:flex-row 2xl:gap-6 py-5 xl:p-5 mt-6">
            <div className="w-full custom-xl:w-[70%] h-full sm:p-4 md:p-6 bg-white rounded-lg">
                <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-gray-900 px-2 md:px-0">
                    My Bookings
                    <div className="w-16 h-1 bg-violet-500 rounded-full mt-1"></div>
                </h2>
 
                <div className="flex overflow-x-auto md:overflow-visible border-b mb-4 pb-1 hide-scrollbar">
                    <button
                        onClick={() => changeTab("all")}
                        className={`px-3 md:px-4 py-2 whitespace-nowrap text-sm md:text-base ${activeTab === "all" ? "border-b-2 border-violet-600 text-violet-600 font-medium" : "text-gray-500"}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => changeTab("accepted")}
                        className={`px-3 md:px-4 py-2 whitespace-nowrap text-sm md:text-base ${activeTab === "accepted" ? "border-b-2 border-violet-600 text-violet-600 font-medium" : "text-gray-500"}`}
                    >
                        Accepted Bookings
                    </button>
                    <button
                        onClick={() => changeTab("requested")}
                        className={`px-3 md:px-4 py-2 whitespace-nowrap text-sm md:text-base ${activeTab === "requested" ? "border-b-2 border-violet-600 text-violet-600 font-medium" : "text-gray-500"}`}
                    >
                        Requested Bookings
                    </button>
                </div>
                
                {activeTab === "all" ? (
                    <div className="grid gap-4 px-2 md:px-0">
                        {unpaidBookings.length > 0 && (
                            <div>
                                <h3 className="text-center py-2 rounded-t-2xl font-semibold text-xs md:text-sm lg:text-lg bg-yellow-100 text-yellow-600 mb-3">Pending Payments</h3>
                                {unpaidBookings.map((booking) => (
                                    <div key={booking.id} className="p-3 md:p-5 mb-5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between">
                                        <div className="flex items-start md:items-center space-x-4 mb-3 md:mb-0">
                                            <div>
                                                <h3 className="text-base md:text-lg font-semibold">{booking.spaceName}</h3>
                                                <p className="text-gray-500 text-sm">₹{(booking.totalPrice / booking.attendees).toFixed(2)}/person</p>
                                                <p className="text-gray-500 text-xs md:text-sm">{new Date(booking.date).toLocaleDateString()} | {formatTime(booking.startTime)} - {formatTime(booking.endTime)}</p>
                                            </div>
                                        </div>
                                        {booking.status === "CONFIRMED" && (
                                        <div className="flex flex-col items-start md:items-end">
                                            <p className="text-gray-800 font-semibold text-base md:text-lg mb-2">Total: ₹{booking.totalPrice}</p>
                                            <Button className="px-3 py-1 md:px-4 md:py-2 bg-violet-600 text-white rounded-lg w-full md:w-auto" onClick={() => handlePayNow(booking.id)}>
                                                Pay Now
                                            </Button>
                                        </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        {requestedBookings.length > 0 &&(
                            <div>
                                <h3 className="text-center py-2 rounded-t-2xl font-semibold text-xs md:text-sm lg:text-lg bg-blue-100 text-blue-600 mb-3">Requested</h3>
                                {requestedBookings.map((booking) => (
                                    <div key={booking.id} className="p-3 md:p-4 mb-5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between">
                                        <div className="flex items-start md:items-center space-x-4 mb-3 md:mb-0">
                                            <div>
                                                <h3 className="text-base md:text-lg font-semibold">{booking.spaceName}</h3>
                                                <p className="text-gray-600 text-sm">Total: ₹{booking.totalPrice}</p>
                                                <p className="text-gray-500 text-xs md:text-sm">{new Date(booking.date).toLocaleDateString()} | {formatTime(booking.startTime)} - {formatTime(booking.endTime)}</p>
                                            </div>
                                        </div>
                                        <div className="text-sm md:text-base">
                                            <p className="text-gray-500">The Request will be soon Accepted by Host</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {paidOrConfirmedBookings.length > 0 && (
                            <div className="mt-4">
                                <h3 className="text-center py-2 rounded-t-2xl font-semibold text-xs md:text-sm lg:text-lg bg-green-100 text-green-600 mb-3">Completed & Confirmed</h3>
                                {paidOrConfirmedBookings.map((booking) => (
                                    <div key={booking.id} className="p-3 md:p-5 mb-5 border rounded-xl flex flex-col md:flex-row md:items-center justify-between">
                                        <div className="flex items-start md:items-center space-x-4 mb-3 md:mb-0">
                                            <div className="flex flex-col justify-between w-full">
                                                <h3 className="text-base md:text-lg font-semibold">{booking.spaceName}</h3>
                                                <p className="text-gray-500 text-xs md:text-sm">{new Date(booking.date).toLocaleDateString()} | {formatTime(booking.startTime)} - {formatTime(booking.endTime)}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-row md:flex-col justify-between w-full md:w-auto items-center md:items-end">
                                            <p className="text-gray-500 text-sm">₹{(booking.totalPrice / booking.attendees).toFixed(2)}/person</p>
                                            <p className="text-gray-800 font-semibold text-base md:text-lg">Total: ₹{booking.totalPrice}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : activeTab === "accepted" ? (
                    <div className="grid gap-4 px-2 md:px-0">
                        {acceptedBookings.length > 0 ? (
                            acceptedBookings.map((booking) => (
                                <div key={booking.id} className="p-3 md:p-5 mb-5 border rounded-xl flex flex-col md:flex-row md:items-center justify-between">
                                    <div className="flex items-start md:items-center space-x-4 mb-3 md:mb-0">
                                        <div className="flex flex-col justify-between w-full">
                                            <h3 className="text-base md:text-lg font-semibold">{booking.spaceName}</h3>
                                            <p className="text-gray-500 text-xs md:text-sm">{new Date(booking.date).toLocaleDateString()} | {formatTime(booking.startTime)} - {formatTime(booking.endTime)}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-row md:flex-col justify-between w-full md:w-auto items-center md:items-end">
                                        <p className="text-gray-500 text-sm">₹{(booking.totalPrice / booking.attendees).toFixed(2)}/person</p>
                                        <p className="text-gray-800 font-semibold text-base md:text-lg">Total: ₹{booking.totalPrice}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500">No accepted bookings found.</p>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-4 px-2 md:px-0">
                        {requestedBookings.length > 0 ? (
                            requestedBookings.map((booking) => (
                                <div key={booking.id} className="p-3 md:p-4 mb-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between">
                                    <div className="flex items-start md:items-center space-x-4 mb-3 md:mb-0">
                                        <div>
                                            <h3 className="text-base md:text-lg font-semibold">{booking.spaceName}</h3>
                                            <p className="text-gray-600 text-sm">Total: ₹{booking.totalPrice}</p>
                                            <p className="text-gray-500 text-xs md:text-sm">
                                                {new Date(booking.date).toLocaleDateString()} | {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-sm md:text-base">
                                        <p className="text-gray-500">The Request will be soon Accepted by Host</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500">No requested bookings found.</p>
                        )}
                    </div>                
                )}
            </div>
        </div>
    );
}