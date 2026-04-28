# Bias Analysis and Mitigation System (BAIS)

A comprehensive, production-ready dashboard for detecting, analyzing, and mitigating bias in machine learning models. Built with React, TypeScript, and FastAPI backend integration.

## Features

### Core Functionality
- **Dataset Upload & Analysis**: Upload CSV datasets and detect bias patterns
- **Fairness Metrics**: Comprehensive bias analysis with multiple fairness definitions
- **Bias Mitigation**: Apply pre-processing, in-processing, and post-processing algorithms
- **Explainability**: SHAP, LIME, and counterfactual analysis
- **Interactive Simulation**: Real-time prediction simulation with counterfactual generation
- **Audit Reports**: Generate and download comprehensive bias audit reports
- **Authentication**: JWT-based user authentication system

### Advanced Features
- **Real-time Dashboard**: Live monitoring of bias metrics and trends
- **Multi-algorithm Support**: Reweighing, LFR, Adversarial Debiasing, and more
- **Visual Analytics**: Interactive charts and visualizations using Recharts
- **Risk Assessment**: Automated bias risk scoring and compliance checking
- **Export Capabilities**: PDF report generation and data export

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **React Router** for navigation
- **Context API** for state management
- **Axios** for API communication

### Backend Integration
- **FastAPI** backend (Python)
- **JWT Authentication**
- **RESTful API design**
- **ML libraries**: scikit-learn, AIF360, SHAP, LIME

## Project Structure

```
src/
├── app/
│   ├── components/          # Reusable UI components
│   │   ├── Layout.tsx       # Main app layout with navigation
│   │   └── ProtectedRoute.tsx # Authentication wrapper
│   ├── context/             # React Context providers
│   │   ├── AppContext.tsx   # Global application state
│   │   └── AuthContext.tsx  # Authentication state
│   ├── pages/               # Page components
│   │   ├── Dashboard.tsx    # Main dashboard overview
│   │   ├── DatasetAnalysis.tsx # Dataset upload and analysis
│   │   ├── FairnessMetrics.tsx # Bias metrics and visualizations
│   │   ├── BiasMitigation.tsx # Mitigation algorithms
│   │   ├── ModelAnalysis.tsx # Explainability (SHAP/LIME)
│   │   ├── Simulation.tsx   # Interactive simulation
│   │   ├── AuditReports.tsx # Reports and downloads
│   │   ├── Login.tsx        # Authentication page
│   │   ├── Architecture.tsx # System architecture
│   │   └── Applications.tsx # Use cases
│   ├── routes.tsx           # React Router configuration
│   └── App.tsx             # Main app component
├── lib/
│   └── api.ts              # API service layer
├── styles/
│   └── index.css           # Global styles
└── main.tsx               # App entry point
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Python 3.8+ (for backend)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd BAIS-
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Set up the backend**
```bash
cd backend
pip install -r requirements.txt
```

### Running the Application

1. **Start the backend server**
```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```

2. **Start the frontend development server**
```bash
npm run dev
```

3. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Authentication

The application includes a complete authentication system:

### Demo Access
For demo purposes, you can use any email and password combination to explore the dashboard features.

### Features
- JWT token-based authentication
- Protected routes
- User session management
- Logout functionality

## Pages and Features

### 1. Dashboard Overview (`/`)
- Real-time bias metrics
- System status monitoring
- Recent audit history
- Quick action cards

### 2. Dataset Analysis (`/dataset`)
- CSV file upload
- Column statistics and bias risk assessment
- Data distribution analysis
- Protected attribute identification

### 3. Fairness Metrics (`/metrics`)
- Demographic Parity analysis
- Equal Opportunity metrics
- Disparate Impact calculations
- Visual metric comparisons

### 4. Bias Mitigation (`/mitigation`)
- Pre-processing algorithms (Reweighing, LFR)
- In-processing methods (Adversarial Debiasing)
- Post-processing techniques
- Before/after comparisons

### 5. Explainability (`/explainability`)
- Global SHAP feature importance
- Local SHAP explanations
- LIME local explanations
- Counterfactual analysis

### 6. Simulation (`/simulation`)
- Interactive prediction simulation
- Real-time feature adjustment
- Counterfactual generation
- Sensitivity analysis

### 7. Audit Reports (`/reports`)
- Comprehensive audit history
- PDF report generation
- Filter and search capabilities
- Detailed metric breakdowns

## API Integration

The frontend integrates with a FastAPI backend through a comprehensive API layer:

### Key Endpoints
- `POST /api/v1/upload/dataset` - Dataset upload
- `POST /api/v1/analyze` - Bias analysis
- `POST /api/v1/mitigate` - Apply mitigation
- `GET /api/v1/model/explain` - Model explanations
- `POST /api/v1/simulate` - Prediction simulation
- `GET /api/v1/reports` - Fetch reports
- `GET /api/v1/reports/{id}/pdf` - Download PDF report

### Authentication Endpoints
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/signup` - User registration

## UI/UX Features

- **Dark Theme**: Professional dark mode design
- **Responsive Layout**: Mobile-friendly interface
- **Interactive Charts**: Real-time data visualization
- **Loading States**: Smooth loading indicators
- **Error Handling**: Graceful error management
- **Toast Notifications**: User feedback system

## Development

### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Component-based architecture

## Performance Features

- **Lazy Loading**: Components loaded on demand
- **Optimized Charts**: Efficient data visualization
- **State Management**: Efficient context usage
- **API Caching**: Smart data caching strategies

## Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_APP_NAME=BAIS Dashboard
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Check the API documentation at `/docs`
- Review the component documentation
- Open an issue for bugs or feature requests

---

**Built with ❤️ for fair and transparent AI**
