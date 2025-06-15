# Removed Components - Developer Reference

This folder contains components and code that were removed from the main LaundryCard component as per the requirements to clean up the dashboard.

## Removed Components:

### 1. ActionButton.tsx
- **Purpose**: Handled user interactions with laundry machines
- **Functionality**: 
  - "Start Using" button for free machines
  - "Stop Using" button for running machines  
  - "I've Collected Items" button for machines in grace period
- **Removed from**: LaundryCard.tsx lines 69-114 and usage on lines 204-207

### 2. QRCodeSection.tsx
- **Purpose**: Generated QR codes for quick machine check-ins
- **Functionality**:
  - Generated QR codes linking to `/checkin?machine=${machine.id}`
  - Provided quick access for users to check in to machines
- **Removed from**: LaundryCard.tsx lines 209-222

## Also Removed:

### Machine Type Labels
- Removed "Washing Machine" and "Dryer" labels that appeared below machine names
- **Location**: LaundryCard.tsx line 182
- **Code**: `<div className="text-sm text-gray-500 capitalize">{isWasher ? "Washing Machine" : "Dryer"}</div>`

## Current Dashboard State:

The main dashboard now only displays:
- ✅ Machine SVG icons
- ✅ Machine names (Washer 1, Dryer 5, etc.)
- ✅ Machine status (Available, In Use, Please Collect)
- ✅ Status indicators and timing information

## Dependencies Removed:
- QRCodeSVG import is no longer needed in the main component
- All button interaction logic has been removed

## Notes for Developers:
- These components can be re-integrated if needed in the future
- The QR code functionality requires the `qrcode.react` package
- The ActionButton component includes all the original styling and interaction logic
- All removed code maintains the original functionality and styling
