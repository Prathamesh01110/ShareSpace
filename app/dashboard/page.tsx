"use client";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import Navbar from "@/components/navbar";
import { set } from "date-fns";
import MyBookings from "@/components/dashboard/MyBookings";
import Boards from "@/components/dashboard/Boards";
import Reviews from "@/components/dashboard/Reviwes";
import Host from "@/components/dashboard/Host";
import Profile from "@/components/dashboard/Profile";

export default function Page() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isOpen, setIsOpen] = useState(false);

  const tabs = [
    { name: "Profile", key: "profile", component: <Profile /> },
    { name: "My Bookings", key: "mybookings", component: <MyBookings/> },
    { name: "Boards", key: "boards", component: <Boards /> },
    { name: "Become a Host", key: "host", component: <Host/> },
    { name: "Reviews", key: "reviews", component: <Reviews /> },
  ];

  return (
    <div>
      <Navbar />
      <div className="flex pt-12">
        {/* Sidebar for Desktop */}
        <div className="hidden md:block w-64 bg-white text-black h-[calc(100vh-3rem)] p-5 sticky top-12">
          <h2 className="text-xl font-bold mb-5">Dashboard</h2>
          <nav>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`block w-full text-left px-4 py-2 rounded-lg my-1 transition-all ${
                  activeTab === tab.key
                    ? "bg-[#935AF6] text-white"
                    : "hover:bg-[#EDE9FE] hover:text-black"
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