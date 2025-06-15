"use client"

import DashboardGrid from "@/src/components/DashboardGrid"
import LaundryCard from "@/src/components/LaundryCard"
import NoiseCard from "@/src/components/NoiseCard"
import SubletCard from "@/src/components/SubletCard"
import HelpMeCard from "@/src/components/HelpMeCard"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold text-center mb-6">Dorm Dashboard</h1>

        <DashboardGrid>
          <LaundryCard />
          <NoiseCard />
          <SubletCard />
          <HelpMeCard />
        </DashboardGrid>
      </div>
    </div>
  )
}
