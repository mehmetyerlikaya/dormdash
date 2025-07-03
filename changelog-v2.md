# DormDash v2 Release Notes

## 🚀 Version: v2 — Major UI & Logic Improvements

### Summary

This release brings major improvements to the DormDash laundry dashboard, focusing on clarity, fairness, and usability for all users. It also includes backend and testing support for future maintenance.

---

## **What's New & Improved**

### 1. Detailed Washer/Dryer Metrics
- **Change:** The dashboard now displays separate counts for available and in-use washers and dryers.
- **Reason:** Users can quickly see how many washers and dryers are available or in use, making it easier to plan laundry usage.

### 2. Restrict Adjust Timer to Running Machines Only
- **Change:** The "Change Time" (adjust timer) feature can now only be used when a machine is in the "running" state. Attempts to adjust the timer during the grace period are now blocked.
- **Reason:** This ensures users cannot extend or alter the grace period, keeping the system fair and predictable.
- **Update:** Fixed an issue where setting a new timer value less than the time already elapsed would immediately trigger the grace period. Now, if a user sets a new time that is less than the elapsed time, the timer is reset to the new value from the current moment, and the machine remains in "running" status as expected.

### 3. UI/UX Improvements for Adjust Timer
- **Change:** Button and modal text for adjusting the timer are now clearer and more intuitive for all users.
- **Reason:** Reduces confusion and helps users understand when and why to use the feature.

### 4. General Code and Logic Cleanups
- **Change:** 
  - Removed countdown hints and pre-button messages for the adjust timer, so the button only appears when allowed.
  - Ensured the UI always refreshes after a timer adjustment.
- **Reason:** Keeps the interface clean and only shows actionable options when appropriate, improving user experience.

### 5. (If applicable) New/Untracked Files Added
- **Change:** Some scripts and utility files were added (e.g., migration/test scripts, SVGs, UI components).
- **Reason:** These support database migrations, testing, and UI consistency, but do not affect the main user-facing app directly.

### 6. Help Requests
- **Change:** Help requests (🆘) are now persistent and do not disappear after a set time.
- **Reason:** Ensures that all requests remain visible until resolved or manually removed.

---

## **Summary Table**

| Area                | Before                                 | After / Reason for Change                        |
|---------------------|----------------------------------------|-------------------------------------------------|
| Metrics             | Total machines only                    | Separate washer/dryer counts for clarity         |
| Adjust Timer Logic  | Could adjust in grace period           | Only allowed during "running" for fairness      |
| Button/Modal Text   | Vague/unclear                          | Clear, actionable, and user-friendly            |
| UI Cleanliness      | Countdown/subtext always visible       | Only show button when allowed                   |
| Data Refresh        | Sometimes stale after adjust           | Always refreshes after timer change             |
| Scripts/Utils       | Not present or incomplete              | Added for migration/testing support             |

---

## **Known Issue / Note**

> **When a user changes the timer for a machine, the machine card may temporarily display "00:00:00" and not immediately show the updated time. To see the correct, updated remaining time, users may need to refresh the page. This happens because the UI does not always instantly sync with the backend update, even though the timer is correctly changed in the database.**

---

**In summary:**  
This version improves the clarity, fairness, and usability of the laundry dashboard, especially around timer adjustments and machine availability, while also adding backend and testing support for future maintenance.

---

*End of v2 Release Notes* 