# AskMeAnon - Anonymous Q&A Platform

A lightweight anonymous question and answer platform built with vanilla JavaScript, Node.js, Express, and MongoDB.

## Features

- 🔗 Create shareable links for anonymous feedback
- 📸 Generate WhatsApp Status images with questions and answers
- 🤐 Completely anonymous - no login required
- 💾 MongoDB backend for data persistence
- 📱 Mobile-responsive design
- ⚡ Fast and lightweight

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Deployment**: Can be deployed to any Node.js hosting

## Installation

### Prerequisites

- Node.js (v14+)
- npm or yarn
- MongoDB (local or MongoDB Atlas)

### Local Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd Anonymous
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env` file in the root directory:
```
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/askmeanon
PORT=5000
```

4. Start the server:
```bash
npm start
```

5. Open your browser and visit:
- Local: `http://localhost:5000`
- Mobile on same WiFi: `http://<your-ip>:5000`

## Production Deployment

### Environment Configuration

Set the following environment variables in your production environment:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@your-cluster.mongodb.net/askmeanon
PORT=5000
```

### Deployment Options

#### Option 1: Heroku

1. Create a Heroku account and install Heroku CLI
2. Login to Heroku:
```bash
heroku login
```

3. Create a new Heroku app:
```bash
heroku create your-app-name
```

4. Set environment variables:
```bash
heroku config:set NODE_ENV=production MONGODB_URI=<your-mongo-url>
```

5. Deploy:
```bash
git push heroku main
```

#### Option 2: Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

#### Option 3: Self-Hosted (VPS/Server)

1. Install Node.js on your server
2. Clone the repository
3. Install dependencies: `npm install`
4. Configure MongoDB and `.env` file
5. Start with process manager (PM2):
```bash
npm install -g pm2
pm2 start server.js --name "askmeanon"
pm2 startup
pm2 save
```

### MongoDB Setup

For production, use **MongoDB Atlas** (free tier available):

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a cluster
4. Create a database user with strong password
5. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/askmeanon`
6. Update `MONGODB_URI` in your `.env` file

## API Endpoints

- `POST /api/users/create` - Create a new user
- `GET /api/users/:userId` - Get user info
- `POST /api/messages/create` - Save an anonymous answer
- `GET /api/messages/:userId` - Get all answers for a user
- `DELETE /api/messages/:messageId` - Delete an answer
- `GET /api/health` - Health check

## Project Structure

```
├── index.html          # Main frontend application
├── styles.css          # Styling
├── app.js              # Frontend logic
├── api-config.js       # API client
├── utils.js            # Utility functions
├── server.js           # Express server
├── models.js           # MongoDB schemas
├── package.json        # Dependencies
├── .env                # Environment variables
└── .gitignore          # Git ignore rules
```

## Security Notes

- All console logging is disabled in production
- Error messages are sanitized before being sent to clients
- Input validation is performed on both frontend and backend
- MongoDB Atlas provides connection encryption (if configured)

## Performance Optimization

- Minify CSS/JS in production CDNs
- Use caching headers for static assets
- Implement rate limiting for API endpoints (optional, can be added)

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- For Atlas, verify IP whitelist settings

### Port Already in Use
- Change `PORT` in `.env`
- Or kill the process: `lsof -ti:5000 | xargs kill -9`

### API Not Responding
- Check server logs: `npm start`
- Verify MongoDB connection
- Check network firewall settings

## License

MIT

## Support

For issues or questions, please create an issue in the repository.
