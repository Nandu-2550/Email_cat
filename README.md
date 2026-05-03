# 📧 LiveMail Classifier

A real-time email categorization system that fetches emails via Gmail API, classifies them using Natural Language Processing (NLP), and displays results on a live React dashboard with Socket.io updates.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Gmail API     │───▶│  Node.js/Express │───▶│   MongoDB       │
│   (Polling)     │    │  (Backend)       │    │   (LiveMailDB)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   NLP Classifier │
                       │   (Bayes)        │
                       └─────────────────┘
                              │
                              ▼
┌─────────────────┐    ┌─────────────────┐
│   React         │◀───│   Socket.io     │
│   Dashboard     │    │   (Real-time)   │
└─────────────────┘    └─────────────────┘
```

## 🚀 Features

- **Real-time Email Fetching**: Polls Gmail every 60 seconds for new messages
- **NLP Classification**: Uses Naive Bayes classifier with 7 categories:
  - Personal
  - Business
  - Finance
  - Security
  - Work
  - College/School
  - Promotion
- **Live Dashboard**: React frontend with real-time updates via Socket.io
- **Category Statistics**: Visual breakdown of email distribution
- **MongoDB Storage**: Persistent storage in MongoDB Atlas (LiveMailDB)
- **Demo Mode**: Works without Gmail API credentials for testing

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB Atlas cluster (9-kissdb)
- (Optional) Gmail API credentials for real email fetching

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/Nandu-2550/CivicLink_9kis-2026.git
cd Email\ catagariser
```

### 2. Install all dependencies

```bash
npm run install-all
```

### 3. Configure environment variables

#### Server Configuration
```bash
cp server/.env.example server/.env
```

Edit `server/.env` with your MongoDB Atlas connection string:
```
MONGO_URI=mongodb+srv://<username>:<password>@9-kissdb.<cluster-id>.mongodb.net/LiveMailDB?retryWrites=true&w=majority
```

#### Client Configuration
```bash
cp client/.env.example client/.env
```

### 4. Train the classifier (Seed)

```bash
npm run server:seed
```

This trains the Bayes classifier with 105 sample emails across all 7 categories.

## 🏃 Running the Application

### Development Mode (Both server and client)

```bash
npm run dev
```

### Run Server Only

```bash
npm run server:dev
```

### Run Client Only

```bash
npm run client
```

## 📁 Project Structure

```
Email catagariser/
├── client/                    # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── CategoryStats.js
│   │   │   ├── Dashboard.js
│   │   │   ├── EmailCard.js
│   │   │   ├── EmailList.js
│   │   │   └── Header.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── server/                    # Node.js backend
│   ├── config/
│   │   ├── database.js        # MongoDB connection
│   │   └── googleAuth.js      # Google OAuth2 configuration
│   ├── data/
│   │   └── classifier.json    # Persistent trained model
│   ├── models/
│   │   └── Email.js           # Email schema
│   ├── routes/
│   │   └── emailRoutes.js     # API routes
│   ├── services/
│   │   ├── gmailService.js    # Gmail API integration
│   │   └── classifier.js      # NLP Bayes Classifier logic
│   ├── server.js              # Main server file
│   ├── seed.js                # Training data script
│   └── package.json
│
├── .env.example               # Root environment example
├── .gitignore
├── package.json               # Root package.json
└── README.md
```

## 🛡️ Security Note

This application follows modern security best practices:
- **OAuth2 Protocol**: Instead of asking for your Gmail password, the app uses Google's secure OAuth2 protocol.
- **Read-Only Access**: The `https://www.googleapis.com/auth/gmail.readonly` scope ensures the app can only read your emails and cannot send or delete them.
- **Environment Isolation**: All sensitive credentials (API keys, DB passwords) are stored in `.env` files and are excluded from version control via `.gitignore`.
- **Credential Masking**: A `.env.example` template is provided to safely document required variables without exposing real data.

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/emails` | Get recent emails |
| GET | `/api/emails/stats` | Get category statistics |
| GET | `/api/emails/:id` | Get single email |
| GET | `/api/emails/category/:category` | Get emails by category |
| DELETE | `/api/emails/:id` | Delete an email |

## 🔌 Socket.io Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `new-email` | Server → Client | Emitted when a new email is categorized |

## 🎯 Gmail API Setup (Optional)

To enable real Gmail integration:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Gmail API
4. Create OAuth 2.0 credentials
5. Get your Client ID, Client Secret, and Refresh Token
6. Update `server/.env` with your credentials

### Getting Refresh Token

Use this OAuth playground flow or run a one-time script to get your refresh token.

## 🧪 Testing Without Gmail

The application runs in **demo mode** when Gmail credentials are not provided. It generates sample emails to demonstrate the real-time functionality.

## 📊 Categories

| Category | Color | Description |
|----------|-------|-------------|
| Personal | Green | Family, friends, social |
| Business | Indigo | Corporate, partnerships, strategy |
| Finance | Amber | Banking, investments, taxes |
| Security | Red | Alerts, passwords, privacy |
| Work | Purple | Projects, meetings, tasks |
| College/School | Cyan | Assignments, grades, campus |
| Promotion | Pink | Sales, discounts, marketing |

## 🛡️ Database Configuration

The application uses MongoDB Atlas cluster **9-kissdb** with a dedicated database **LiveMailDB** for logical isolation.

Connection string format:
```
mongodb+srv://<user>:<pass>@9-kissdb.xxx.mongodb.net/LiveMailDB
```

## 📝 License

MIT License

## 👥 Author

LiveMail Team

---

**Note**: This project is part of the CivicLink_9kis-2026 repository.