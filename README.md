# Vega Web Portal - Multi-Portal Service Booking Platform

**A comprehensive service booking platform by [Vega Services](https://vegaservices.com).**

Vega Web Portal is a production-ready multi-portal application built with Next.js 16, React 19, TypeScript and Tailwind CSS v4. It features 4 role-based portals (Admin, Customer, Vendor, Service Boy) with complete booking flow, Redux state management, and API integration.

**Live demo:** Coming soon

## Features

### 🔐 Authentication
- Unified login for all user types
- Customer registration
- Vendor registration with approval flow
- Role-based redirects

### 👤 Customer Portal
- Browse service categories
- View vendor listings with ratings
- Create and manage bookings
- Track booking status
- Rate completed services

### 🏪 Vendor Portal
- Dashboard with stats and analytics
- Accept/reject booking requests
- Assign service boys to jobs
- Manage team members (CRUD)
- Track earnings and performance

### 🔧 Service Boy Portal
- View assigned jobs
- Accept/decline job requests
- Start and complete jobs
- Track performance stats
- Manage availability status

### 🛡️ Admin Portal
- System-wide dashboard
- Vendor approval/rejection/suspension
- Monitor all bookings
- Manage service boys across vendors
- Revenue and performance analytics

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19 + TypeScript (strict mode)
- **Styling:** Tailwind CSS v4
- **State Management:** Redux Toolkit
- **HTTP Client:** Axios
- **Charts:** Recharts
- **Icons:** Lucide React
- **Notifications:** Sonner

## Quick Start

```bash
# Clone the repository
git clone https://github.com/laryealeslie3-stack/vega-web.git
cd vega-web

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
app/
├── (auth)/           # Auth page templates
├── (portals)/
│   ├── admin/        # Admin dashboard & management
│   ├── user/         # Customer portal
│   ├── vendor/       # Vendor portal
│   └── serviceboy/   # Service boy portal
├── login/            # Main login page
├── register/         # Customer registration
└── vendor/register/  # Vendor registration

components/
├── ui/               # Reusable UI components
├── layout/           # Layout components
└── auth/             # Auth guards

store/
├── slices/           # Redux slices
│   ├── authSlice     # Authentication
│   ├── bookingsSlice # Bookings management
│   ├── vendorsSlice  # Vendor management
│   ├── serviceBoysSlice # Service boys
│   ├── catalogSlice  # Categories & services
│   └── dashboardSlice # Dashboard stats
└── index.ts          # Store configuration

lib/
└── api/
    ├── client.ts     # Axios configuration
    ├── types.ts      # TypeScript types
    └── services/     # API service functions
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript type check |
| `npm run format` | Format with Prettier |

## API Configuration

Update the API base URL in `lib/api/client.ts`:

```typescript
const API_BASE_URL = "http://127.0.0.1:4000"; // Your backend URL
```

## Environment

The app expects a backend API running at the configured URL. See `api-spec.json` for the full API specification.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Proprietary - Vega Services

## Author

**Vega Services**

- Website: [vegaservices.com](https://vegaservices.com)
- Email: [hello@vegaservices.com](mailto:hello@vegaservices.com)
