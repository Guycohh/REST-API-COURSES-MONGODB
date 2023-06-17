const db = require('mongoose')

// Define the student schema
const scheme = db.Schema({
    id: {
        type: String,
        required: true
    },
    firstname: {
        type: String,
        required: true
    },
    surname: {
        type: String,
        required: true
    },
    picture: {
        type: String,
        required: true,
        trim: true
    },
    grade: {
        type: String,
        required: true,
        trim: true
    }
});

// Check if the model already exists before creating it
const Student = db.model('Student', scheme);

module.exports = Student;
