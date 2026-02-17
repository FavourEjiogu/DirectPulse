# Deployment Guide for DirectPulse

This guide covers how to set up Firebase and deploy the application using Firebase Hosting.

## Part 1: Firebase Project Setup

1.  **Create a Firebase Project**
    *   Go to [Firebase Console](https://console.firebase.google.com/) and create a new project.
    *   (Optional) Enable Google Analytics if prompted.

2.  **Enable Authentication**
    *   In the Firebase Console, go to **Build** -> **Authentication**.
    *   Click **Get Started**.
    *   Go to the **Sign-in method** tab.
    *   Enable **Email/Password** provider.
    *   Ensure **Email link (passwordless sign-in)** is *disabled* (we are using password-based auth).

3.  **Get Configuration**
    *   Go to **Project Settings** (gear icon).
    *   Scroll down to **Your apps**.
    *   Click the web icon (`</>`) to create a web app.
    *   Register the app (e.g., "DirectPulse Web").
    *   Copy the `firebaseConfig` object values. You will need them for environment variables.

## Part 2: Application Configuration

1.  **Environment Variables**
    *   Create a `.env` file in the root directory.
    *   Add the following keys (populate with values from Part 1):
        ```env
        VITE_FIREBASE_API_KEY=your_api_key
        VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
        VITE_FIREBASE_PROJECT_ID=your_project_id
        VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
        VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
        VITE_FIREBASE_APP_ID=your_app_id
        VITE_GEMINI_API_KEY=your_google_gemini_api_key
        ```

## Part 3: Deploy with Firebase Hosting

1.  **Install Firebase CLI**
    ```bash
    npm install -g firebase-tools
    ```

2.  **Login**
    ```bash
    firebase login
    ```

3.  **Initialize Project**
    *   Run `firebase init` in the project root.
    *   Select **Hosting: Configure files for Firebase Hosting**.
    *   Select **Use an existing project** and choose the project you created in Part 1.
    *   **Public directory**: `dist`
    *   **Configure as a single-page app**: `Yes`
    *   **Set up automatic builds and deploys with GitHub**: `No` (or Yes if you want CI/CD).

4.  **Build the Application**
    ```bash
    npm run build
    ```

5.  **Deploy**
    ```bash
    firebase deploy
    ```
    *   Your app will be live at `https://your-project-id.web.app`.
