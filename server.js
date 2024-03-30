const express = require('express');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // Import cookie-parser
const jwt = require('jsonwebtoken'); // Import jsonwebtoken
const News = require('./models/News'); // Import the News model
const User = require('./models/User');
require('dotenv').config();

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

app.use(express.json());
app.use(cors());
app.use(cookieParser()); // Use cookie-parser middleware

// Define routes for adding, fetching, updating, and deleting news
app.post('/api/news', async (req, res) => {
    const { title, category, status, description, imageUrl } = req.body;
    try {
        const news = new News({ title, category, status, description, imageUrl });
        await news.save();
        res.status(201).json(news);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error adding news' });
    }
});

app.post('/api/signup', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

        // Create new user with hashed password
        const newUser = new User({ firstName, lastName, email, password: hashedPassword });
        await newUser.save();
        
        // Optionally, you may want to generate a token here and send it back to the client for authentication
        
        res.status(201).json({ message: 'User signed up successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error signing up' });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Compare passwords
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Incorrect password' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET , { expiresIn: '1h' });

        // Send the token in the response
        res.status(200).json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error logging in' });
    }
});

// app.get('/api/user', async (req, res) => {
//     try {
//         const token = req.cookies.token;
//         console.log('token', token);
//         if (!token) {
//             return res.status(401).json({ error: 'Authentication token missing' });
//         }
        
//         // Verify the token
//         const decoded = jwt.verify(token, 'mksecret123');
//         const userId = decoded.userId;

//         // Find the user in the database
//         const user = await User.findById(userId);
//         if (!user) {
//             return res.status(404).json({ error: 'User not found' });
//         }

//         // Send user information including role
//         res.json({ role: user.role });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });


app.get('/api/user', async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        console.log('Token:', token);
        if (!token) {
            return res.status(401).json({ error: 'Authentication token missing' });
        }
        
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // Find the user in the database
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Send user information including role
        res.json({ role: user.role });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.get('/api/news', async (req, res) => {
    try {
        const news = await News.find();
        res.json(news);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching news' });
    }
});

app.get('/api/news/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const newsItem = await News.findById(id);
        if (!newsItem) {
            return res.status(404).json({ message: 'News not found' });
        }
        res.json(newsItem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching news by ID' });
    }
});

// Route to update a news item
app.put('/api/news/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, category, status, description, imageUrl } = req.body;
        const updatedNews = await News.findByIdAndUpdate(id, { title, category, status, description, imageUrl }, { new: true });
        if (!updatedNews) {
            return res.status(404).json({ message: 'News not found' });
        }
        res.json(updatedNews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error updating news' });
    }
});

// Route to delete a news item
app.delete('/api/news/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedNews = await News.findByIdAndDelete(id);
        if (!deletedNews) {
            return res.status(404).json({ message: 'News not found' });
        }
        res.json({ message: 'News deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error deleting news' });
    }
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
