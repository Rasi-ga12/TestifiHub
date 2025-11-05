# TestifiHub

TestifiHub is a smart, AI-integrated web application designed to modernize online examinations. It automates question generation, code creation, test delivery, and evaluation using advanced technologies like the Gemini API. The platform supports dynamic assessments, instant feedback, and personalized progress tracking for students.

## 🎯 Key Modules

- 🤖 AI-powered question generation via Gemini API
- 🧪 Automated test delivery and real-time evaluation
- 📊 Personalized dashboard for progress tracking
- 🔐 Secure login and JWT-based authentication
- 📧 Email notifications for test results and updates
  
---

## 🛠️ Tech Stack

- **Frontend**: React.js + Tailwind CSS
- **Backend**: Flask (Python)
- **Database**: MySQL
- **AI Integration**: Gemini API
- **Environment**: Node.js, npm, Python virtual env

---

## 📦 Software Requirements

| Software   | Version     |
|------------|-------------|
| Node.js    | 22.14.0     |
| npm        | 10.9.0      |
| Python     | 3.12.0      |
| VS Code    | 1.100.0     |
| MySQL      | LTS         |

---

## 👥 Target Users

SkillChecker is designed for a wide range of users, including:
- **college Students** – To assess their academic or skill-based knowledge before exams or interviews.
- **Job Seekers** – To practice and evaluate their technical or aptitude skills.
- **Educational Institutions** – For conducting AI-powered online assessments for their learners.
- **Corporate HR Teams** – For screening candidates using tailored technical tests.
- **Freelancers and Professionals** – To test and improve their skills through intelligent feedback.

---

## 🔧 Features

**✅ User Authentication**
- Secure login and registration using JWT-based authentication. Passwords are hashed with Flask-Bcrypt, and protected routes are accessible only to logged-in users.

**📋 Dashboard**
- Displays a personalized welcome message and organizes assessments into Pending and Completed sections. Includes quick-access buttons for generating questions and starting new assessments.

**🧠 Question Generator**
- Generates question papers based on syllabus, marks per question, and quantity. Uses Gemini API to produce topic-relevant questions and exports them as downloadable PDFs—ideal for students, tutors, and institutions.

**📝 Take New Assessment**
- Allows users to take MCQ-based tests by selecting subject, topic, and difficulty. Enforces daily limits and single-attempt rules. Status updates automatically, and instant evaluation provides quick feedback.

**💻 Code Generator**
- Accepts natural language prompts (e.g., “Factorial of 5”) and returns complete code with explanations. Supports conceptual learning through guided code review.

**📊 Analytics Dashboard**
- Visualizes performance trends with subject-wise and topic-wise insights. Displays recent activity and test summaries to help users identify strengths and areas for improvement.

**💬 Feedback Module**
- Enables users to submit feedback, suggestions, or comments. Inputs are stored in the backend to support continuous platform improvement through active user participation.

**⚙️ Settings**
- Allows users to view and update personal details. Includes secure password change functionality to maintain account safety.

---
