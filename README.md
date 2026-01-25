EvalAI – Neural Classroom Evaluation System

![Status](https://img.shields.io/badge/Status-Hackathon_Winning_Project-success?style=for-the-badge)
![AI](https://img.shields.io/badge/Powered_By-Google_Gemini_1.5-blue?style=for-the-badge&logo=google)
![Stack](https://img.shields.io/badge/Stack-Node.js_|_Firebase_|_VanillaJS-orange?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

> **EvalAI** is an AI-powered grading assistant designed to liberate teachers from the burden of manual evaluation. By leveraging **Computer Vision (OCR)** and **Generative AI**, EvalAI digitizes handwritten answer sheets, evaluates them against model answers, and provides actionable insights—saving **90% of grading time**.

---

##  Key Features

###  **AI-Powered Evaluation**
*  **Handwriting Recognition (OCR):** Accurately reads student handwriting from images.
*  **Contextual Grading:** Understands meaning rather than just keyword matching.
*  **Flexible Modes:** Supports **Strict**, **Moderate**, and **Lenient** grading.
*  **Auto Roll No. Detection:** Extracts student IDs automatically from filenames.

###  **Smart Dashboard & Analytics**
*  **Real-time Insights:** Instant calculation of class averages and performance metrics.
*  **Weakness Detection:** AI identifies class-wide knowledge gaps (e.g., *"Weak in Definitions"*).
*  **Visual Visualization:** Interactive Charts and Graphs powered by Chart.js.

###  **Teacher Productivity Tools**
*  **Audio Feedback:** Converts text feedback into speech for accessibility.
*  **Observation Log:** Persistent teacher notes saved securely to the cloud.
*  **Easy Export:** Download results as **CSV** or **Print Reports** instantly.
*  **Celebration Mode:** Fun confetti effects upon completion!

---

##  Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | HTML5, CSS3 (Glassmorphism), Vanilla JavaScript |
| **Backend** | Node.js, Express.js |
| **AI Engine** | Google Gemini API (`gemini-1.5-flash`) |
| **Database** | Google Firebase Firestore |
| **Authentication** | Firebase Auth (Email/Password) |
| **Visualization** | Chart.js, Canvas Confetti |

---

##  Installation & Setup

Follow these steps to run the project locally.

### 1. Clone the Repository
```bash
git clone [https://github.com/your-username/EvalAI.git](https://github.com/your-username/EvalAI.git)
cd EvalAI
2. Install Backend Dependencies
Bash
npm install
3. Configure Environment Variables
Create a .env file in the root directory and add your keys:

Code snippet
GEMINI_API_KEY=your_google_gemini_api_key_here
PORT=3004
4. Setup Firebase
Go to Firebase Console and create a project.

Enable Authentication (Email/Password).

Enable Firestore Database.

Create a file js/firebase.js in your project and paste your config:

JavaScript
import { initializeApp } from "[https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js](https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js)";
import { getAuth } from "[https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js](https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js)";
import { getFirestore } from "[https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js](https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js)";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
5. Run the Server
Bash
node server.js
Server will start at 

6. Launch the App
Open login.html in your browser (use Live Server extension in VS Code for best results).

Usage Workflow
Login: Teacher logs in securely via Firebase Auth.

Dashboard: View previous stats, class insights, and notes.

Upload: Upload the Question Paper image and multiple Student Answer Sheets.

Evaluate: Select strictness (Strict/Lenient) and click "Evaluate Class with AI".

Review: See scores, AI feedback, and graphs. Listen to audio feedback.

Export: Download results as CSV or Print the summary.

 Project Structure
Plaintext
EvalAI/
├── css/
│   └── style.css          # Glassmorphism UI styles
├── js/
│   ├── dashboard.js       # Dashboard logic (Firebase interactions)
│   └── firebase.js        # Firebase configuration (User created)
├── node_modules/          # Backend dependencies
├── .env                   # API Keys (Git ignored)
├── .gitignore             # Files to ignore
├── dashboard.html         # Teacher Command Center
├── evaluate.html          # Main Evaluation Interface
├── login.html             # Authentication Page
├── register.html          # Teacher Registration
├── server.js              # Node.js Backend & Gemini Integration
├── package.json           # NPM scripts
└── README.md              # Project Documentation
Contributing
This project was built for a Hackathon. Contributions are welcome!

Fork the Project

Create your Feature Branch (git checkout -b feature/AmazingFeature)

Commit your Changes (git commit -m 'Add some AmazingFeature')

Push to the Branch (git push origin feature/AmazingFeature)

Open a Pull Request