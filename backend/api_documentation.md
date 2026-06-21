# DesignDoc Backend API Specification (Comprehensive Frontend Guide)

This document is the absolute guide for frontend developers integrating with the DesignDoc backend.

---

## 🌐 Global Design Rules

1. **Standard Port & Base URL**: In local development, the API runs at `http://localhost:8000/api`.
2. **Response Formats**: 
   * **General Endpoints**: Return raw resources or standard JSON responses.
   * **Admin & Sharing Endpoints**: Wrapped in standardized envelopes:
     * **Single Item Envelope**:
       ```json
       {
         "success": true,
         "message": "Action message",
         "data": { ... }
       }
       ```
     * **Paginated List Envelope**:
       ```json
       {
         "success": true,
         "message": "Action message",
         "data": {
           "items": [ ... ],
           "total": 45,
           "page": 1,
           "page_size": 20,
           "total_pages": 3
         }
       }
       ```
     * **Error Envelope (for admin routes)**:
       ```json
       {
         "success": false,
         "message": "Error title/context",
         "detail": "Detailed explanation of error"
       }
       ```
3. **Authentication**: Authentication uses JWT Access Tokens (via headers or HTTP-only cookies).
   * **Headers**: `Authorization: Bearer <token>`
   * **Cookies**: The login endpoint sets HTTP-only `access_token` and `refresh_token` cookies for browser-based session handling.

---

## 📂 Categories Summary

