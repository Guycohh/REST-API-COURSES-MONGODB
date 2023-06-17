const fs = require("fs");
const path = require("path");
const validUrl = require("valid-url");
const isNumber = require("@stdlib/number-ctor");
const moment = require("moment");
const exp = require("constants");
const Course = require("../db/models/courses")
const Student = require("../db/models/students");

//Check if the date is valid.
function validateDate(dateString) {
  return moment(dateString, "DD-MM-YYYY", true).isValid();
}

// Function to check if student already exists in the course
function isStudentExists(course, studentId) {
  return course.students && course.students[studentId];
}

// Function to validate the picture URL
function validatePictureURL(picture) {
  return validUrl.isWebUri(picture);
}

// Function to validate the grade
function validateGrade(grade) {
  const numericGrade = Number(grade);
  return !isNaN(numericGrade) && numericGrade >= 0 && numericGrade <= 100;
}

//export
module.exports = {

  // NEW getting all students
  getStudents: function (req, res) {
    Student.find({}, (error, students) => {
      if (error) {
        res.status(500).send(error);
      } else {
        res.status(200).send(students);
      }
    });
  },

  //NEW getCourses
  getCourses: function (req, res) {
    Course.find({}, (error, media) => {
      if (error)
        res.status(500).send(error);
      else
        res.status(200).send(media);
    });
  },


  // NEW CreateCourse
  CreateCourse: function (req, res) {
    const newCourse = new Course(req.body);

    // Check if the course already exists
    Course.findOne({ id: newCourse.id }, function (err, existingCourse) {
      if (err) {
        console.error(err);
        return res.status(500).send("Internal server error");
      }

      if (existingCourse) {
        return res.status(409).send("Course already exists");
    }

      // Save the new course
      newCourse
        .save()
        .then(() => res.status(200).send("Added course"))
        .catch((error) => {
          console.error(error);
          res.status(500).send("Failed to add course");
        });
    });
  },

  // NEW getCourse
  getCourse: function (req, res) {
    const courseId = req.params.courseID; // Extract the course ID from the URL parameter

    Course.findOne({ _id: courseId }, (error, course) => {
      if (error) {
        return res.send(error);
      } else if (!course) {
        return res.status(404).send("Course not found");
      } else {
        return res.status(200).send(course);
      }
    });
  },


  //NEW deleteCourse- delete by courseID
  deleteCourse: function (req, res) {


    Course.deleteOne({ id: req.params.courseID }).then(() => res.status(200).send("media was deleted"))
      .catch(() => res.status(400).send("media not found"));
  },

  //NEW AddStudentToCourse
  AddStudentToCourse: function (req, res) {
    const courseId = req.params.courseID; // Extract the course ID from the URL parameter

    Course.findOne({ _id: courseId }, (error, course) => {
      if (error) {
        return res.send(error);
      } else if (!course) {
        return res.status(404).send("Course not found");
      } else {
        // The course exists, so let's add the student to the course
        const student = new Student({
          id: req.body.id,
          firstname: req.body.firstname,
          surname: req.body.surname,
          picture: req.body.picture,
          grade: req.body.grade,
        });

        if (!student.id || !student.firstname || !student.surname || !student.picture || !student.grade) {
          return res.status(400).send("One of the student fields is missing!");
        }

        if (isStudentExists(course, student.id)) {
          return res.status(400).send("The student already exists in that course!");
        }

        if (!validatePictureURL(student.picture)) {
          return res.status(400).send("The URL is not in the specified format");
        }

        if (!validateGrade(student.grade)) {
          return res.status(400).send("The grade is not a valid number between 0 and 100");
        }

        // Check if the student already exists in another course
        if (course.students && course.students.some(s => s.toString() === student.id)) {
          return res.status(400).send("The student already exists in another course");
        }

        // Check if the student already exists in the students collection
        Student.findOne({ id: student.id }, (error, existingStudent) => {
          if (error) {
            return res.send(error);
          }

          if (existingStudent) {
            // The student already exists, check if the student is already in the course
            if (course.students && course.students.some(s => s.toString() === existingStudent._id.toString())) {
              return res.status(400).send("The student already exists in that course!");
            }

            // Add the existing student to the course's students array
            course.students = course.students || [];
            course.students.push(existingStudent._id);

            // Save the updated course
            course.save((error) => {
              if (error) {
                return res.send(error);
              }
              res.status(200).send(`Student with student ID: ${student.id} added to course with course ID: ${courseId}`);
            });
          } else {
            // The student does not exist, save the student document in the students collection
            student.save((error) => {
              if (error) {
                return res.send(error);
              }

              // Add the student to the course's students array
              course.students = course.students || [];
              course.students.push(student._id);

              // Save the updated course
              course.save((error) => {
                if (error) {
                  return res.send(error);
                }
                res.status(200).send(`Student with student ID: ${student.id} added to course with course ID: ${courseId}`);
              });
            });
          }
        });
      }
    });
  },




  //NEW deleteStudentFromCourse
  deleteStudentFromCourse: function (req, res) {
    const courseId = req.params.courseID; // Extract the course ID from the URL parameter
    const studentId = req.params.studentID; // Extract the student ID from the URL parameter

    Course.findOne({ _id: courseId }, (error, course) => {
      if (error)
        return res.send(error);
      else if (!course) //Course does not exist
        return res.status(404).send("Course not found");
      else {//Course exists so lets find the student...
        const studentIndex = course.students.findIndex(student => student._id && student._id.toString() === studentId);
        if (studentIndex === -1) {
          return res.status(404).send("Student is not enrolled in the course");
        } else {
          course.students.splice(studentIndex, 1); // Remove the student from the array
          course.save((error) => {
            if (error) {
              return res.send(error);
            }
            res.status(200).send(`Student with student _id: ${studentId} removed from course with course _id: ${courseId}`);
          });
        }
      }
    });
  }
  ,

// Assuming you have the necessary imports and middleware configured

  // NEW updateCourse
  updateCourse: function (req, res) {
    const updates = req.body; // Extract the updates from the request body

    // Validate the date format if needed
    if (!validateDate(updates.start_date) || !validateDate(updates.end_date)) {
      return res.status(400).send("The date is not in the specified format");
    }

    const { start_date, ...otherUpdates } = updates;

    Course.updateOne(
      { id: req.params.courseID },
      {
        $set: {
          start_date: start_date,
          ...otherUpdates,
        },
      }
    )
      .then(() => res.status(200).send("Updated course"))
      .catch((error) => res.status(404).send(error));
  },




  //NEW-> helper function getting a student
  getStudent: function (req, res) {
    const studentId = req.params.studentID
    Student.findOne({ _id: studentId }, (error, student) => {
      if (error) {
        res.send(error);
      }
      else if (!studentId) {
        res.status(404).send("studentId not found");
      }
      else {
        res.status(200).send(student);
      }
    });
  },


};
