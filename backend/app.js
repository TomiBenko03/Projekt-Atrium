const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

// Import routes
const agentRoutes = require('./routes/agentRoutes');
const buyerRoutes = require('./routes/buyerRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const apiRoutes = require('./routes/apiRoutes');
const messageRoutes = require('./routes/messageRoutes');
const app = express();

// Middleware

var allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];
app.use(cors({
  credentials: true,
  origin: function(origin, callback){
    // Allow requests with no origin (mobile apps, curl)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin)===-1){
      var msg = "The CORS policy does not allow access from the specified Origin.";
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));
app.use(bodyParser.json());

// MongoDB connection
const mongoURI = 'mongodb://127.0.0.1:27017/atrium_local'; // Replace with your MongoDB URI
mongoose
    .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Error connecting to MongoDB:', err));


// Enables session support
var session = require('express-session');
var MongoStore = require('connect-mongo');
app.use(session({
  secret: 'black mold on my ceiling',
  resave: true,
  saveUninitialized: false,
  store: MongoStore.create({mongoUrl: mongoURI})
}));

// Make session available in all views
app.use(function (req, res, next) {
  res.locals.sessions = req.session;
  next();
});

// Routes
app.use('/api/agents', agentRoutes);
app.use('/api/buyer', buyerRoutes);
app.use('/api/property', propertyRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/apis', apiRoutes);
app.use('/api/messages', messageRoutes);

app.get('/api/session', (req, res) => {
  if (req.session.agentId) {
    console.log(`bruh`);
      return res.status(200).json({ role: req.session.role });
      
  }
  console.log(`bruh2`);
  res.status(401).json({ message: 'User not logged in' });
});
// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
