$(document).ready(function () {
  // Function to fetch and display the list of courses
  function fetchCourses() {
    $.ajax({
      url: "http://localhost:3001/courses", // Replace with the correct server endpoint
      cache: false, // Disable caching

      success: function (result) {
        let courseList = $("#courseData");

        // Clear the existing course list
        courseList.empty();

        $(".add_course_button").on("click", function () {
          $("#studentListContainer").remove();
          $(".editForm").remove();
          $(".add_student_to_course_class").remove();
          $(".add_course_class").remove();
          addCourse();
        });

        // Iterate over the courses and add rows to the table
        $.each(result, function (courseId, course) {
          let row = $("<tr></tr>");

          // Add the course details as table cells
          row.append("<td>" + course.id + "</td>");
          row.append("<td>" + course.name + "</td>");
          row.append("<td>" + course.lecturer + "</td>");
          row.append("<td>" + course.start_date + "</td>");
          row.append("<td>" + course.end_date + "</td>");

          // Add the prerequisite courses as a list
          let prerequisites = "<ul>";
          $.each(course.prerequisite_course, function (index, prereq) {
            prerequisites += "<li>" + prereq + "</li>";
          });
          prerequisites += "</ul>";
          row.append("<td>" + prerequisites + "</td>");

          // Add buttons for actions
          let actions = $("<td></td>");

          let deleteButton = $(
            '<button class="delete_button">Delete</button>'
          ).click(function () {
            // console.log("Delete button clicked for Course ID: " + courseId);
            deleteCourse(course.id);

          });

          let editButton = $('<button class="edit_button">Edit</button>').click(
            function () {
              // Handle edit functionality
              // Replace with your own logic
              $("#studentListContainer").remove();
              $(".editForm").remove();
              $(".add_student_to_course_class").remove();
              $(".add_course_class").remove();

              edit_course_details(course, course.id);
            }
          );

          let addStudentButton = $(
            '<button class="add_student_button">Add Student</button>'
          ).click(function () {
            $("#studentListContainer").remove();
            $(".editForm").remove();
            $(".add_student_to_course_class").remove();
            $(".add_course_class").remove();

            add_student_to_course(course, courseId);
          });

          let viewStudentsButton = $(
            '<button class="view_student_button">View Students</button>'
          ).click(function () {
            // Hide other open student lists
            $("#studentListContainer").remove();
            $(".editForm").remove();
            $(".add_student_to_course_class").remove();
            $(".add_course_class").remove();

            viewStudentsList(course, courseId);
          });

          actions.append(
            deleteButton,
            editButton,
            addStudentButton,
            viewStudentsButton
          );
          row.append(actions);

          // Add the row to the course list
          courseList.append(row);
        });
      },
      error: function (err) {
        console.log("Error fetching courses:", err);
      },
    });
  }


  function addCourse() {
    let form = $("<form class='add_course_class'> <h2>Add Course:</h2></form>");

    // Create input fields for the course details
    let input = $(
      '<div class="form-row">' +
      '<label class="label_form_class" for="CourseID">Course ID:</label>' +
      '<input type="text" name="id" value="" placeholder="course id" required>' +
      "</div>" +
      '<div class="form-row">' +
      '<label class="label_form_class" for="CourseName">Course Name:</label>' +
      '<input type="text" name="CourseName" value="" placeholder="name of the course" required>' +
      "</div>" +
      '<div class="form-row">' +
      '<label class="label_form_class" for="LecturersName">Lecturers Name:</label>' +
      '<input type="text" name="LecturersName" placeholder="lecturer name"required>' +
      "</div>" +
      '<div class="form-row">' +
      '<label class="label_form_class" for="StartDate">Start Date:</label>' +
      '<input type="date" name="StartDate" required>' +
      "</div>" +
      '<div class="form-row">' +
      '<label class="label_form_class" for="EndDate">End Date:</label>' +
      '<input type="date" name="EndDate" value="" required>' +
      "</div>" +
      '<div class="form-row">' +
      '<label class="label_form_class" for="prerequisite_course">Prerequisite Courses:</label>' +
      '<input type="text" name="prerequisite_course" placeholder="prerequisite courses" value="">' +
      "</div>" +
      '<div class="form-row" style="display: none;">' +
      '<label class="label_form_class" for="students">Students:</label>' +
      '<input type="text" name="students" value="">' + // Initialize value as an empty string
      "</div>"
    );

    // Create a submit button
    let submitButton = $('<button type="submit">Save</button>');
    form.append(input);
    form.append(submitButton);

    // Append the form to the page
    $("#courseTable").after(form);

    // Handle the form submission
    form.submit(function (event) {
      event.preventDefault();

      // Get the course data from the form
      let courseId = form.find('input[name="id"]').val();

      if (!isAlphaNumeric(courseId)) {
        alert("Please enter a valid course identifier");
        return;
      }

      let courseName = form.find('input[name="CourseName"]').val();
      let lecturersName = form.find('input[name="LecturersName"]').val();
      let startDate = form.find('input[name="StartDate"]').val();
      let endDate = form.find('input[name="EndDate"]').val();

      let prerequisiteCourses = form
        .find('input[name="prerequisite_course"]')
        .val();

      // Create a course object
      let courseData = {
        id: courseId,
        name: courseName,
        lecturer: lecturersName,
        start_date: startDate,
        end_date: endDate,
        prerequisite_course: prerequisiteCourses.split(",").map((course) => course.trim()),
        students: [],
      };


      // Make an AJAX request to add the course
      $.ajax({
        url: "http://localhost:3001/courses/createCourse",
        method: "POST",
        data: JSON.stringify(courseData),
        contentType: "application/json",
        cache: false, // Disable caching

        success: function (data) {
          console.log("The course was added successfully!");

          // Refresh the page or fetch the updated course list
          fetchCourses();
        },
        error: function (xhr, status, error) {
          let errorMessage = xhr.responseText ? xhr.responseText : "Failed to add course";
          alert(errorMessage);
          console.log("Error with add course:", error);
          // Handle the error or display an appropriate error message
        },
      });

      // Remove the form from the page
      form.remove();
    });
  }

  function deleteCourse(courseId) {
    $.ajax({
      url: "http://localhost:3001/courses/" + courseId,
      method: "DELETE",
      cache: false, // Disable caching

      success: function (data) {
        console.log("Course deleted successfully!");
        location.reload(); // Refresh the page
      },
      error: function (err) {
        console.log("Error deleting course:", err);
      },
    });
  }


  function viewStudentsList(course, courseId) {
    let studentIds = course.students.map(studentRef => studentRef.toString()); // Convert ObjectId references to strings

    // Make an AJAX request to fetch the students from the students collection
    $.ajax({
      url: "http://localhost:3001/students",
      method: "GET",
      success: function (students) {
        let studentList = ""; // Define studentList variable

        // Iterate over the students and generate HTML for each student
        students.forEach(student => {
          if (studentIds.includes(student._id)) {
            studentList += `
              <div class="studentDetails">
                <h2>Student ID:</h2>
                <span>${student.id}</span></br>
                <h2>First Name:</h2>
                <span>${student.firstname}</span></br>
                <h2>Surname:</h2>
                <span>${student.surname}</span></br>
                <h2>Picture:</h2>
                <span>${student.picture}</span></br>
                <h2>Grade:</h2>
                <span>${student.grade}</span></br>
                <button class="delete-student" data-course="${courseId}" data-student="${student._id}">Delete</button>
              </div>
            `;
          }
        });

        // Create a container for the student list
        let studentContainer = $("<div id='studentListContainer'></div>");

        // Set the student list HTML content
        studentContainer.html(studentList);

        // Display the student list on the screen
        $("#courseTable").after(studentContainer);

        // Attach event listener to delete button
        $(".delete-student").on("click", function () {
          let courseId = $(this).data("course");
          let studentId = $(this).data("student");
          console.log(course._id)
          deleteStudentFromCourse(course, studentId);
        });
      },
      error: function (err) {
        console.log("Error fetching students:", err);
        // Handle the error response
      },
    });
  }


  function edit_course_details(course, courseId) {
    // Create a form element
    let form = $("<form class='editForm'><h2>Edit Course Details:</h2></form>");

    // Create input fields for the course details
    let input = $(
      '<label class="label_form_class" for="courseName">Name:</label>' +
        '<input type="text" name="courseName" value="' +
        course.name +
        '" required> ' +
        '<label class="label_form_class" for="courseName">Lecturer Name</label>' +
        '<input type="text" name="lecturer" value="' +
        course.lecturer +
        '" required>' +
        '<label class="label_form_class" for="courseName">Start Date	:</label>' +
        '<input type="date" name="start_date" required>' +
        '<label class="label_form_class" for="courseName">End Date	:</label>' +
        '<input type="date" name="end_date" required>' +
        '<label class="label_form_class" for="courseName">Prerequisite Courses	:</label>' +
        '<input type="text" name="prerequisites" value="' +
        course.prerequisite_course.join(", ") +
        '">'
    );
    form.append(input);

    // Create a submit button
    let submitButton = $('<button type="submit">Save</button>');
    form.append(submitButton);

    // Append the form to the page
    $("#courseTable").after(form);

    // Handle the form submission
    form.submit(function (event) {
      event.preventDefault();

      // Get the updated course details from the input fields
      let updatedName = form.find('input[name="courseName"]').val();
      let updatedLecturer = form.find('input[name="lecturer"]').val();
      let updatedStartDate = reverseDate(
        form.find('input[name="start_date"]').val()
      );
      let updatedEndDate = reverseDate(
        form.find('input[name="end_date"]').val()
      );
      if (reverseDate(updatedStartDate) > reverseDate(updatedEndDate)) {
        alert("The start date must be greater than the end date");
        return;
      }

      let updatedPrerequisites = form
        .find('input[name="prerequisites"]')
        .val()
        .split(", ");

      // Update the course object
      course.name = updatedName;
      course.lecturer = updatedLecturer;
      course.start_date = updatedStartDate;
      course.end_date = updatedEndDate;
      course.prerequisite_course = updatedPrerequisites;

      // Remove the students field from the course object
      delete course.students;

      // Make an AJAX request to update the course details
      $.ajax({
        url: "http://localhost:3001/courses/update/" + course.id,
        method: "PUT",
        data: course,
        cache: false, // Disable caching

        success: function (data) {
          console.log("Course details updated successfully!");

          // Refresh the page
          fetchCourses();
        },
        error: function (err) {
          console.log("Error updating course details:", err);
          // Handle the error response
        },
      });

      // Remove the form from the page
      form.remove();
    });
  }
  fetchCourses()

  // function add_student_to_course(course, courseId) {
  //   // Create a form element
  //   let form = $(
  //     "<form class='add_student_to_course_class'> <h2>Add Student To This Course:</h2></form>"
  //   );

  //   // Create input fields for the student details
  //   let input = $(
  //     '<div class="form-row">' +
  //       '<label class="label_form_class" for="id">id:</label>' +
  //       '<input type="text" name="id" required placeholder="id">' +
  //       "</div>" +
  //       '<div class="form-row">' +
  //       '<label class="label_form_class" for="firstname">firstname:</label>' +
  //       '<input type="text" name="firstname" required placeholder="first name">' +
  //       "</div>" +
  //       '<div class="form-row">' +
  //       '<label class="label_form_class" for="surname">surname:</label>' +
  //       '<input type="text" name="surname" required placeholder="surename">' +
  //       "</div>" +
  //       '<div class="form-row">' +
  //       '<label class="label_form_class" for="picture">picture:</label>' +
  //       '<input type="text" name="picture" placeholder="url" required>' +
  //       "</div>" +
  //       '<div class="form-row">' +
  //       '<label class="label_form_class" for="grade">grade:</label>' +
  //       '<input type="text" name="grade" value="" placeholder="grade" required>' +
  //       "</div>"
  //   );

  //   // Create a submit button
  //   let submitButton = $('<button type="submit">Save</button>');
  //   form.append(input);
  //   form.append(submitButton);

  //   // Append the form to the page
  //   $("#courseTable").after(form);

  //   // Handle the form submission
  //   form.submit(function (event) {
  //     event.preventDefault();

  //     // Get the student details from the input fields
  //     let studentId = form.find('input[name="id"]').val();
  //     if (!isAlphaNumeric(studentId)) {
  //       alert("Please enter a valid student identifier");
  //       return;
  //     }
  //     let studentFirstName = form.find('input[name="firstname"]').val();
  //     let studentSurname = form.find('input[name="surname"]').val();
  //     let studentPicture = form.find('input[name="picture"]').val();
  //     let studentGrade = form.find('input[name="grade"]').val();

  //     const isUrlCorrect = isValidURL(studentPicture);
  //     if (!isUrlCorrect) {
  //       alert("Please enter a valid URL");
  //       return;
  //     }

  //     if (!isValidGrade(studentGrade)) {
  //       alert("Please enter a valid number");
  //       return;
  //     }

  //     // Create a new student object
  //     let newStudent = {
  //       id: studentId,
  //       firstname: studentFirstName,
  //       surname: studentSurname,
  //       picture: studentPicture,
  //       grade: studentGrade,
  //     };

  //     // Make an AJAX request to add the student to the course
  //     $.ajax({
  //       url: "http://localhost:3001/courses/" + course._id + "/addStudent",
  //       method: "POST",
  //       data: JSON.stringify(newStudent),
  //       contentType: "application/json",
  //       cache: false, // Disable caching

  //       success: function (data) {
  //         alert("Student added to course successfully!");

  //         // Refresh the page or update the student list
  //         fetchCourses();
  //       },
  //       error: function (err) {
  //         console.log("Error adding student to course:", err);
  //         // Handle the error response
  //       },
  //     });
  //   });
  // }

  function add_student_to_course(course, courseId) {
    // Create a form element
    let form = $(
      "<form class='add_student_to_course_class'> <h2>Add Student To This Course:</h2></form>"
    );

    // Create a select dropdown for existing students
    let selectDropdown = $(
      '<div class="form-row">' +
      '<label class="label_form_class" for="student">Student:</label>' +
      '<select name="student"><option value="">Select Existing Student</option></select>' +
      '</div>'
    );

    // Create a form for new student details
    let newStudentForm = $(
      '<div id="newStudentForm" style="display: none;">' +
      '<div class="form-row">' +
      '<label class="label_form_class" for="id">id:</label>' +
      '<input type="text" name="id" required placeholder="id">' +
      '</div>' +
      '<div class="form-row">' +
      '<label class="label_form_class" for="firstname">firstname:</label>' +
      '<input type="text" name="firstname" required placeholder="first name">' +
      '</div>' +
      '<div class="form-row">' +
      '<label class="label_form_class" for="surname">surname:</label>' +
      '<input type="text" name="surname" required placeholder="surname">' +
      '</div>' +
      '<div class="form-row">' +
      '<label class="label_form_class" for="picture">picture:</label>' +
      '<input type="text" name="picture" placeholder="url" required>' +
      '</div>' +
      '<div class="form-row">' +
      '<label class="label_form_class" for="grade">grade:</label>' +
      '<input type="text" name="grade" value="" placeholder="grade" required>' +
      '</div>' +
      '</div>'
    );

    // Create a radio button for choosing between existing or new student
    let radioInput = $(
      '<div class="form-row">' +
      '<input type="radio" name="studentType" value="existing" checked>' +
      '<label class="label_form_class">Existing Student</label>' +
      '<input type="radio" name="studentType" value="new">' +
      '<label class="label_form_class">New Student</label>' +
      '</div>'
    );

    // Create a submit button
    let submitButton = $('<button type="submit">Save</button>');
    form.append(radioInput);
    form.append(selectDropdown);
    form.append(newStudentForm);
    form.append(submitButton);

    // Append the form to the page
    $("#courseTable").after(form);

    // Fetch students from the student collection and populate the select dropdown
    fetchStudents();

    let studentObjectID = ""
    // Fetch students from the student collection
    function fetchStudents() {
      $.ajax({
        url: "http://localhost:3001/students",
        method: "GET",
        success: function (students) {
          let studentSelect = form.find('select[name="student"]');
          students.forEach(function (student) {
            let option = $("<option>")
              .val(student.id)
              .text(student._id); // Use the desired text format for the students
            studentSelect.append(option);
          });
        },
        error: function (err) {
          console.log("Error fetching students:", err);
          // Handle the error response
        },
      });
    }

    let selectedValue = "existing";
    // Handle the radio button change event
    form.on("change", 'input[name="studentType"]', function () {
      selectedValue = $(this).val();

      if (selectedValue === "existing") {
        selectDropdown.show();
        newStudentForm.hide();
      } else {
        selectDropdown.hide();
        newStudentForm.show();
      }
    });

    // Handle the form submission
    submitButton.on("click", function (event) {
      event.preventDefault();

      if (selectedValue === "existing") {
        // Get the selected student ID from the select dropdown
        let selectedStudentText = form.find('select[name="student"] option:selected').text();
        let existingStudent = {};

        // Make an AJAX request to fetch the selected student from the server
        $.ajax({
          url: "http://localhost:3001/students/" + selectedStudentText,
          method: "GET",
          success: function (student) {
            existingStudent = student; // Store the fetched student object in the existingStudent variable
            // Make an AJAX request to add the new student to the course
            $.ajax({
              url: "http://localhost:3001/courses/" + course._id + "/addStudent",
              method: "POST",
              data: JSON.stringify(existingStudent),
              contentType: "application/json",
              cache: false, // Disable caching

              success: function (data) {
                alert("Student added to course successfully!");

                // Refresh the page or update the student list
                fetchCourses();
              },
              error: function (err) {
                console.log("Error adding student to course:", err);
                // Handle the error response
              },
            });
          },
          error: function (err) {
            console.log("Error fetching the selected student:", err);
            // Handle the error response
          },
        });
      }
      else {
        // Get the new student details from the input fields
        let studentId = form.find('input[name="id"]').val();
        let studentFirstName = form.find('input[name="firstname"]').val();
        let studentSurname = form.find('input[name="surname"]').val();
        let studentPicture = form.find('input[name="picture"]').val();
        let studentGrade = form.find('input[name="grade"]').val();


        // Validate the input fields
        if (!studentId || !studentFirstName || !studentSurname || !studentPicture || !studentGrade) {
          console.log("Please fill in all the required fields.");
          return; // Stop form submission if any required field is empty
        }
        if (!isValidURL(studentPicture)) {
          alert("Please enter a valid URL picture");
          return; // Stop form submission if any required field is empty

        }

        if (!isValidGrade(studentGrade)) {
          alert("Please enter a valid grade number");
          return; // Stop form submission if any required field is empty
        }


        // Create a new student object
        let newStudent = {
          id: studentId,
          firstname: studentFirstName,
          surname: studentSurname,
          picture: studentPicture,
          grade: studentGrade,
        };

        // Make an AJAX request to add the new student to the course
        $.ajax({
          url: "http://localhost:3001/courses/" + course._id + "/addStudent",
        method: "POST",
          data: JSON.stringify(newStudent),
          contentType: "application/json",
        cache: false, // Disable caching

        success: function (data) {
          alert("Student added to course successfully!");

          // Refresh the page or update the student list
          fetchCourses();
        },
        error: function (err) {
          console.log("Error adding student to course:", err);
          // Handle the error response
        },
        });
      }
    });
  }

  function deleteStudentFromCourse(course, studentId) {
    $.ajax({
      url: "/courses/" + course._id + "/" + studentId,
      method: "DELETE",
      success: function (data) {
        alert("Student deleted successfully!");
        // Refresh the page or update the student list
        location.reload();

      },
      error: function (err) {
        console.log("Error deleting course:", err);
      },
    });
  }


  //Helper functions
  function reverseDate(date) {
    // Split the date into its components
    let [year, month, day] = date.split("-");

    // Reverse the order of the components
    let reversedDate = [day, month, year].join("-");

    // Return the reversed date
    return reversedDate;
  }

  function isAlphaNumeric(input) {
    // Create a regular expression to match only letters and numbers
    let regex = /^[A-Za-z0-9]+$/;

    // Return true if the input matches the regular expression
    return regex.test(input);
  }

  function isValidURL(input) {
    const urlPattern = /^(ftp|http|https):\/\/[^ "]+$/;
    return urlPattern.test(input);
  }

  function isValidGrade(input) {
    const number = parseFloat(input);
    return !isNaN(number) && isFinite(number) && number >= 0 && number <= 100;
  }
});
