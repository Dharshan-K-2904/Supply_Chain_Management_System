# SCM Portal - Frontend

React-based frontend application for Supply Chain Management Portal.

## Features

- 📊 **Dashboard** - Real-time analytics and insights
- 📦 **Product Management** - Complete product catalog management
- 🛒 **Order Processing** - End-to-end order management
- 👥 **Customer Management** - Customer relationship management
- 🏢 **Inventory Control** - Multi-warehouse inventory tracking
- 📈 **Analytics & Reports** - Visual data representations

## Tech Stack

- **React 18** - UI library
- **React Router v6** - Navigation
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Project Structure

````text

client/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── common/
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── orders/
│   │   ├── customers/
│   │   └── inventory/
│   ├── pages/
│   ├── services/
│   ├── utils/
│   ├── App.js
│   └── index.js
└── package.json
