require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, 'contacts.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('./'));

// Initialize JSON file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

// Routes
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Contact Form Submission Route
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        // Validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'Please fill in all required fields (Name, Email, Subject, Message).'
            });
        }

        const newContact = {
            id: Date.now(),
            name,
            email,
            phone,
            subject,
            message,
            createdAt: new Date().toISOString()
        };

        // Read existing contacts
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

        // Add new contact
        data.push(newContact);

        // Save back to file
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

        console.log(`📩 New message from ${name}: ${subject}`);

        res.status(201).json({
            success: true,
            message: 'Your message has been received! We will get back to you soon.'
        });
    } catch (error) {
        console.error('Submission Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.'
        });
    }
});

// Admin Route to view messages (Security: just for testing for now)
app.get('/api/admin/messages', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        res.json(data);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Could not read messages' });
    }
});

// Catch-all route for index.html (SPA support)
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📂 Messages stored in: ${DATA_FILE}`);
});
