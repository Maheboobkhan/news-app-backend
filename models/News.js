const mongoose = require('mongoose');

// Get the current date
const currentDate = new Date();

// Get the current year, month, and day
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth() + 1; // Months are zero-indexed
const currentDay = currentDate.getDate();

// Get the current hour, minute, and second
const currentHour = currentDate.getHours();
const currentMinute = currentDate.getMinutes();
const currentSecond = currentDate.getSeconds();

const newsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft',
    },

    description: {
        type: String,
        required: true,
    },

    imageUrl: {
        type: String,
        required: true,
    },

    createdAt: {
        type: String,
        default: `${currentYear}-${currentMonth}-${currentDay} ${currentHour}:${currentMinute}:${currentSecond}`,
    },

    role: {
        type: Boolean,
        default: false,
    }
});

const News = mongoose.model('News', newsSchema);

module.exports = News;
