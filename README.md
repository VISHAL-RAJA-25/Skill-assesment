# SkillAssess — Placement Readiness Platform

## Project Overview
SkillAssess is a full-stack web-based platform designed to help engineering students assess their technical skills, identify weak areas, and improve their placement readiness. The system evaluates users across multiple domains and provides AI-based feedback along with personalized job recommendations.

## Key Features

### Assessment System
- MCQ-based tests for Aptitude and Computer Networks  
- Timer-based questions with randomized options  
- Difficulty levels: Easy, Medium, Hard  

### Code Execution
- Supports JavaScript, Python, C, and C++  
- Executes code in a secure sandbox environment  
- Evaluates solutions using predefined test cases  

### SQL Evaluation
- Users write real SQL queries  
- Queries are executed on an in-memory SQLite database  
- Output is validated against expected results  

### AI-Based Evaluation
- Uses Google Gemini API  
- Evaluates logical correctness beyond exact matching  
- Provides short feedback on user answers  

### Job Recommendation System
- Maps user performance to job roles such as Backend Developer, Data Analyst, and Full Stack Developer  
- Displays required skill levels and improvement suggestions  

### Performance Tracking
- Tracks test history and performance trends  
- Identifies strong and weak skill areas  
- Displays improvement statistics  

### Study Roadmap
- Suggests learning resources based on weak areas  
- Provides structured guidance for improvement  

### Admin Panel
- Manage questions (MCQ, SQL, DSA)  
- View student performance  
- Analyze question difficulty  
- Export data as CSV  

## Technology Stack

Frontend: React.js with Vite  
Backend: Node.js with Express.js  
Database: MongoDB with Mongoose  
Authentication: JWT and bcrypt  
AI Integration: Google Gemini API  
Code Execution: Node.js VM, Python, GCC, G++  
SQL Engine: better-sqlite3  
Email Service: Nodemailer with Gmail SMTP  
Code Editor: Monaco Editor  

## Project Structure

SkillAssess/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   └── server.js
│
└── frontend/
    ├── pages/
    └── components/

## Installation and Setup

### Prerequisites
- Node.js  
- MongoDB  
- Python  
- GCC or G++  

### Backend Setup
cd backend  
npm install  
npm start  

### Frontend Setup
cd frontend  
npm install  
npm run dev  

## Environment Variables

Create a .env file in the backend folder:

MONGO_URI=your_mongodb_url  
JWT_SECRET=your_secret_key  
EMAIL_USER=your_email  
EMAIL_PASS=your_app_password  
GEMINI_API_KEY=your_api_key  

## Security Features
- JWT-based authentication for protected routes  
- Password hashing using bcrypt  
- OTP-based password reset system  
- Secure sandbox for code execution  
- Role-based admin access control  

## Unique Aspects
- Real-time code execution instead of simple MCQs  
- AI-based evaluation for logical correctness  
- SQL execution with real database interaction  
- Job recommendation system based on performance  
- Complete full-stack implementation with admin support  

## Future Enhancements
- Resume analysis using AI  
- Interview preparation module  
- Company-specific test simulations  
- Mobile application support  

## Author
Vishal R  
B.Tech Computer Science and Engineering (Data Science)
