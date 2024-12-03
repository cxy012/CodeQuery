# CodeQuery

CodeQuery is a Chrome extension that allows developers to seamlessly leverage AI for insights on code directly within GitHub repositories. Built with a locally served backend using Next.js and a Plasmo-powered frontend, it enhances productivity and understanding of complex code by providing AI-driven features in an intuitive interface.

## Prerequisites

1. **GitHub Access Token**: You need to have a GitHub access token to access repositories if required.
2. **Environment Files**: You need to create environment files for both backend and frontend using the provided `.env.example` files:
   - Backend `.env` setup
     - Copy the file from `backend/.env.example` to `backend/.env`.
     - Add your GitHub access token and API access key to the `.env` file.

```bash
  cp backend/.env.example backend/.env
```

- Frontend `.env` setup
  - Copy the file from `extension/.env.example` to `extension/.env`.

```bash
cp extension/.env.example extension/.env
```

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

### Development Mode

To run the application in development mode, where you can make changes and see them in real-time:

```bash
pnpm dev
```

### Production Mode

If you want to deploy the application for regular use, you can build both the backend and frontend.

Once both components are running, open your Chrome browser and load the development build:

```bash
pnpm build
```

1. Go to **chrome://extensions**.
2. Enable **Developer mode**

<img src="example_images/dev_mode.png" alt="Developer Mode" style="width: 300px;"/>

3. Click Load unpacked and select the appropriate `extension/build/chrome-mv3-dev` or `extension/build/chrome-mv3-prod` directory from the frontend.

<img src="example_images/load_unpacked.png" alt="Load Unpacked" style="width: 300px;"/>

## Development Notes

- ** Origin Trials Key**: The current version of this extension includes an Origin Trials access key in the manifest to leverage the Prompt API for Chrome Extensions. This key may expire in the future, and users will need to add a new key to continue using these features. You can obtain a new key from [Chrome Origin Trials](https://developer.chrome.com/origintrials/#/trials/active).
