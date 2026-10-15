# ProxyProof — Bluetooth Attendance

A full-stack mobile application architecture designed to automate attendance tracking via Bluetooth Low Energy (BLE) while strictly preventing proxy marking.

## Core Architecture
This repository contains the core logic modules for the ProxyProof system:
*   `server.py`: A Python/Flask backend that manages roles, rotating tokens, and physical presence validation.
*   `App.js`: A React Native frontend component demonstrating the Organiser broadcast and Student scanning flows.

## Fulfilling the Requirements
1.  **Organiser and Student Roles:** Built into the React Native UI and enforced on the server. Students are locked to a specific `device_id`.
2.  **BLE Broadcasting:** Organisers initiate a 5-minute session window that broadcasts a session ID.
3.  **Automatic Marking & Anti-Proxy:** 
    *   The token rotates based on server time (`hashlib` time-windowed).
    *   Replayed codes fail immediately on the server.
    *   `device_id` binding ensures one phone = one student.
    *   RSSI (Received Signal Strength Indicator) is validated on the server (`> -75`) to ensure the student is actually in the room, not down the hall.
4.  **Dashboard & CSV:** The backend includes an `/export_csv` endpoint to dump the live database into a formatted CSV for the organiser.
