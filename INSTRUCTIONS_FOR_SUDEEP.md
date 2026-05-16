# Onboarding Guide for LiveMail Classifier

Welcome to the project! Follow these quick steps to get the system running on your local machine using your credentials.

### 1. Installation
Navigate to both the `frontend` and `backend` directories individually and run:
`npm install`

*(Note: In this template, `frontend` refers to the `client` directory and `backend` refers to the `server` directory.)*

### 2. Environment Variables
A `.env` file has been prepared for you in the backend. Double check that your Client ID, Client Secret, and MongoDB URI match your profile.

### 3. Initialize & Train the NLP Model
Before launching the server, run the seeding script to train the Bayes Classifier:
`npm run seed` (or `node scripts/seed.js`)

### 4. Authenticate your Gmail Account
Run the token generation utility to perform your one-time login:
`node scripts/getRefreshToken.js`
- Copy the link generated in the terminal, open it in Chrome, and log in.
- Click "Allow" (bypass the unverified warning via Advanced).
- Copy the code from the redirected browser URL bar and paste it back into your terminal/env file as `GOOGLE_REFRESH_TOKEN`.

### 5. Run the Application
Start the backend: `npm run dev` or `node server.js`
Start the frontend: `npm start`
