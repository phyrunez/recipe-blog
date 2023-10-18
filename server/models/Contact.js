const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: 'This field is required'
    },
    email: {
        type: String,
        required: 'This field is required'
    },
    message: {
        type: String,
        required: 'This field is required'
    }
});

module.exports = mongoose.model('Contact', contactSchema)