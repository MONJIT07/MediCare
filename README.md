# 🏥 MediCare+ | Hospital Management System

MediCare+ is a premium, full-stack hospital management platform designed to bridge the gap between patients and healthcare providers. It features a stunning, responsive frontend, a robust Node.js backend, and a comprehensive admin dashboard for seamless operation.

🚀 **Live Demo:** [https://medicare-plus-one.vercel.app](https://medicare-plus-one.vercel.app)

---

## ✨ Key Features

### 🌐 Patient Portal (Frontend)
- **Premium UI:** Modern, high-performance design with smooth animations.
- **Dynamic Content:** Real-time doctor listings and department data fetched from the API.
- **Appointment Booking:** Intelligent booking form with real-time slot selection.
- **WhatsApp Integration:** Instant connection for emergency and general queries.
- **Responsive Design:** Optimized for Mobile, Tablet, and Desktop (4K).

### 🛡️ Admin Dashboard
- **Secure Access:** JWT-based authentication for medical administrators.
- **Live Stats:** Real-time overview of appointments, doctors, and patient growth.
- **Appointment Management:** Review, confirm, or cancel patient requests with a single click.
- **Medical Resource Management:** Add/Edit/Delete Doctors and Departments dynamically.
- **Message Center:** Unified inbox for patient inquiries.

### ⚙️ Backend & Infrastructure
- **Persistent Database:** Powered by MongoDB Atlas (Cloud).
- **Email Notifications:** Real-time email alerts (Confirmation/Cancellation) via Gmail SMTP.
- **Secure API:** RESTful architecture with secure environment variables.
- **Deployment Ready:** Configured for Vercel Serverless Functions.

---

## 🛠️ Technology Stack

- **Frontend:** HTML5, Vanilla CSS3 (Custom Design System), JavaScript (ES6+).
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB Atlas (Mongoose ODM).
- **Communication:** Nodemailer (Gmail), Font Awesome (Icons), Google Maps API.
- **Deployment:** Vercel.

---

## 🚀 Getting Started

### Prerequisites
- Node.js installed on your machine.
- MongoDB Atlas account (or local MongoDB).
- Gmail App Password (for email alerts).

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/MONJIT07/MediCare.git
   cd MediCare
   ```

2. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the `backend/` folder and add:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_secret_key
   EMAIL_USER=your_gmail@gmail.com
   EMAIL_PASS=your_gmail_app_password
   FRONTEND_URL=your_vercel_url or http://localhost:5000
   ```

4. **Run the Server:**
   ```bash
   node server.js
   ```

5. **Launch Frontend:**
   Simply open `index.html` in your browser.

---

## 📍 Location
**MediCare+ Clinic**  
NIT Silchar, Cachar  
Assam 788010, India

---

## 👨‍💻 Author
**Monjit Tamuli**  
*Full Stack Developer*  
[WhatsApp Context](https://wa.me/918638505906) | [Email](mailto:monjiittamuli7747@gmail.com)

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
