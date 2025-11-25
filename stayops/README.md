# StayOps

React + Vite app for the StayOps platform with multiple role-based portals (System Admin, Receptionist, Operational Manager, Service Manager).

## Quick start (dev)

1) Install dependencies

Windows PowerShell:

```
npm install
```

2) Start the dev server

```
npm run dev
```

Open the app at http://localhost:5173

## System Admin portal

- Route base: `/admin`
- Default route: `/admin/dashboard`
- Login with backend credentials (as configured in `src/config/api.js`):
	- Email: `admin@stayops.com`
	- Password: `admin123`

Once logged in as SYSTEM_ADMIN, you'll be redirected to the System Admin dashboard. The sidebar links map to these routes:

- Dashboard: `/admin/dashboard`
- System Management:
	- System Settings: `/admin/system/settings`
	- Server Status: `/admin/system/server-status`
	- Database Management: `/admin/system/database`
	- API Management: `/admin/system/api`
	- Backup & Recovery: `/admin/system/backup`
- User Management:
	- All Users: `/admin/users`
	- Roles: `/admin/users/roles`
	- Permissions: `/admin/users/permissions`
	- Activity Logs: `/admin/users/activity`
	- Session Management: `/admin/users/sessions`
- Hotel Management:
	- Hotels: `/admin/hotels`
	- Property Settings: `/admin/hotels/settings`
	- Rooms: `/admin/hotels/rooms`
	- Amenities: `/admin/hotels/amenities`
- Security & Compliance:
	- Security Center: `/admin/security`
	- Access Control: `/admin/security/access`
	- Audit Trail: `/admin/security/audit`
	- Threat Detection: `/admin/security/threats`
- Reports:
	- System Reports: `/admin/reports`
	- Performance: `/admin/reports/performance`
	- Usage: `/admin/reports/usage`
	- Custom: `/admin/reports/custom`
- Notifications: `/admin/notifications`
- Settings: `/admin/settings`

Notes:
- The app expects the backend at `http://localhost:8080` (see `src/config/api.js`).
- If the backend is offline, the login will fail; some pages include mock data fallbacks for local development.
