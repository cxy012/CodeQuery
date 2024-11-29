# CodeQuery

CodeQuery is a Chrome extension that allows developers to seamlessly leverage AI for insights on code directly within GitHub repositories. Built with a locally served backend using Next.js and a Plasmo-powered frontend, it enhances productivity and understanding of complex code by providing AI-driven features in an intuitive interface.

## Prerequisites

1. **GitHub Access Token**: You need to have a GitHub access token to access repositories if required.
2. **API Access Key**: This key is required for the AI query backend service.
3. **Environment Files**: You need to create environment files for both backend and frontend using the provided `.env.example` files:
   - Backend `.env` setup
     - Copy the file from `backend/.env.example` to `backend/.env`.
     - Add your GitHub access token and API access key to the `.env` file.
   - Frontend `.env` setup
     - Copy the file from `frontend/.env.example` to `frontend/.env`.

## Getting Started

### Dependencies

This project requires two main components to run independently in different terminals: the backend service (Next.js) and the frontend extension (Plasmo).

- **Backend**: Make sure to navigate to the `backend` directory and install the dependencies using `npm`.

```bash
 cd backend
 npm install
```

- **Frontend**: Make sure to navigate to the `extension` directory and install the dependencies using `pnpm`.

```bash
cd extension
pnpm install
```

## Running the Application

**Backend**: Start the Next.js server for backend processing.

```bash
npm run dev
```

**Frontend**: Start the Plasmo extension service.

```bash
pnpm dev
```

Open your browser and load the appropriate development build. For example, if you are developing for the chrome browser, using manifest v3, use: `build/chrome-mv3-dev`.

**Make sure that both components are running concurrently in separate terminal sessions.**
