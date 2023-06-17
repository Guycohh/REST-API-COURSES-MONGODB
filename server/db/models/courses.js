const db = require('mongoose')

const courseSchema = db.Schema({
    id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    lecturer: {
        type: String,
        required: true
    },
    start_date: {
        type: String,
        required: true
    },
    end_date: {
        type: String,
        required: true
    },
    prerequisite_course: {
        type: [String]
    },
    students: [{
        type: db.Schema.Types.ObjectId,
        ref: 'Student'
    }]
});

const Course = db.model('Course', courseSchema);

module.exports = Course;
