# Go-Fast CDN Fork – Feature Summary

This fork adds modern authentication, admin controls, and registration management to Go-Fast CDN.

## Key Additions

- **Custom JWT Authentication**

  - Uses a custom JWT service (`src/auth/jwt.go`) for access and refresh tokens.
  - JWTs include user ID, email, and role; tokens are validated and refreshed automatically.

- **2FA (Two-Factor Authentication)**

  - TOTP-based 2FA for user accounts.
  - Disabling 2FA clears the secret and disables 2FA in the database.
  - Debug logging for 2FA state changes.

- **User Roles & Admin**

  - First registered user is always set as admin.
  - Role-based access: only admins can access `/admin` and admin APIs.
  - Admin dashboard UI and API for listing, adding, editing, and deleting users.

- **Registration Toggle**

  - Admins can enable/disable registration from the dashboard.
  - Registration endpoint and UI are disabled when registration is off (except for the first user).
  - Public API for registration status; admin API for toggling.

- **Frontend Improvements**

  - Modern React UI for login, registration, user settings, and admin dashboard.
  - All admin/protected API calls send the correct Authorization header.
  - "Return to Login" button on the registration disabled page.

- **Other**
  - Config model/table for global settings.
  - Auto-migration for new models.
  - Improved error handling and logging.

---

**Note:**

- The main `README.md` covers setup, build, and usage.
- This summary highlights only the features added in your fork.
