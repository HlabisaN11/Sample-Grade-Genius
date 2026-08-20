async function loadStudents() {

    const table =
        document.getElementById(
            "studentsTable"
        );


    try {

        const response =
            await fetch("/students");


        const students =
            await response.json();


        table.innerHTML = "";


        students.forEach(student => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${student.student_id}
                </td>

                <td>
                    ${student.first_name}
                </td>

                <td>
                    ${student.last_name}
                </td>

                <td>
                    ${student.email}
                </td>

                <td>
                    ${student.phone || "-"}
                </td>

                <td>
                    <span class="status-badge">
                        Active
                    </span>
                </td>

            `;


            table.appendChild(row);

        });


    } catch (error) {

        console.error(error);

        table.innerHTML = `

            <tr>

                <td colspan="6">
                    Failed to load students.
                </td>

            </tr>

        `;

    }

}


function showAddStudent() {

    const form =
        document.getElementById(
            "studentForm"
        );


    form.style.display =
        form.style.display === "none"
            ? "block"
            : "none";

}


const addStudentForm =
    document.getElementById(
        "addStudentForm"
    );


addStudentForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const student = {

            first_name:
                document.getElementById(
                    "first_name"
                ).value,

            last_name:
                document.getElementById(
                    "last_name"
                ).value,

            email:
                document.getElementById(
                    "email"
                ).value,

            phone:
                document.getElementById(
                    "phone"
                ).value,

            date_of_birth:
                document.getElementById(
                    "date_of_birth"
                ).value

        };


        try {

            const response =
                await fetch(
                    "/students",
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify(student)

                    }
                );


            const result =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    result.error ||
                    "Failed to add student."
                );

            }


            alert(
                "Student added successfully!"
            );


            addStudentForm.reset();

            showAddStudent();

            loadStudents();


        } catch (error) {

            alert(error.message);

        }

    }
);


loadStudents();