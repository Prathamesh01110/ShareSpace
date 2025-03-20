"use client";
import { useState, useEffect } from "react";
import "react-calendar/dist/Calendar.css";
import ModernCalendar from "./ModernCalendar";
import { fetchBookings } from "../../app/actions/fetchBookings";
import { Booking } from "@prisma/client";

export default function Bookings({fetchedBookings}:{fetchedBookings:any}) {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [schedules, setSchedules] = useState<Record<string, any>>({});

    useEffect(() => {
       setSchedules(fetchedBookings);
    }, []);

    const handleDateChange = (date: Date) => {
        setSelectedDate(date);
    };

    return (
        <div className="flex flex-col-reverse custom-xl:flex-row 2xl:gap-6 py-5 xl:p-5 mt-6">
            <div className="w-full custom-xl:w-[70%] h-full p-4 bg-white">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="p-4 bg-white border-2 border-[#EDE9FE] rounded-xl ">
          <h3 className="text-gray-500 text-sm">Total Bookings</h3>
          <p className="text-xl font-semibold text-gray-900">45</p>
        </div>
        <div className="p-4 bg-white border-2 border-[#EDE9FE] rounded-xl ">
          <h3 className="text-gray-500 text-sm">New Customers</h3>
          <p className="text-xl font-semibold text-gray-900">35</p>
        </div>
        <div className="p-4 bg-white border-2 border-[#EDE9FE] rounded-xl ">
          <h3 className="text-gray-500 text-sm">Avg booking/day</h3>
          <p className="text-xl font-semibold text-gray-900">3</p>
        </div>
        <div className="p-4 bg-white border-2 border-[#EDE9FE] rounded-xl ">
          <h3 className="text-gray-500 text-sm">Forthcoming</h3>
          <p className="text-xl font-semibold text-gray-900">12</p>
        </div>
      </div>
                <h2 className="text-xl md:text-2xl font-bold mb-6 text-gray-900">
                    Scheduled for: <span className="text-violet-600">{selectedDate.toDateString()}</span>
                </h2>

                <div className="space-y-4">
                    {schedules[selectedDate.toDateString()]?.length > 0 ? (
                        schedules[selectedDate.toDateString()].map((schedule: any, index: number) => (
                            <div
                                key={index}
                                className="p-4 md:p-6 rounded-2xl shadow-lg border border-gray-200 bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 relative"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="space-y-1">
                                        <h3 className="font-semibold text-gray-900 text-base md:text-lg">{schedule.name}</h3>
                                        <p className="text-xs md:text-sm text-gray-600">{schedule.people} People</p>
                                    </div>

                                    <div className="bg-violet-100 text-violet-600 px-4 md:px-5 py-2 md:py-3 rounded-xl font-semibold text-xs md:text-sm shadow-sm">
                                        {schedule.hour}:{schedule.minute} {schedule.ampm} - {schedule.endHour}:{schedule.endMinute} {schedule.endAmpm}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs md:text-sm text-gray-600">Status: {schedule.approval}</p>
                                </div>

                                <div className="flex flex-col items-end text-right">
                                    <p className="text-xs md:text-sm text-gray-700 font-semibold">₹{schedule.perperson}/person</p>
                                    <p className="text-lg md:text-2xl text-gray-700 font-semibold">₹{schedule.payment}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500">No schedules for this day.</p>
                    )}
                </div>
            </div>

            <div className="w-full custom-xl:w-[30%] py-2 2xl:p-4">
                <ModernCalendar schedules={schedules} onDateChange={handleDateChange} />
            </div>
        </div>
    );
}