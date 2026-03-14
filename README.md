# KrisForce - Internal Operations & Support Platform

KrisForce is a full-stack CRM and Customer Portal solution designed to streamline internal workflows for support teams and provide clients with seamless access to thier data. Buitl with a focus on modular architecture.

### Overview

The project was born to solve the inefficiency of manual customer relationship managemenet. While the core of the application focuses on **Internal Staff (Customer Service)** operations, it also includes a **Client Module** to showcase scalability and future-proof integration.

##### Key Features

- Unified Dashboard: Manage orders, invoices, and support tickets in one place.
- Advanced Database Logic: 30+ relational tables with automated workflows handled by PostgreSQL triggers and functions.
- Custom RBAC: A hybrid Role-Based Access Control system using a centralized roles table and Supabase Row Level Security (RLS).
- Reporting: Integrated engine for generating and exporting PDF reports.
- Cross-Platform: Shared business logic between this Web portal (Next.js) and the mobile counterpart (React Native).

---

### Tech Stack

- Frontend: Next.js (React), Tailwind CSS
- Backend/BaaS: Supabase
- Database: PostgreSQL (with PL/pgSQL for business logic)

---

### Database & Local Setup

To ensure full transparency of the system's architecture, I have included a comprehensive SQL dump in the `/lib/supabase/db` directory.

The file `schema.sql` contains:
- Complete table structures and relationships.
- Custom Stored Procedures and Functions.
- Automation Triggers (e.g., for status updates or logs).
- RLS Policies implementation.

---

### Getting Started

##### Prerequisites

- Node.js
- A Supabase project (or a local PostgreSQL instance to run the provided schema)

##### Installation

1. Clone the repository:

```
git clone https://github.com/kriskensy/krisforce-web.git
cd krisforce-web
```

2. Install dependencies:

```
npm install
```

3. Environment Variables:

Create a .env.local file in the root directory and add your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

4. Run the development server:

```
npm run dev
```

Open http://localhost:3000 to see the result.

### Architecture & Clean Code

This project adheres to SOLID principles and uses a modular approach to keep the codebase maintainable as features grow. Logic is decoupled between UI components and database-heavy operations to ensure performance and reliability.