import React from "react"

interface DashboardGridProps {
  children: React.ReactNode
}

export default function DashboardGrid({ children }: DashboardGridProps) {
  const childrenArray = React.Children.toArray(children)

  // Debug: Let's see what we're working with
  console.log(
    "All children:",
    childrenArray.map((child: any) => ({
      type: child.type?.name,
      displayName: child.type?.displayName,
      props: child.props,
    })),
  )

  // More robust filtering - check multiple ways to identify LaundryCard
  const laundryCard = childrenArray.find((child: any) => {
    const isLaundryCard =
      child.type?.name === "LaundryCard" ||
      child.type?.displayName === "LaundryCard" ||
      (typeof child.type === "function" && child.type.name === "LaundryCard") ||
      (child.key && child.key.includes("laundry")) ||
      (child.props && Object.keys(child.props).length === 0 && child.type?.name?.includes("Laundry"))

    console.log("Checking child for laundry:", {
      typeName: child.type?.name,
      displayName: child.type?.displayName,
      isFunction: typeof child.type === "function",
      functionName: typeof child.type === "function" ? child.type.name : null,
      key: child.key,
      isLaundryCard,
    })

    return isLaundryCard
  })

  const otherCards = childrenArray.filter((child: any) => {
    const isNotLaundryCard = !(
      child.type?.name === "LaundryCard" ||
      child.type?.displayName === "LaundryCard" ||
      (typeof child.type === "function" && child.type.name === "LaundryCard") ||
      (child.key && child.key.includes("laundry")) ||
      (child.props && Object.keys(child.props).length === 0 && child.type?.name?.includes("Laundry"))
    )
    return isNotLaundryCard
  })

  console.log("Filtered results:", {
    laundryCard: !!laundryCard,
    otherCardsCount: otherCards.length,
  })

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      {/* 1. Full-width Laundry section - MUST be alone in first row */}
      {laundryCard && (
        <div className="w-full mb-12">
          <div className="bg-gradient-to-br from-bgLight to-white rounded-2xl p-2 shadow-sm">{laundryCard}</div>
        </div>
      )}

      {/* 2. Dynamic grid for remaining cards */}
      {otherCards.length > 0 && (
        <div className={`grid grid-cols-1 gap-8 ${
          otherCards.length === 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-3'
        }`}>
          {otherCards}
        </div>
      )}
    </div>
  )
}
