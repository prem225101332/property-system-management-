Property Management System
A comprehensive, web-based Property Management System designed to streamline rental management for property managers and provide a transparent, communicative experience for tenants. Built with the MVC architecture using Node.js, Express, MongoDB, and Materialize CSS.

🚀 Features

For Admins (Property Managers)

Dashboard Overview: View property portfolio, financial metrics, and tenant activity at a glance.
Property Management: Full CRUD operations for managing properties (add, view, edit, soft delete).
Tenant Management: Create and manage tenant accounts, assign properties, and view activity logs.
Billing & Payments: Generate monthly rent bills, track due dates, and monitor outstanding dues.
Real-Time Chat: Communicate directly with tenants via a WebSocket-powered chat interface.
Reporting: Generate and export financial and property reports (PDF).
For Tenants

Personal Dashboard: View current dues, upcoming payments, and payment history.
Profile Management: Update personal information securely.
Rental Agreement Access: View assigned property details and rental agreements.
Direct Communication: Chat in real-time with the property manager.
🛠️ Tech Stack

Backend: Node.js, Express.js
Database: MongoDB with Mongoose ODM
Frontend: HTML5, CSS3, JavaScript, Materialize CSS
Authentication: JWT (JSON Web Tokens)
Real-Time Communication: Socket.IO
Password Hashing: bcryptjs
📦 Installation & Setup

Follow these steps to set up the project locally:

Clone the repository
bash
git clone https://github.com/your-username/property-management-system.git
cd property-management-system
Install dependencies
bash
npm install
Environment Variables
Create a .env file in the root directory and add the following variables:
env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
Replace the values with your actual MongoDB URI and a strong JWT secret.
Start the development server
bash
npm start
# or for development with auto-restart
npm run dev
Open your browser
Navigate to http://localhost:3000
📁 Project Structure

text
property-management-system/
├── models/                 # MongoDB Mongoose models (User, Property, etc.)
├── controllers/            # Route controllers (business logic)
├── routes/                 # Express routes
├── middleware/             # Custom middleware (auth, validation)
├── public/                 # Static files (CSS, JS, images)
│   ├── css/
│   ├── js/
│   └── ...
├── views/                  # EJS or other templating engine files
├── .env                    # Environment variables (gitignored)
├── app.js                  # Main application entry point
└── package.json
🤝 Contributing

We welcome contributions! Please follow these steps:

Fork the Project.
Create your Feature Branch (git checkout -b feature/AmazingFeature).
Commit your Changes (git commit -m 'Add some AmazingFeature').
Push to the Branch (git push origin feature/AmazingFeature).
Open a Pull Request.
Please ensure your code follows the project's style and all tests pass.

📄 License

This project is licensed under the Apache License - see the LICENSE.md file for details.

👨‍💻 Team

Prem Kumar
Akhileshwar Reddy
Srikar Boske
Durga Reddy
🙏 Acknowledgments

Based on the IEEE Standard for Software Requirements Specifications (IEEE Std 830-1998).
Materialize CSS framework for the UI components.
Icons from Material Icons.