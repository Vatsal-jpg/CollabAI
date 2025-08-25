# COLLAB-AI Backend API Documentation

## Overview

This backend provides RESTful APIs for user authentication, project management, and AI-powered features.  
All endpoints return JSON responses.

**Authentication:**  
Most endpoints require a valid JWT token in the `Authorization` header as `Bearer <token>`.

---

## User Endpoints

### Register

- **POST** `/api/users/register`
- **Description:** Register a new user.
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "yourpassword"
  }
  ```
- **Responses:**
  - `201 Created` – User registered successfully.
  - `400 Bad Request` – Invalid email or password.

---

### Login

- **POST** `/api/users/login`
- **Description:** Login and receive a JWT token.
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "yourpassword"
  }
  ```
- **Responses:**
  - `200 OK` – Returns JWT token.
  - `400 Bad Request` – Invalid credentials.

---

### Profile

- **GET** `/api/users/profile`
- **Description:** Get the authenticated user's profile.
- **Headers:**  
  `Authorization: Bearer <token>`
- **Responses:**
  - `200 OK` – Returns user profile.
  - `401 Unauthorized` – Invalid or missing token.

---

### Logout

- **GET** `/api/users/logout`
- **Description:** Logout the current user.
- **Headers:**  
  `Authorization: Bearer <token>`
- **Responses:**
  - `200 OK` – Logout successful.
  - `401 Unauthorized` – Invalid or missing token.

---

### Get All Users

- **GET** `/api/users/all`
- **Description:** Get all users except the current user.
- **Headers:**  
  `Authorization: Bearer <token>`
- **Responses:**
  - `200 OK` – Returns array of users.
  - `401 Unauthorized` – Invalid or missing token.

---

## Project Endpoints

### Create Project

- **POST** `/api/projects/create`
- **Description:** Create a new project.
- **Headers:**  
  `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "name": "Project Name"
  }
  ```
- **Responses:**
  - `201 Created` – Project created.
  - `400 Bad Request` – Missing or invalid data.
  - `401 Unauthorized` – Invalid or missing token.

---

### Get All Projects

- **GET** `/api/projects/all`
- **Description:** Get all projects for the authenticated user.
- **Headers:**  
  `Authorization: Bearer <token>`
- **Responses:**
  - `200 OK` – Returns array of projects.
  - `401 Unauthorized` – Invalid or missing token.

---

### Add Users to Project

- **PUT** `/api/projects/add-user`
- **Description:** Add users to a project.
- **Headers:**  
  `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "projectId": "projectIdString",
    "users": ["userId1", "userId2"]
  }
  ```
- **Responses:**
  - `200 OK` – Users added to project.
  - `400 Bad Request` – Missing or invalid data.
  - `401 Unauthorized` – Invalid or missing token.

---

### Get Project By ID

- **GET** `/api/projects/get-project/:projectId`
- **Description:** Get details of a specific project.
- **Headers:**  
  `Authorization: Bearer <token>`
- **Responses:**
  - `200 OK` – Returns project details.
  - `400 Bad Request` – Invalid project ID.
  - `401 Unauthorized` – Invalid or missing token.

---

### Update File Tree

- **PUT** `/api/projects/update-file-tree`
- **Description:** Update the file tree of a project.
- **Headers:**  
  `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "projectId": "projectIdString",
    "fileTree": { /* file tree object */ }
  }
  ```
- **Responses:**
  - `200 OK` – File tree updated.
  - `400 Bad Request` – Missing or invalid data.
  - `401 Unauthorized` – Invalid or missing token.

---

## AI Endpoints

### Get AI Result

- **GET** `/api/ai/get-result`
- **Description:** Get AI-generated result (details depend on implementation).
- **Responses:**
  - `200 OK` – Returns AI result.
  - `400 Bad Request` – Invalid request.

---

## Error Response Format

All error responses follow this format:
```json
{
  "error": "Error message here"
}
```

---

## Notes

- All endpoints (except register, login, and AI) require authentication via JWT.
- Data must be sent in JSON format.
- Status codes follow REST conventions (`200`, `201`, `400`, `401`,