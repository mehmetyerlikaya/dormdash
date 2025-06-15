// REMOVED FROM LaundryCard.tsx - Developer Reference Only
// This component handled the QR code generation for quick check-ins

import { QRCodeSVG } from "qrcode.react"

function QRCodeSection({ machine }: { machine: any }) {
  return (
    <div className="border-t border-gray-100 pt-4">
      <div className="text-xs text-gray-500 text-center mb-2 font-medium">Quick Check-in</div>
      <div className="flex justify-center">
        <div className="bg-white p-3 rounded-lg border-2 border-gray-200 hover:border-accent/50 transition-colors duration-200 group-hover:shadow-md">
          <QRCodeSVG
            value={`${typeof window !== "undefined" ? window.location.origin : ""}/checkin?machine=${machine.id}`}
            size={64}
            fgColor="#1A1F36"
            bgColor="#FFFFFF"
          />
        </div>
      </div>
    </div>
  )
}

export default QRCodeSection
