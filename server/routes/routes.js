const express = require("express");
const listRoute = require("./courses");
const path = require("path");

const router = express.Router();

// Serve the index.html file
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../client/html/index.html"));
});

// Define routes for handling CRUD operations on courses
router.post("/courses/createCourse", listRoute.CreateCourse);
router.put("/courses/update/:courseID", listRoute.updateCourse);
router.post("/courses/:courseID/addStudent", listRoute.AddStudentToCourse);
router.get("/courses/:courseID", listRoute.getCourse);
router.get("/students", listRoute.getStudents);
router.get("/students/:studentID", listRoute.getStudent);
router.get("/courses", listRoute.getCourses);
router.delete(
  "/courses/:courseID/:studentID",
  listRoute.deleteStudentFromCourse
);
router.delete("/courses/:courseID/", listRoute.deleteCourse);

module.exports = router;
