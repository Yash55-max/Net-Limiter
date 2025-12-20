# NetLimiter - Organizer Role Documentation

## 🎯 Overview

The NetLimiter application now has a **3-tier role system** for managing users and permissions:

1. **Organizer** - Super-admin with exclusive user management rights
2. **Admin** - Can set bandwidth limits and monitor network
3. **User** - Can only view network data (read-only)

---

## 👥 Role Hierarchy

```
┌─────────────────────────────────────────┐
│         ORGANIZER (Super-Admin)         │
│  • Manage all users                     │
│  • Promote/Demote users                 │
│  • Delete users                         │
│  • Set bandwidth limits                 │
│  • Full access to all features          │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│              ADMIN                      │
│  • Set bandwidth limits                 │
│  • Monitor network                      │
│  • View all processes                   │
│  • Cannot manage users                  │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│              USER                       │
│  • View network data only               │
│  • Read-only access                     │
│  • Cannot modify anything               │
└─────────────────────────────────────────┘
```

---

## 🔑 Default Credentials

### Organizer Account (User Management)
- **Username:** `organizer`
- **Password:** `organizer123`
- **Purpose:** Managing all users across the website

### Admin Account (Bandwidth Control)
- **Username:** `admin`
- **Password:** `admin123`
- **Purpose:** Setting bandwidth limits and monitoring

---

## 📋 Organizer Capabilities

### User Management Features

1. **View All Users**
   - See complete list of all registered users
   - View usernames, emails, and roles
   - See total user count and admin count

2. **Promote Users to Admin**
   - Upgrade regular users to admin role
   - Gives them bandwidth control abilities
   - Cannot promote to organizer level

3. **Demote Admins to Users**
   - Downgrade admins to regular users
   - Removes their bandwidth control rights
   - Cannot demote the organizer account
   - Cannot demote the default admin account

4. **Delete Users**
   - Permanently remove users from the system
   - Cannot delete the organizer account
   - Cannot delete the default admin account
   - Double confirmation required for safety

---

## 🛡️ Protected Accounts

The following accounts are **protected** and cannot be modified or deleted:

1. **Organizer Account** (`organizer`)
   - Cannot be deleted
   - Cannot be demoted
   - Cannot be modified by anyone

2. **Default Admin Account** (`admin`)
   - Cannot be deleted
   - Cannot be demoted
   - Protected to ensure system access

---

## 🚀 How to Use

### For Organizers:

1. **Login as Organizer**
   ```
   Username: organizer
   Password: organizer123
   ```

2. **Access User Management**
   - Click "Users" in the sidebar (only visible to organizers)
   - View the complete user list

3. **Manage Users**
   - **Promote:** Click "Promote to Admin" for regular users
   - **Demote:** Click "Demote to User" for admins
   - **Delete:** Click "Delete" button (requires double confirmation)

### For Admins:

1. **Login as Admin**
   ```
   Username: admin
   Password: admin123
   ```

2. **Manage Bandwidth**
   - Set limits for processes
   - Monitor network usage
   - View connections and rules

3. **Note:** Admins do NOT see the "Users" menu item

### For Users:

1. **Register** via the registration page
2. **Login** with your credentials
3. **View** network data (read-only access)
4. **Note:** Users cannot set limits or manage users

---

## 🔒 Security Features

### Access Control
- All user management endpoints require organizer role
- Admins cannot access user management features
- Users have read-only access

### Self-Protection
- Cannot delete yourself
- Cannot demote yourself
- Prevents accidental lockout

### Account Protection
- Organizer account is fully protected
- Default admin account is protected
- Ensures system always has access

### Confirmation Dialogs
- Single confirmation for promote/demote
- **Double confirmation** for delete operations
- Clear warning messages for all actions

---

## 📊 User Management Interface

### User Table Columns:
1. **Username** - User's login name
   - Organizer has pink "Organizer" badge
   - Admin has purple "Default Admin" badge

2. **Email** - User's email address

3. **Role** - Color-coded badges:
   - 🔴 **ORGANIZER** (Red badge)
   - 🟢 **ADMIN** (Green badge)
   - 🟡 **USER** (Yellow badge)

4. **Actions** - Available buttons:
   - **Promote to Admin** (Blue) - For users
   - **Demote to User** (Gray) - For admins
   - **Delete** (Red) - For non-protected accounts
   - **Protected** (Grayed out) - For organizer/admin

### Statistics Display:
- **Total Users:** Shows count of all users
- **Total Admins:** Shows count of admin + organizer accounts

---

## 🎨 Visual Indicators

### Role Badges:
- **Organizer:** Pink gradient badge with "Organizer" text
- **Default Admin:** Purple gradient badge with "Default Admin" text
- **ORGANIZER Role:** Red badge
- **ADMIN Role:** Green badge
- **USER Role:** Yellow badge

### Button Colors:
- **Promote:** Blue (Primary action)
- **Demote:** Gray (Secondary action)
- **Delete:** Red (Danger action)

---

## ⚠️ Important Notes

1. **Organizer is the ONLY role** that can manage users
2. **Admins cannot see** the Users menu
3. **New registrations** automatically get "User" role
4. **Organizer account** cannot be modified through the UI
5. **Default admin account** is protected from deletion/demotion
6. **All changes are immediate** - no page refresh needed

---

## 🔄 Workflow Example

### Promoting a User to Admin:

1. User registers → Gets "User" role
2. Organizer logs in
3. Organizer clicks "Users" in sidebar
4. Organizer finds the user in the table
5. Organizer clicks "Promote to Admin"
6. Confirms the action
7. User is now an admin with bandwidth control rights

### Demoting an Admin:

1. Organizer logs in
2. Goes to Users view
3. Finds the admin in the table
4. Clicks "Demote to User"
5. Confirms the action
6. Admin loses bandwidth control rights

### Deleting a User:

1. Organizer logs in
2. Goes to Users view
3. Finds the user
4. Clicks "Delete"
5. Confirms first warning
6. Confirms second warning (double confirmation)
7. User is permanently removed

---

## 🌐 API Endpoints (Organizer Only)

All these endpoints require organizer authentication:

- `GET /api/users` - Get all users
- `POST /api/users/promote` - Promote user to admin
- `POST /api/users/demote` - Demote admin to user
- `POST /api/users/delete` - Delete user

**Error Response:** `403 Forbidden` if not organizer

---

## 💡 Best Practices

1. **Keep organizer credentials secure** - This is the master account
2. **Use admin accounts** for day-to-day bandwidth management
3. **Promote users to admin** only when necessary
4. **Regularly review user list** to remove inactive accounts
5. **Don't share organizer password** - Create separate admin accounts instead

---

## 🎯 Summary

The **Organizer role** provides a dedicated, secure way to manage all users across the NetLimiter website. It's separated from the admin role to ensure that user management is controlled by a single, protected super-admin account, while admins focus on bandwidth control and monitoring.

**Key Takeaway:** Organizer = User Management | Admin = Bandwidth Control | User = View Only

---

*Last Updated: December 20, 2025*
