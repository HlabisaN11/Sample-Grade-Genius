// =====================================
// Get HTML Elements
// =====================================

const studentForm = document.getElementById("studentForm");
const studentTable = document.getElementById("studentTable");
const totalStudents = document.getElementById("totalStudents");
const message = document.getElementById("message");
const searchInput = document.getElementById("searchInput");


// Store students
let students = [];


// =====================================
// Load Students
// =====================================

async function loadStudents() {

    try {

        const response = await fetch("/students");

        if (!response.ok) {
            throw new Error("Failed to fetch students");
        }

        students = await response.json();

        displayStudents(students);

        totalStudents.textContent = students.length;

    } catch (error) {

        console.error("Error:", error);

        studentTable.innerHTML = `
            <tr>
                <td colspan="7">
                    Unable to load students.
                </td>
            </tr>
        `;

    }
}


// =====================================
// Display Students
// =====================================

function displayStudents(studentList) {

    studentTable.innerHTML = "";

    if (studentList.length === 0) {

        studentTable.innerHTML = `
            <tr>
                <td colspan="7">
                    No students found.
                </td>
            </tr>
        `;

        return;
    }


    studentList.forEach(student => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${student.student_id}</td>

            <td>${student.first_name}</td>

            <td>${student.last_name}</td>

            <td>${student.email}</td>

            <td>${student.phone || "-"}</td>

            <td>${student.date_of_birth || "-"}</td>

            <td>

                <button
                    onclick="editStudent(${student.student_id})">
                    Edit
                </button>

                <button
                    onclick="deleteStudent(${student.student_id})">
                    Delete
                </button>

            </td>
        `;

        studentTable.appendChild(row);

    });

}


// =====================================
// Add Student
// =====================================

studentForm.addEventListener("submit", async function(event) {

    event.preventDefault();


    const student = {

        first_name:
            document.getElementById("first_name").value.trim(),

        last_name:
            document.getElementById("last_name").value.trim(),

        email:
            document.getElementById("email").value.trim(),

        phone:
            document.getElementById("phone").value.trim(),

        date_of_birth:
            document.getElementById("date_of_birth").value

    };


    try {

        const response = await fetch("/students", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(student)

        });


        const result = await response.json();


        if (!response.ok) {

            throw new Error(
                result.error || "Failed to add student"
            );

        }


        message.textContent =
            "Student added successfully!";


        studentForm.reset();


        // Reload students
        loadStudents();


    } catch (error) {

        console.error("Error:", error);

        message.textContent =
            error.message;

    }

});


// =====================================
// Search Students
// =====================================

searchInput.addEventListener("input", function() {

    const searchTerm =
        searchInput.value.toLowerCase();


    const filteredStudents = students.filter(student => {

        return (

            student.first_name
                .toLowerCase()
                .includes(searchTerm)

            ||

            student.last_name
                .toLowerCase()
                .includes(searchTerm)

            ||

            student.email
                .toLowerCase()
                .includes(searchTerm)

            ||

            String(student.student_id)
                .includes(searchTerm)

        );

    });


    displayStudents(filteredStudents);

});


// =====================================
// Edit Student
// =====================================

function editStudent(id) {

    const student =
        students.find(
            student => student.student_id === id
        );


    if (!student) {
        return;
    }


    document.getElementById("first_name").value =
        student.first_name;

    document.getElementById("last_name").value =
        student.last_name;

    document.getElementById("email").value =
        student.email;

    document.getElementById("phone").value =
        student.phone || "";

    document.getElementById("date_of_birth").value =
        student.date_of_birth || "";


    document.getElementById("add-student")
        .scrollIntoView({
            behavior: "smooth"
        });

}


// =====================================
// Delete Student
// =====================================

function deleteStudent(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this student?"
    );


    if (!confirmed) {
        return;
    }


    alert(
        "Delete functionality will be connected to the backend next."
    );

}


// =====================================
// Start Application
// =====================================

loadStudents();