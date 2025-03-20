"use client";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import Navbar from "@/components/navbar";
import Bookings from "@/components/dashboard/Booking";
import Approval from "@/components/dashboard/Approval";
import Payments from "@/components/dashboard/Payment";
import { useParams } from "next/navigation";
import { fetchBookingForID } from "@/app/actions/fetechBookingForID";
import Preview from "@/components/dashboard/Preview";
import EditSpace from "@/components/dashboard/EditSpace";

export default function Page() {
  const [activeTab, setActiveTab] = useState("preview");
  const [isOpen, setIsOpen] = useState(false);
  const [bookings, setBookings] = useState<any>([]);
  const params = useParams();
  const id = params.id;

  useEffect(() => {
    async function loadBookings() {
        const fetchedBookings = await fetchBookingForID(id as string);
        const tempSchedules: Record<string, any> = {};
        
        fetchedBookings.forEach((booking: any) => {
            if (!booking.date) return;
            
            const dateKey = new Date(booking.date).toDateString();
            const startHour = booking.startTime > 12 ? booking.startTime - 12 : booking.startTime;
            const endHour = booking.endTime > 12 ? booking.endTime - 12 : booking.endTime;
            const ampm = booking.startTime >= 12 ? "PM" : "AM";
            const endAmpm = booking.endTime >= 12 ? "PM" : "AM";
            const approval = booking.status;
            
            const totalPrice = Number(booking.totalPrice) || 0;
            const attendees = Number(booking.attendees) || 1;
            
            const newSchedule = {
                id: booking.id,
                hour: startHour.toString(),
                minute: "00",
                ampm,
                endHour: endHour.toString(),
                endMinute: "00",
                endAmpm,
                payment: totalPrice.toString(),
                people: attendees.toString(),
                name: booking.userName || "Guest",
                perperson: (totalPrice / attendees).toFixed(2),
                approval,
            };
            
            if (!tempSchedules[dateKey]) {
                tempSchedules[dateKey] = [];
            }
            tempSchedules[dateKey].push(newSchedule);
        });
        
        setBookings(tempSchedules);
    }

    loadBookings();
}, []);

  const tabs = [
    { name: "Preview", key: "preview", component: <Preview /> },
    { name: "Bookings", key: "bookings", component: <Bookings fetchedBookings={bookings}/> },
    { name: "Payments", key: "payments", component: <Payments /> },
    { name: "Approval", key: "approval", component: <Approval fetchedBookings={bookings}/> },
    { name: "Edit Space", key: "edit", component: <EditSpace id={id as string}/> },
  ];

  return (
    <div>
      <Navbar />
      <div className="flex pt-12">
        {/* Sidebar for Desktop */}
        <div className="hidden md:block w-64 bg-white text-black h-[calc(100vh-3rem)] p-5 sticky top-12">
          <h2 className="text-xl font-bold mb-12"></h2>
          <nav>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`block w-full text-left px-4 py-2 rounded-lg my-1 transition-all ${
                  activeTab === tab.key
                    ? "bg-[#935AF6] text-white"
                    : "hover:bg-[#EDE9FE] "
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden fixed top-24 left-4 z-50">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 bg-gray-900 text-white rounded-md"
          >
            <Menu size={24} />
          </button>
          {isOpen && (
            <div className="absolute top-12 left-0 w-48 bg-gray-900 text-white p-4 rounded-lg shadow-lg">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setIsOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-2 rounded-lg transition-all ${
                    activeTab === tab.key ? "bg-gray-700" : "hover:bg-gray-800"
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-5">{tabs.find((tab) => tab.key === activeTab)?.component}</div>
      </div>
    </div>
  );
}