1. [🔐 Authentication API (`/api/auth`)](#-authentication-api-apiauth)
2. [📂 Project Management API (`/api/projects`)](#-project-management-api-apiprojects)
3. [⚡ AI Generation API (`/api/generate`)](#-ai-generation-api-apigenerate)
4. [🔗 Project Sharing API (`/api`)](#-project-sharing-api-api)
5. [🛡️ System Administration API (`/api/admin`)](#-system-administration-api-apiadmin)

---

## 🔐 Authentication API (`/api/auth`)

These endpoints manage user registration, logging in, session refreshes, and logging out.

### 1. User Registration
* **Endpoint**: `POST /api/auth/register`
* **Auth**: None
* **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword123"
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "id": 2,
    "email": "user@example.com",
    "is_active": true,
    "role": "user",
    "created_at": "2026-06-21T01:00:00.000Z"
  }
  ```

### 2. User Login
* **Endpoint**: `POST /api/auth/login`
* **Auth**: None (Sets cookies: `access_token` and `refresh_token`)
* **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword123"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "refresh_token": "eyJhbGciOi...",
    "token_type": "bearer"
  }
  ```

### 3. Token Refresh
* **Endpoint**: `POST /api/auth/refresh`
* **Auth**: Refresh token (can be sent in the Request Body, or read automatically from the HTTP-only cookie).
* **Request Body (Optional)**:
  ```json
  {
    "refresh_token": "eyJhbGciOi..."
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "refresh_token": "eyJhbGciOi...",
    "token_type": "bearer"
  }
  ```

### 4. Logout
* **Endpoint**: `POST /api/auth/logout`
* **Auth**: None (clears `access_token` and `refresh_token` cookies, revokes the refresh token)
* **Response (200 OK)**:
  ```json
  {
    "message": "Successfully logged out"
  }
  ```

### 5. Get Current User Info
* **Endpoint**: `GET /api/auth/me`
* **Headers**: `Authorization: Bearer <token>`
* **Response (200 OK)**:
  ```json
  {
    "id": 2,
    "email": "user@example.com",
    "is_active": true,
    "role": "user",
    "created_at": "2026-06-21T01:00:00.000Z"
  }
  ```

---

## 📂 Project Management API (`/api/projects`)

Allows users to manage and retrieve their own saved projects.

### 1. Save Project
* **Endpoint**: `POST /api/projects/`
* **Headers**: `Authorization: Bearer <token>`
* **Request Body**:
  ```json
  {
    "title": "Hospital Management System",
    "description": "Requirement documents...",
    "artifacts": [
      {
        "artifact_type": "srs",
        "content": "# System Requirements Spec..."
      }
    ]
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "id": 14,
    "title": "Hospital Management System",
    "description": "Requirement documents...",
    "created_at": "2026-06-21T01:02:00.000Z",
    "updated_at": "2026-06-21T01:02:00.000Z",
    "artifacts": [
      {
        "id": 23,
        "project_id": 14,
        "artifact_type": "srs",
        "content": "# System Requirements Spec...",
        "created_at": "2026-06-21T01:02:00.000Z"
      }
    ]
  }
  ```

### 2. List All User Projects
* **Endpoint**: `GET /api/projects/`
* **Headers**: `Authorization: Bearer <token>`
* **Response (200 OK)**:
  ```json
  [
    {
      "id": 14,
      "title": "Hospital Management System",
      "description": "Requirement documents...",
      "created_at": "2026-06-21T01:02:00.000Z",
      "updated_at": "2026-06-21T01:02:00.000Z",
      "artifacts": []
    }
  ]
  ```

### 3. Get Project Details
* **Endpoint**: `GET /api/projects/{project_id}`
* **Headers**: `Authorization: Bearer <token>`
* **Response (200 OK)**:
  ```json
  {
    "id": 14,
    "title": "Hospital Management System",
    "description": "Requirement documents...",
    "created_at": "2026-06-21T01:02:00.000Z",
    "updated_at": "2026-06-21T01:02:00.000Z",
    "artifacts": [
      {
        "id": 23,
        "project_id": 14,
        "artifact_type": "srs",
        "content": "# System Requirements Spec...",
        "created_at": "2026-06-21T01:02:00.000Z"
      }
    ]
  }
  ```

### 4. Delete Project
* **Endpoint**: `DELETE /api/projects/{project_id}`
* **Headers**: `Authorization: Bearer <token>`
* **Response (200 OK)**:
  ```json
  {
    "message": "Project deleted successfully"
  }
  ```

---

## ⚡ AI Generation API (`/api/generate`)

Triggers the Gemini AI model to generate complete design artifacts (SRS, ERD, Class Diagrams, Sequence Diagrams, and SQL Database Schema) from a textual prompt.

### 1. Generate Design Artifacts
* **Endpoint**: `POST /api/generate`
* **Headers**: `Authorization: Bearer <token>`
* **Request Body**:
  ```json
  {
    "description": "Build an Uber clone for delivery trucks with real-time routing."
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "Project ID": 29,
    "title": "Uber Clone for Delivery Trucks",
    "data": {
      "srs": "# Software Requirements Specification...\n...",
      "erd_mermaid": "erDiagram\n    TRUCK ||--o{ TRIP : performs\n    TRUCK { ... }",
      "class_diagram_mermaid": "classDiagram\n    class Truck {\n        +String plate\n    }",
      "sequence_diagram_mermaid": "sequenceDiagram\n    Customer->>App: Book trip\n    App->>Truck: Dispatch",
      "sql_schema": "CREATE TABLE trucks (\n    id SERIAL PRIMARY KEY\n);"
    }
  }
  ```
  *(Note: Response details are saved to database automatically under Project ID returned).*

---

## 🔗 Project Sharing API (`/api`)

Handles secure public project sharing, returning filtered, unauthenticated summaries.

### 1. Generate/Activate Share Link
* **Endpoint**: `POST /api/projects/{project_id}/share`
* **Headers**: `Authorization: Bearer <token>` *(Admins can share any project; normal users can only share projects they own)*
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Share link created successfully",
    "data": {
      "share_token": "PWGgpzlgwzptXXx4mE0ud9-Zc6pNV80v",
      "share_url": "http://localhost:5173/share/PWGgpzlgwzptXXx4mE0ud9-Zc6pNV80v",
      "is_active": true,
      "view_count": 0,
      "created_at": "2026-06-21T01:05:00.000Z"
    }
  }
  ```

### 2. Check Share Status Details
* **Endpoint**: `GET /api/projects/{project_id}/share`
* **Headers**: `Authorization: Bearer <token>`
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Share link retrieved successfully",
    "data": {
      "share_token": "PWGgpzlgwzptXXx4mE0ud9-Zc6pNV80v",
      "share_url": "http://localhost:5173/share/PWGgpzlgwzptXXx4mE0ud9-Zc6pNV80v",
      "is_active": true,
      "view_count": 52,
      "created_at": "2026-06-21T01:05:00.000Z"
    }
  }
  ```

### 3. Revoke Share Link
* **Endpoint**: `DELETE /api/projects/{project_id}/share`
* **Headers**: `Authorization: Bearer <token>`
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Share link revoked"
  }
  ```

### 4. Public Lookup (Anonymous)
* **Endpoint**: `GET /api/public/shared/{share_token}`
* **Auth**: **None** (Anonymous access)
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Public project retrieved successfully",
    "data": {
      "title": "Uber Clone for Delivery Trucks",
      "created_at": "2026-06-21T01:05:00.000Z",
      "artifacts": [
        {
          "id": 145,
          "project_id": 29,
          "artifact_type": "srs",
          "content": "# Software Requirements Specification...",
          "created_at": "2026-06-21T01:05:00.000Z"
        }
      ]
    }
  }
  ```
  *(Note: Sensitive metadata, user info, project description, and owner IDs are omitted automatically).*

---

## 🛡️ System Administration API (`/api/admin`)

These endpoints require admin privileges (`role == "admin"`). Regular users receive a `403 Forbidden` error.
* **Response Format**: Always wrapped in standard envelopes.

### 1. Paginated Users List
* **Endpoint**: `GET /api/admin/users`
* **Headers**: `Authorization: Bearer <token>` (Admin only)
* **Query Params**:
  * `page` (int, default: 1)
  * `page_size` (int, default: 20)
  * `search` (string, filter by user email, optional)
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Users retrieved successfully",
    "data": {
      "items": [
        {
          "id": 1,
          "email": "designdoc@gmail.com",
          "role": "admin",
          "is_active": true,
          "created_at": "2026-06-20T00:00:00.000Z",
          "project_count": 4,
          "last_generation_at": "2026-06-21T01:02:00.000Z",
          "projects": [
            {
              "id": 14,
              "title": "Hospital Management System",
              "description": "Requirement documents...",
              "created_at": "2026-06-21T01:02:00.000Z",
              "updated_at": "2026-06-21T01:02:00.000Z"
            }
          ]
        }
      ],
      "total": 1,
      "page": 1,
      "page_size": 20,
      "total_pages": 1
    }
  }
  ```

### 2. Single User Details
* **Endpoint**: `GET /api/admin/users/{user_id}`
* **Headers**: `Authorization: Bearer <token>` (Admin only)
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "User retrieved successfully",
    "data": {
      "id": 1,
      "email": "designdoc@gmail.com",
      "role": "admin",
      "is_active": true,
      "created_at": "2026-06-20T00:00:00.000Z",
      "project_count": 4,
      "last_generation_at": "2026-06-21T01:02:00.000Z",
      "projects": [ ... ]
    }
  }
  ```

### 3. Update User Status / Role
* **Endpoint**: `PATCH /api/admin/users/{user_id}`
* **Headers**: `Authorization: Bearer <token>` (Admin only)
* **Request Body**:
  ```json
  {
    "role": "admin", 
    "is_active": true
  }
  ```
  *(Note: All fields are optional. Role must be `user` or `admin`).*
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "User updated successfully",
    "data": {
      "id": 1,
      "email": "designdoc@gmail.com",
      "role": "admin",
      "is_active": true,
      "created_at": "2026-06-20T00:00:00.000Z",
      "project_count": 4,
      "last_generation_at": "2026-06-21T01:02:00.000Z",
      "projects": [ ... ]
    }
  }
  ```

### 4. Delete User Account
* **Endpoint**: `DELETE /api/admin/users/{user_id}`
* **Headers**: `Authorization: Bearer <token>` (Admin only)
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "User deleted"
  }
  ```
  *(Note: Deletes the user account and cascades deletion to all owned projects and share links. Admin cannot delete their own active account).*

### 5. Paginated Global Projects View
* **Endpoint**: `GET /api/admin/projects`
* **Headers**: `Authorization: Bearer <token>` (Admin only)
* **Query Params**:
  * `page` (int, default: 1)
  * `page_size` (int, default: 20)
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Projects retrieved successfully",
    "data": {
      "items": [
        {
          "id": 14,
          "title": "Hospital Management System",
          "description": "Requirement documents...",
          "user_id": 1,
          "owner_email": "designdoc@gmail.com",
          "created_at": "2026-06-21T01:02:00.000Z",
          "updated_at": "2026-06-21T01:02:00.000Z"
        }
      ],
      "total": 1,
      "page": 1,
      "page_size": 20,
      "total_pages": 1
    }
  }
  ```

### 6. System Statistics Dashboard
* **Endpoint**: `GET /api/admin/stats`
* **Headers**: `Authorization: Bearer <token>` (Admin only)
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Stats retrieved successfully",
    "data": {
      "total_users": 12,
      "active_users": 10,
      "total_projects": 24,
      "total_artifacts_generated": 108,
      "generations_today": 3,
      "generations_this_week": 14,
      "new_users_this_week": 2
    }
  }
  ```
