const db = require('mongoose')

// Set 'strictQuery' option to false to prepare for the upcoming change in Mongoose 7
db.set('strictQuery', false);

db.connect('mongodb://localhost:27017/manageCourses', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log("successfully connected!")
    }
})