# DropSpot - Alpaco Full Stack Case

_Project Start Time:_ **202511100109**

## 1. Project Summary & Architecture

DropSpot is a fair, scalable waitlist and claiming platform for limited stock products (drops).

- **Frontend:** Next.js (React)
- **Backend:** Node.js (Express)
- **Database:** PostgreSQL (Hosted on Render)
- **Architecture:** A decoupled architecture where the Frontend and Backend operate as separate services, communicating via a JSON API.

## 2. Data Model & Endpoints

### Data Model

- **users:** Stores user information and roles (is_admin).
- **drops:** Stores drop details, stock counts, and scheduling.
- **waitlist:** Stores which user joined which drop and their calculated `priority_score`.
- **claims:** Stores which user successfully claimed an item and their unique `claim_code`.

### API Endpoints

- `POST /auth/signup`
- `POST /auth/login`
- `GET /drops` (Public list)
- `GET /drops/:id` (Public details)
- `POST /drops/:id/join` (Protected)
- `POST /drops/:id/leave` (Protected)
- `POST /drops/:id/claim` (Protected)
- `GET /drops/:id/status` (Protected)
- `GET /admin/drops` (Admin only)
- `POST /admin/drops` (Admin only)
- `PUT /admin/drops/:id` (Admin only)
- `DELETE /admin/drops/:id` (Admin only)

## 3. CRUD Module Explanation

The Admin Dashboard (`/admin`) allows authorized users (is_admin=true) to create new drops, update existing ones, and delete them. These endpoints are protected by `authMiddleware` (token verification) and `verifyAdmin` (admin role check).

## 4. Idempotency and Transaction Structure

- **Waitlist (Idempotency):** The `waitlist` table has a `(user_id, drop_id)` composite primary key. Even if a user clicks "Join" 10 times, the database constraint ensures only the first attempt succeeds, and the others fail silently (`ON CONFLICT DO NOTHING`).
- **Claim (Transaction):** The `POST /drops/:id/claim` endpoint is the most critical. It uses a PostgreSQL transaction. If 100 people try to claim 1 item at the same time:
  1. `BEGIN` starts the transaction.
  2. `SELECT ... FOR UPDATE` locks the specific row in the `drops` table.
  3. Stock, status, and auth are checked.
  4. Stock is decremented (`UPDATE drops SET stock = stock - 1`).
  5. A record is inserted into the `claims` table (which also has a `UNIQUE(user_id, drop_id)` constraint).
  6. `COMMIT` finalizes the changes.
  7. `ROLLBACK` is called if any step fails.

## 5. Setup and Installation

### Backend

```bash
cd backend
npm install
# Create .env file and add DATABASE_URL, PORT, JWT_SECRET and OPENAI_API_KEY
node setupDb.js
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 6. Screenshots

**(Drag and drop your 3 screenshots here)**

**Image 1: Admin Dashboard**
![Admin Dashboard](/imgs/admin-dashboard.png)
_Description: The CRUD panel where admins manage drops._

**Image 2: Drop List (Home Page)**
![Drop List Page](/imgs//home-page.png)
_Description: The main home page where users see active and upcoming drops._

**Image 3: Successful Claim Screen**
![Claim Success](/imgs/successful-claim-screen.png)
_Description: The screen a user sees after successfully claiming an item, showing their unique code._

## 7. Technical Choices

- **Express vs. NestJS:** Given the 72-hour time limit, Express was chosen over NestJS for its speed in prototyping and flexibility.
- **Context API vs. Redux:** Since the only global state was Authentication, React's built-in Context API was used to avoid the complexity of Redux.
- **Pure PG vs. ORM:** To avoid ORM overhead and have full SQL control over critical transactions (like `FOR UPDATE`), the native `pg` library was used.

## 8. Seed Generation and Usage

### Seed

**beb6e8799096**

### Usage

This seed was used in `backend/utils/scoreCalculator.js` to generate the A, B, and C coefficients:

```javascript
// Coefficient generation example:
A = 7  + (int(seed[0:2],16) % 5)
B = 13 + (int(seed[2:4],16) % 7)
C = 3  + (int(seed[4:6],16) % 3)

/*These coefficients were then used in the priority_score formula as specified in the document, creating a fair and deterministic score for ranking users on the waitlist.*/

priority_score = base + (signup_latency_ms % A) + (account_age_days % B) - (rapid_actions % C)
```
