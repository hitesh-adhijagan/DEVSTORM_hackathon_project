# DivvyUp

DivvyUp is a modern bill-splitting and expense-tracking web application designed to eliminate the complexity of shared expenses. It allows users to track group spending, simplify complex debt networks, and settle balances instantly via native UPI deep linking.

---

## Key Features

- **Flexible Bill Splitting:** Divide expenses equally, by exact custom amounts, or by percentage.
- **Group Expense Management:** Organize expenses by categories, trips, shared flats, or events.
- **Debt Simplification Algorithm:** Automatically reduces circular debts across groups into the minimum number of direct transactions.
- **One-Click UPI Settlements:** Generates native deep links (`upi://pay`) to launch UPI apps (Google Pay, PhonePe, Paytm, BHIM) on mobile devices, with dynamic QR code fallbacks for desktop.
- **Offline Draft Persistence:** Automatically persists active inputs and unsaved form states to local storage to prevent data loss.
- **Authentication:** Supports Google Sign-In and Apple Sign-In OAuth 2.0 flows.

---

## Tech Stack

- **Frontend:** React, HTML5, CSS3 / Tailwind CSS
- **Backend / Database:** Node.js, Express, PostgreSQL / Firebase
- **Authentication:** Firebase Auth / OAuth 2.0 (Google Identity Services, Sign in with Apple)
- **Payment Integration:** NPCI UPI Deep Linking Protocol, QR Code Generation

---

## Getting Started

### Prerequisites

Ensure you have the following installed:
- Node.js (v18.0.0 or higher)
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone [https://github.com/](https://github.com/)<your-username>/DivvyUp.git
   cd DivvyUp
