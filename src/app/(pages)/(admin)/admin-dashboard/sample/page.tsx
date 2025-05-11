"use client"

import { ChevronDown, ChevronRight, Trash2 } from "lucide-react"
import { useState } from "react"

export default function SampleAdminPage() {
  const [activeTab, setActiveTab] = useState("Posted")
  const tabs = ["Posted", "Pending", "Rejected"]

  const donationDrives = [
    { title: "Donation Drive #1", details: "Donation Drive Details" },
    { title: "Donation Drive #2", details: "Donation Drive Details" },
    { title: "Donation Drive #3", details: "Donation Drive Details" },
    { title: "Donation Drive #4", details: "Donation Drive Details" },
    { title: "Donation Drive #5", details: "Donation Drive Details" },
    { title: "Donation Drive #6", details: "Donation Drive Details" },
    { title: "Donation Drive #7", details: "Donation Drive Details" },
    { title: "Donation Drive #8", details: "Donation Drive Details" },
    { title: "Donation Drive #9", details: "Donation Drive Details" },
    { title: "Donation Drive #10", details: "Donation Drive Details" },
    { title: "Donation Drive #11", details: "Donation Drive Details" },
    { title: "Donation Drive #12", details: "Donation Drive Details" },
    { title: "Donation Drive #13", details: "Donation Drive Details" },
    { title: "Donation Drive #14", details: "Donation Drive Details" },
    { title: "Donation Drive #15", details: "Donation Drive Details" },
  ]

  const [toggles, setToggles] = useState(donationDrives.map(() => false))

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2 text-[14px]">
        <div>Home</div>
        <div>
          <ChevronRight size={15} />
        </div>
        <div>Manage Donation Drives</div>
      </div>
      <div className="w-full">
        <div className="flex items-center justify-between">
          <div className="font-bold text-3xl">Manage Donation Drive</div>
          <div className="bg-[var(--primary-blue)] text-[14px] text-white px-4 py-2 rounded-full cursor-pointer hover:bg-blue-600">
            + Create Donation Drive
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {/* Tabs */}
        <div className="w-full flex gap-2">
          {tabs.map((tab) => (
            <div
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full flex flex-col items-center justify-end rounded-t-2xl overflow-hidden pt-0.4 cursor-pointer ${
                activeTab === tab ? "bg-[var(--primary-blue)]" : "bg-white"
              }`}
            >
              {/* Blue bar above active tab */}
              <div
                className={`w-full h-1 transition-colors ${
                  activeTab === tab ? "bg-[var(--primary-blue)]" : "bg-transparent"
                }`}
              ></div>
              <div
                className={`w-full py-3 flex items-center justify-center gap-1 rounded-t-2xl font-semibold text-base ${
                  activeTab === tab ? "text-[var(--primary-blue)] bg-white" : "text-blue-200 bg-white"
                }`}
              >
                {tab}
                <div
                  className={`h-6 w-6 rounded-full flex items-center justify-center text-[13px] text-white ${
                    activeTab === tab ? "bg-amber-400" : "bg-blue-200"
                  }`}
                >
                  50
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl flex gap-3 p-2.5 pl-4 items-center">
          <div className="text-sm font-medium">Filter by:</div>
          <div className="bg-gray-300 pl-2 pr-1 py-1 rounded-md flex gap-1 items-center justify-between text-sm font-medium cursor-pointer hover:bg-gray-400">
            <div className="text-xs">Any Date</div>
            <ChevronDown size={20} />
          </div>
          <div className="bg-gray-300 pl-2 pr-1 py-1 rounded-md flex gap-1 items-center justify-between text-sm font-medium cursor-pointer hover:bg-gray-400">
            <div className="text-xs">Status</div>
            <ChevronDown size={20} />
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-2xl overflow-hidden w-full p-4">
          <div className="rounded-xl overflow-hidden border border-gray-300 relative">
            {/* Table with proper HTML table elements */}
            <div className="max-h-[70vh] overflow-auto">
              <table className="w-full border-collapse">
                {/* Table Header - Using position: sticky */}
                <thead className="sticky top-0 z-10">
                  <tr className="bg-blue-100 w-full text-xs">
                    <th className="text-left p-4 font-semibold w-1/2">Donation Drive Info</th>
                    <th className="text-center p-4 font-semibold w-1/6">Active</th>
                    <th className="text-center p-4 font-semibold w-1/6">Actions</th>
                    <th className="w-1/6"></th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody>
                  {donationDrives.map((drive, index) => (
                    <tr
                      key={index}
                      className={`border-t border-gray-300 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50`}
                    >
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <div className="text-base font-bold">{drive.title}</div>
                          <div className="text-sm text-gray-600">{drive.details}</div>
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="flex justify-center">
                          <div
                            onClick={() => setToggles((prev) => prev.map((val, i) => (i === index ? !val : val)))}
                            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                              toggles[index] ? "bg-blue-600" : "bg-gray-300"
                            }`}
                          >
                            <div
                              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                                toggles[index] ? "translate-x-6" : "translate-x-0"
                              }`}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="text-blue-600 hover:underline cursor-pointer">View Details</div>
                      </td>
                      <td className="text-center">
                        <Trash2 size={20} className="text-gray-500 hover:text-red-500 cursor-pointer mx-auto" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
