# Message Scheduler

## Description

This is a message scheduling service. The API allows scheduling, querying, canceling, and deleting messages to be sent to various communication channels.

### Features

-   Schedule new messages.
-   Query the status of a scheduled message.
-   Cancel a scheduled message (by changing its status).
-   Delete a scheduled message.
-   Validation to prevent scheduling messages for past dates.
-   Validation to avoid duplicate schedules (same message, recipient, type, and date).
-   Error handling for messages not found.

## Technologies Used

-   **Backend:** Node.js, TypeScript
-   **Framework:** Fastify
-   **Database:** PostgreSQL
-   **Testing:** Vitest

## API Endpoints

The following are the available endpoints in the API.

### Schedule a Message

Schedules a new message to be sent.

-   **URL:** `/schedules`
-   **Method:** `POST`
-   **Request Body:**

    ```json
    {
      "messageType": "EMAIL",
      "message": "Your April invoice has arrived!",
      "recipient": "customer@example.com",
      "schedulingDate": "2024-05-20T10:00:00.000Z"
    }
    ```

    -   `messageType`: Enum (`EMAIL`, `SMS`, `PUSH`, `WHATSAPP`)
    -   `schedulingDate`: Date and time in ISO 8601 format.

-   **Success Response (201 Created):**

    ```json
    {
      "id": "c3e5e8a0-1b2c-4d3e-8f9a-0b1c2d3e4f5a",
      "messageType": "EMAIL",
      "message": "Your April invoice has arrived!",
      "recipient": "customer@example.com",
      "schedulingDate": "2024-05-20T10:00:00.000Z",
      "scheduled": true,
      "createdAt": "2024-04-19T15:30:00.000Z",
      "updatedAt": "2024-04-19T15:30:00.000Z"
    }
    ```

-   **Error Responses:**
    -   `400 Bad Request`: Invalid input data (e.g., past date, invalid format).
    -   `409 Conflict`: The message has already been scheduled.

### Get Message Status

Returns the status of a specific scheduled message.

-   **URL:** `/schedules/:id`
-   **Method:** `GET`
-   **URL Parameters:**
    -   `id` (string, uuid): The ID of the scheduled message.

-   **Success Response (200 OK):**

    ```json
    {
      "id": "c3e5e8a0-1b2c-4d3e-8f9a-0b1c2d3e4f5a",
      "scheduled": true
    }
    ```

-   **Error Responses:**
    -   `400 Bad Request`: The provided ID is not a valid UUID.
    -   `404 Not Found`: Message not found.

### Cancel/Reschedule Message

Changes the status of a message, allowing it to be canceled (`scheduled: false`) or reactivated (`scheduled: true`).

-   **URL:** `/schedules/:id`
-   **Method:** `PUT`
-   **URL Parameters:**
    -   `id` (string, uuid): The ID of the scheduled message.
-   **Request Body:**

    ```json
    {
      "scheduled": false
    }

-   **Success Response (200 OK):**

    ```json
    {
      "id": "c3e5e8a0-1b2c-4d3e-8f9a-0b1c2d3e4f5a",
      "scheduled": false
    }
    ```

-   **Error Responses:**
    -   `400 Bad Request`: The provided ID is not a valid UUID or the body is invalid.
    -   `404 Not Found`: Message not found.

### Delete a Scheduled Message

Deletes a specific scheduled message.

-   **URL:** `/schedules/:id`
-   **Method:** `DELETE`
-   **URL Parameters:**
    -   `id` (string, uuid): The ID of the scheduled message.

-   **Success Response (204 No Content):**
    -   The server returns an empty response.

-   **Error Responses:**
    -   `400 Bad Request`: The provided ID is not a valid UUID.
    -   `404 Not Found`: Message not found.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   [Node.js](https://nodejs.org/) (LTS version recommended)
*   [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/Nunes-ND/github_flow.git
    cd github_flow
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or
    # yarn install
    ```

### Running the project (Development)

```bash
npm run dev 
# or
# yarn dev
```

### Building the project (Production)

```bash
npm run build
# or
# yarn build
```
