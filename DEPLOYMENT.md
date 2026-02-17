# Deployment Guide for DirectPulse

This guide covers how to set up the backend services (Supabase) and deploy the frontend application to Google Cloud.

## Part 1: Supabase Setup (Backend & Auth)

1.  **Create a Supabase Project**
    *   Go to [Supabase](https://supabase.com/) and sign up/log in.
    *   Create a new project.
    *   Note your `Project URL` and `API Key (anon/public)`.

2.  **Configure Authentication**
    *   In your Supabase Dashboard, go to **Authentication** -> **Providers**.
    *   Ensure **Email** provider is enabled.
    *   (Optional) Disable "Confirm email" if you want users to log in immediately without verifying email for testing.

3.  **Database (Optional for now)**
    *   The current application uses a local mock store for data persistence (simulated in-memory).
    *   To fully migrate data to Supabase, you would need to create tables matching the `TriageRequest` and `User` types in `types.ts`.
    *   For this deployment, we will focus on **Authentication** which is fully integrated.

## Part 2: Application Configuration

1.  **Environment Variables**
    *   Create a `.env` file in the root directory (based on `.env.example` if it exists, or create one).
    *   Add the following keys:
        ```env
        VITE_SUPABASE_URL=your_supabase_project_url
        VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
        VITE_GEMINI_API_KEY=your_google_gemini_api_key
        ```

## Part 3: Deploy to Google Cloud

We recommend using **Firebase Hosting** (part of Google Cloud Platform) for the best performance and easiest setup for this React application. Alternatively, you can use **Cloud Run** if you prefer a containerized approach.

### Option A: Firebase Hosting (Recommended)

1.  **Install Firebase CLI**
    ```bash
    npm install -g firebase-tools
    ```

2.  **Login to Google**
    ```bash
    firebase login
    ```

3.  **Initialize Project**
    *   Run `firebase init` in the project root.
    *   Select **Hosting: Configure files for Firebase Hosting**.
    *   Select **Use an existing project** (if you have a GCP project) or **Create a new project**.
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

### Option B: Google Cloud Run (Docker Container)

If you prefer to containerize the application:

1.  **Create a `Dockerfile`**
    Create a file named `Dockerfile` in the root:
    ```dockerfile
    # Build Stage
    FROM node:18-alpine as build
    WORKDIR /app
    COPY package*.json ./
    RUN npm install
    COPY . .
    RUN npm run build

    # Serve Stage
    FROM nginx:alpine
    COPY --from=build /app/dist /usr/share/nginx/html
    COPY nginx.conf /etc/nginx/conf.d/default.conf
    EXPOSE 80
    CMD ["nginx", "-g", "daemon off;"]
    ```

2.  **Create `nginx.conf`**
    ```nginx
    server {
        listen 80;
        location / {
            root /usr/share/nginx/html;
            index index.html index.htm;
            try_files $uri $uri/ /index.html;
        }
    }
    ```

3.  **Build and Push to Google Container Registry (GCR)**
    *   Ensure Google Cloud SDK is installed (`gcloud`).
    *   Enable Container Registry and Cloud Run APIs.
    ```bash
    gcloud auth login
    gcloud config set project YOUR_PROJECT_ID
    gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/directpulse-app
    ```

4.  **Deploy to Cloud Run**
    ```bash
    gcloud run deploy directpulse-app \
      --image gcr.io/YOUR_PROJECT_ID/directpulse-app \
      --platform managed \
      --region us-central1 \
      --allow-unauthenticated
    ```
    *   Note: You will need to supply environment variables via the Cloud Run console or command line using `--set-env-vars`.

## Verification

1.  Open your deployed URL.
2.  Sign up with a new email address.
3.  Check your email for the Supabase verification link (if enabled).
4.  Login and test the "New Consultation" flow.
