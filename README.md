# Ethereal Jobs

A full-stack job recommendation platform that matches job opportunities with user profiles and resumes.

![Ethereal Jobs Landing Page](./landing_page.png)

## About

This is a **hobby project** built to learn and explore:
- **FastAPI** - Building modern Python APIs
- **Decorators** - Python decorators for authentication and utilities
- **Google APIs** - Integrating external search and services
- Full-stack development with React and Python

## ⚠️ Current Status

**This project is currently not working and the backend is not hosted.** While the codebase is functional, the live demo link will not work. The project is in active development and we welcome contributions to help get it running!

## Features

- 📄 Resume parsing and analysis
- 💼 Job recommendation engine based on user profiles
- 🔐 User authentication and authorization
- 📧 Email notifications for job recommendations
- 🔍 LinkedIn profile integration
- ✉️ AI-powered LinkedIn message generation
- 📊 Admin dashboard
- 🎨 Modern React TypeScript frontend

## Tech Stack

### Backend
- **Python 3.x** with FastAPI
- **MongoDB** for data persistence
- **JWT** for authentication
- **Google Search API** integration
- **Email services** with scheduling
- **Docker** containerization

### Frontend
- **React 18** with TypeScript
- **Vite** build tool
- **TailwindCSS** styling
- **Responsive design**

## Project Structure

```
Ethereal-Jobs/
├── backend/              # Python FastAPI backend
│   ├── src/
│   │   ├── api/         # API endpoints
│   │   ├── db/          # Database models and connections
│   │   ├── email/       # Email service and notifications
│   │   ├── routes/      # API routes
│   │   └── utils/       # Helper functions
│   ├── models/          # Data models
│   └── requirements.txt
├── frontend/            # React TypeScript frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── api/         # API client functions
│   │   └── utils/       # Utility functions
│   └── package.json
└── docker-compose.yaml  # Docker compose configuration
```

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- pnpm
- Docker (optional)

### Setup Backend

```bash
cd backend
pip install -r requirements.txt
cd src
python main.py
```

### Setup Frontend

```bash
cd frontend
pnpm install
pnpm run dev
```

### Docker Setup

```bash
docker-compose up
```

## API Endpoints

- **Jobs**: `/api/jobs` - Manage job postings and recommendations
- **Resume**: `/api/resume` - Upload and process resumes
- **User**: `/api/user` - User profile management
- **Auth**: Authentication endpoints
- **Email**: `/api/email` - Email service endpoints
- **Admin**: `/api/admin` - Admin operations

## Contributing

Contributions are welcome! To get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

### Areas for Contribution
- Backend API improvements
- Frontend UI/UX enhancements
- Bug fixes and testing
- Documentation
- Docker and deployment configurations

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_API_KEY=your_google_api_key
EMAIL_USERNAME=your_email
EMAIL_PASSWORD=your_email_password
```

## Known Issues

- Backend is not currently hosted
- Live demo is not available
- Some features may be incomplete

## License

This project is open source and available under the MIT License.

## Support

If you have questions or run into issues, please open an issue on GitHub.

---

**Repository**: [github.com/jevil25/Ethereal-Jobs](https://github.com/jevil25/Ethereal-Jobs)
