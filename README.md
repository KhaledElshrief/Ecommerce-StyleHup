# StyleHub

StyleHub is a full-stack fashion e-commerce application built with React, Redux, Node.js, Express, MongoDB, JWT authentication, and Stripe test payments.

The project is organized into three applications:

- **Client** (`Clinet`) — the customer-facing shopping application.
- **Admin Dashboard** (`Admin`) — product, user, and order management.
- **Backend** (`Backend`) — REST API, authentication, database access, image uploads, and payments.

## Features

### Client

- User registration and login.
- JWT-based authentication.
- Browse products by category.
- Product details and image display.
- User-specific shopping cart and wishlist.
- Quantity updates and product removal.
- Stripe test-mode checkout.
- Order creation and payment success page.

### Admin Dashboard

- Admin login and protected routes.
- Dashboard statistics and reports.
- Product CRUD operations.
- Product image upload.
- Real users loaded from MongoDB.
- Transaction and order listing.
- Order status management: pending, paid, shipped, delivered, and cancelled.

## Architecture

```text
React Client / React Admin
          |
       Axios
          |
   Express REST API
          |
 Mongoose Models
          |
      MongoDB Atlas
```

The Client and Admin applications communicate with the Backend through REST endpoints under `/api`. JWT tokens are sent with protected requests, while the Backend validates access using authentication and authorization middleware.

## Technology Stack

- React 18
- Redux Toolkit
- Redux Persist
- React Router
- Axios
- Material UI
- Vite for the Client
- Create React App for the Admin Dashboard
- Node.js and Express
- MongoDB Atlas and Mongoose
- JWT
- Stripe Checkout in test mode
- Multer for image uploads

## Project Structure

```text
StyleHub/
├── Admin/
├── Backend/
└── Clinet/
```

## Requirements

- Node.js 18 or newer
- npm
- MongoDB Atlas account and database user
- Stripe test account and test secret key

## Environment Variables

Create `Backend/.env` with values for your own environment:

```env
PORT=5000
MONGO_URL=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/
PASS_SEC=your-encryption-secret
JWT_SEC=your-jwt-secret
STRIPE_KEY=sk_test_your_secret_key
```

Do not commit `.env` files or real credentials.

The Client and Admin currently use the local API URL:

```text
http://localhost:5000/api/
```

## Installation and Running

Install dependencies in each application:

```powershell
cd Backend
npm install

cd ../Clinet
npm install

cd ../Admin
npm install
```

Run each application in a separate terminal:

### Backend

```powershell
cd Backend
npm start
```

Runs on `http://localhost:5000`.

### Client

```powershell
cd Clinet
npm run dev
```

Runs on `http://localhost:5173`.

### Admin Dashboard

```powershell
cd Admin
npm start
```

Runs on `http://localhost:3000`.

## Stripe Test Payment

Use Stripe's test card during development:

```text
Card number: 4242 4242 4242 4242
Expiry: any future date
CVC: 123
```

No real payment is processed in test mode.

## Important Notes

- Add your current public IP address to MongoDB Atlas Network Access.
- Keep database passwords, JWT secrets, and Stripe secret keys out of GitHub.
- The `Clinet` folder name is kept for compatibility with the current project structure.
