import React, { useState, useRef, useEffect } from "react";
import Bookingcal from "./Bookingcal";
import { Button } from "@/components/ui/button";
import { FullListingData } from "@/app/actions/fetchSpacesToShow";
import { Select, SelectContent, SelectItem, SelectValue, SelectGroup, SelectLabel, SelectTrigger } from "@/components/ui/select";
import { createBooking } from "@/app/actions/createBooking";

export type BookingType = {
    listingId: string,
    date: Date,
    startTime: number,
    endTime: number,
    attendees: number,
    totalPrice: number,
    subtotal: number,
    processingFee: number,
    discountAmount: number,
    hours: number,
};

const BookingSummary = ({ spaceData }: { spaceData: FullListingData }) => {
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [selectedOption, setSelectedOption] = useState("1-5");
    const [customAttendees, setCustomAttendees] = useState("");
    const [price, setPrice] = useState(1);
    const [allTimes, setAllTimes] = useState<{ time: string, display: string, hour: number, available: boolean }[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const calendarRef = useRef(null);
    const minimumHours = spaceData?.minimumHours || 1;

    useEffect(() => {
        setPrice(spaceData?.hourlyRate || 1);
    }, [spaceData]);

    const formatToAmPm = (hour: number) => {
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:00 ${ampm}`;
    };

    useEffect(() => {
        if (selectedDate && spaceData?.space?.operatingHours) {
            const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
            const dayOfWeek = days[selectedDate.getDay()];

            const operatingHoursForDay = spaceData.space.operatingHours.find(
                (hours) => hours.dayOfWeek === dayOfWeek
            );

            const times = [];
            for (let i = 0; i < 24; i++) {
                times.push({
                    time: `${i}:00`,
                    display: formatToAmPm(i),
                    hour: i,
                    available: false
                });
            }

            if (operatingHoursForDay && operatingHoursForDay.isOpen) {
                const openTime = parseInt(operatingHoursForDay.openTime || "");
                const closeTime = parseInt(operatingHoursForDay.closeTime || "");

                for (let i = 0; i < times.length; i++) {
                    if (i >= openTime && i < closeTime - minimumHours + 1) {
                        times[i].available = true;
                    }
                }
            }

            setAllTimes(times);
        } else {
            const times = Array.from({ length: 24 }, (_, i) => ({
                time: `${i}:00`,
                display: formatToAmPm(i),
                hour: i,
                available: false
            }));
            setAllTimes(times);
        }
    }, [selectedDate, spaceData?.space?.operatingHours, minimumHours]);

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        setShowCalendar(false);
        setStartTime("");
        setEndTime("");
    };

    const handleStartTimeChange = (value: string) => {
        setStartTime(value);
        setEndTime("");
    };

    const getValidEndTimes = () => {
        if (!startTime) return allTimes.map(item => ({ ...item, available: false }));

        const startHour = allTimes.find(t => t.time === startTime)?.hour || 0;

        return allTimes.map(item => {
            const isValid = item.hour > startHour && item.hour >= startHour + minimumHours && item.available;
            return {
                ...item,
                available: isValid
            };
        });
    };

    const calculateTotal = () => {
        if (!startTime || !endTime) return null;

        const startHour = allTimes.find(t => t.time === startTime)?.hour || 0;
        const endHour = allTimes.find(t => t.time === endTime)?.hour || 0;
        const hours = endHour - startHour;

        if (hours < minimumHours) return null;

        const attendees = parseInt(customAttendees) || 1;
        const pricePerHour = spaceData?.hourlyRate || 1;

        let subtotal = Math.ceil(pricePerHour * hours);
        let discountAmount = 0;

        if (spaceData?.discount as number > 0 && hours >= 8) {
            discountAmount = Math.ceil(subtotal * ((spaceData?.discount ?? 1) / 100));
            subtotal = subtotal - discountAmount;
        }

        let processingFee = Math.ceil(subtotal * 0.05);
        if (attendees > 50) {
            processingFee += Math.ceil(subtotal * 0.05);
        }

        const total = Math.ceil(subtotal + processingFee);

        return { subtotal, discountAmount, processingFee, total, hours };
    };

    const totalData = calculateTotal();

    const isDateAvailable = () => {
        if (!selectedDate || !spaceData?.space?.operatingHours) return false;

        const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        const dayOfWeek = days[selectedDate.getDay()];

        const operatingHoursForDay = spaceData.space.operatingHours.find(
            (hours) => hours.dayOfWeek === dayOfWeek
        );

        return operatingHoursForDay?.isOpen || false;
    };

    const getUnavailableDays = () => {
        if (!spaceData?.space?.operatingHours) return [];

        const closedDays = spaceData.space.operatingHours
            .filter(hours => !hours.isOpen)
            .map(hours => {
                const daysMap: { [key: string]: number } = {
                    'SUNDAY': 0, 'MONDAY': 1, 'TUESDAY': 2, 'WEDNESDAY': 3,
                    'THURSDAY': 4, 'FRIDAY': 5, 'SATURDAY': 6
                };
                return daysMap[hours.dayOfWeek];
            });

        return closedDays;
    };

    const meetsMinimumHours = () => {
        if (!startTime || !endTime) return false;

        const startHour = allTimes.find(t => t.time === startTime)?.hour || 0;
        const endHour = allTimes.find(t => t.time === endTime)?.hour || 0;
        return (endHour - startHour) >= minimumHours;
    };

    const getErrorMessage = () => {
        if (selectedDate && !isDateAvailable()) {
            return "This date is not available for booking";
        }

        if (startTime && endTime && !meetsMinimumHours()) {
            return `Minimum booking duration is ${minimumHours} hour${minimumHours > 1 ? 's' : ''}`;
        }

        return "";
    };

    const errorMessage = getErrorMessage();

    // New function to handle the booking submission
    const handleSubmitBooking = async () => {
        if (!selectedDate || !startTime || !endTime || !totalData) {
            setSubmitError("Please complete all required booking information");
            return;
        }

        if (!isDateAvailable() || !meetsMinimumHours()) {
            setSubmitError(errorMessage);
            return;
        }

        setIsSubmitting(true);
        setSubmitError("");

        try {
            const attendeesCount = selectedOption === "50+" ? parseInt(customAttendees) :
                parseInt(selectedOption.split("-")[1]) || 5;

            const formattedDate = selectedDate.toISOString().split('T')[0];

            const startHour = allTimes.find(t => t.time === startTime)?.hour || 0;
            const endHour = allTimes.find(t => t.time === endTime)?.hour || 0;

            const bookingData:BookingType = {
                listingId: spaceData?.id || "",
                date: selectedDate,
                startTime: startHour,
                endTime: endHour,
                attendees: attendeesCount,
                totalPrice: totalData.total,
                subtotal: totalData.subtotal,
                processingFee: totalData.processingFee,
                discountAmount: totalData.discountAmount,
                hours: totalData.hours,
            };
            await createBooking(bookingData);
            console.log("Submitting booking data:", bookingData);
        } catch (error) {
            console.error("Booking submission error:", error);
            setSubmitError("Failed to submit booking. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="md:col-span-1 ">
            <div className="sticky top-8 border rounded-none p-6 space-y-6 pt-10">
                <div className="flex flex-col items-center">
                    {totalData ? (
                        <div className="flex flex-col items-center">
                            <div className="flex justify-between items-center w-full gap-1">
                                <div className="w-6 h-6">⚡</div>
                                <span className="flex items-center text-3xl font-bold">
                                    ₹{totalData.total}
                                </span>
                                <span className="pt-2 font-bold">/hr</span>
                            </div>
                            <span className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                                Estimated Total
                            </span>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1 items-center">
                            <span className="text-sm text-[#9068ED]">Add details to view total price</span>
                            <div className="flex justify-between items-center w-36">
                                <div className="w-6 h-6">⚡</div>
                                <span className="flex items-center text-3xl font-bold">
                                    ₹{spaceData?.hourlyRate}
                                </span>
                                <span className="pt-2 font-bold">/hr</span>
                            </div>
                            <span className="text-sm text-gray-500 text-center">{minimumHours} hr minimum</span>
                        </div>
                    )}
                </div>

                {spaceData?.discount as number > 0 && (
                    <>
                        <hr className="border-t border-gray-200 -m-6" />
                        <div className="flex flex-row justify-between">
                            <span className="text-sm text-gray-800">8+ hour discount</span>
                            <span className="text-xs bg-gray-100 p-1 px-2 rounded-xl text-gray-800">{spaceData?.discount}% off</span>
                        </div>
                    </>
                )}
                <hr className="border-t border-gray-200 -m-6" />

                {/* Date & Time Picker */}
                <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                        <div className="relative w-full">
                            <label className="text-sm font-bold">date and time*</label>
                            <div
                                className={`border mt-1 rounded-none py-3 px-2 cursor-pointer bg-white flex flex-row items-center gap-2 h-full w-full ${selectedDate && !isDateAvailable() ? 'border-red-500' : ''}`}
                                onClick={() => setShowCalendar(!showCalendar)}
                            >
                                <div className="flex flex-row gap-2 items-center">
                                    <span className={`text-sm pl-1 ${selectedDate && !isDateAvailable() ? 'text-red-500' : 'text-gray-500'}`}>
                                        {selectedDate ? selectedDate.toDateString() : "start date"}
                                        {selectedDate && !isDateAvailable() ? ' (Unavailable)' : ''}
                                    </span>
                                </div>
                            </div>

                            {showCalendar && (
                                <div
                                    ref={calendarRef}
                                    className="absolute top-15 left-0 z-50 bg-white w-full shadow-lg border"
                                >
                                    <Bookingcal
                                        schedules={spaceData?.space?.operatingHours || {}}
                                        onDateChange={handleDateSelect}
                                        unavailableDays={getUnavailableDays()}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex flex-row rounded-none">
                            <Select
                                onValueChange={handleStartTimeChange}
                                value={startTime}
                                disabled={!isDateAvailable()}
                            >
                                <SelectTrigger className={`rounded-none h-12 ${!allTimes.some(t => t.available) && selectedDate ? 'border-red-500' : ''}`}>
                                    <SelectValue placeholder="start time" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup className="flex flex-col text-md text-gray-600">
                                        {allTimes.length > 0 ? (
                                            allTimes.map((timeObj) => (
                                                <SelectItem
                                                    value={timeObj.time}
                                                    key={timeObj.time}
                                                    disabled={!timeObj.available}
                                                    className={`text-md pl-8 ${!timeObj.available ? 'line-through text-gray-400' : 'text-gray-600'}`}
                                                >
                                                    {timeObj.display}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="no-times" disabled className="text-gray-400 text-md pl-8">
                                                No available times
                                            </SelectItem>
                                        )}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <Select
                                onValueChange={setEndTime}
                                value={endTime}
                                disabled={!startTime || !isDateAvailable()}
                            >
                                <SelectTrigger className={`rounded-none h-12 ${startTime && endTime && !meetsMinimumHours() ? 'border-red-500' : ''}`}>
                                    <SelectValue placeholder="end time" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup className="flex flex-col gap-2 pl-3">
                                        <SelectLabel>Time</SelectLabel>
                                        {getValidEndTimes().map((timeObj) => (
                                            <SelectItem
                                                value={timeObj.time}
                                                key={timeObj.time}
                                                disabled={!timeObj.available}
                                                className={`text-md pl-8 ${!timeObj.available ? 'line-through text-gray-400' : 'text-gray-800'}`}
                                            >
                                                {timeObj.display}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        {errorMessage && (
                            <p className="text-red-500 text-xs mt-1">{errorMessage}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold">Attendees</label>
                        <Select
                            onValueChange={setSelectedOption}
                            value={selectedOption}
                        >
                            <SelectTrigger className="rounded-none h-12">
                                <SelectValue placeholder="Number of people" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup className="flex flex-col text-md text-gray-600">
                                    <SelectItem value={`{1-${spaceData?.capacity}}`} className="text-gray-600 text-md pl-8">1 - {spaceData?.capacity} people</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                    </div>
                </div>

                {totalData && (
                    <div >
                        <h3 className=" font-semibold mb-2">Price</h3>
                        <div className="flex pb-2 justify-between text-gray-500">
                            <span>₹{price} x {totalData.hours} hrs</span>
                            <span>₹{(price * totalData.hours).toFixed(2)}</span>
                        </div>

                        {totalData.discountAmount > 0 && (
                            <div className="flex justify-between pb-2 text-gray-500">
                                <span>8+ hours discount ({spaceData?.discount}%)</span>
                                <span className="text-green-600">-₹{totalData.discountAmount.toFixed(2)}</span>
                            </div>
                        )}

                        <div className="flex justify-between text-gray-500">
                            <span className="flex items-center gap-2 pb-2 ">
                                Processing
                                <span className="relative group cursor-pointer">
                                    <span className="text-xs text-white  bg-[#d2d4d8] rounded-full px-1">?</span>
                                    <div className="absolute hidden group-hover:block bg-white border p-2 shadow-md rounded-md w-56 text-xs text-gray-700 left-1/2 transform -translate-x-1/2 mt-1">
                                        This covers costs that allow SpaceShare to complete your transaction and provide support for your booking.
                                    </div>
                                </span>
                            </span>
                            <span>₹{totalData.processingFee.toFixed(2)}</span>
                        </div>

                        <hr className="my-2" />
                        <div className="flex justify-between font-semibold">
                            <span>Total</span>
                            <span>₹{totalData.total.toFixed(2)}</span>
                        </div>
                    </div>
                )}

                {submitError && (
                    <p className="text-red-500 text-sm">{submitError}</p>
                )}

                <Button
                    className="w-full bg-[#8559EC] text-lg hover:bg-[#5838A2] rounded-none p-6 font-medium"
                    disabled={!totalData || !isDateAvailable() || !meetsMinimumHours() || isSubmitting}
                    onClick={handleSubmitBooking}
                >
                    {isSubmitting ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                        </span>
                    ) : (
                        spaceData?.instantBooking === 'EVERYONE' ? "Book Now" : "Request to Book"
                    )}
                </Button>

                <p className="text-xs text-muted-foreground">
                    You won't be charged yet
                </p>
                {spaceData?.instantBooking === 'EVERYONE' ? (
                    <div>
                        <p className="text-lg font-semibold pb-2">⚡ Instant Book </p>
                        <p className="text-xs text-muted-foreground leading-5 pl-6">After payment, your booking will be instantly confirmed. Enjoy a seamless and hassle-free booking experience.</p>
                    </div>
                ) : (
                    <div>
                        <p className="text-sm text-muted-foreground">You won't be charged yet</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingSummary;
