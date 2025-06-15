// REMOVED FROM LaundryCard.tsx - Developer Reference Only
// This component handled the "Start Using", "Stop Using", and "I've Collected Items" buttons

function ActionButton({ machine }: { machine: any }) {
  const handleClick = () => {
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/checkin?machine=${machine.id}`
    window.open(url, "_blank")
  }

  if (machine.status === "free") {
    return (
      <button
        onClick={handleClick}
        className="w-full bg-accent hover:bg-teal-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
      >
        <span className="flex items-center justify-center gap-2">
          <span>▶️</span>
          <span>Start Using</span>
        </span>
      </button>
    )
  }

  if (machine.status === "finishedGrace") {
    return (
      <button
        onClick={handleClick}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] animate-pulse-slow focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
      >
        <span className="flex items-center justify-center gap-2">
          <span>✅</span>
          <span>I've Collected Items</span>
        </span>
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      className="w-full bg-warn hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-warn focus:ring-offset-2"
    >
      <span className="flex items-center justify-center gap-2">
        <span>⏹️</span>
        <span>Stop Using</span>
      </span>
    </button>
  )
}

export default ActionButton
