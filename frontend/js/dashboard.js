async function loadDashboard() {

    const table =
        document.getElementById(
            "dashboardStudents"
        );

    const count =
        document.getElementById(
            "studentCount"
        );


    try {

        const response =
            await fetch("/students");


        if (!response.ok) {

            throw new Error(
                "Could not load students."
            );

        }


        const students =
            await response.json();


        count.textContent =
            students.length;


        table.innerHTML = "";


        students.slice(0, 5).forEach(student => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>${student.student_id}</td>

                <td>${student.first_name}</td>

                <td>${student.last_name}</td>

                <td>${student.email}</td>

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

                <td colspan="5">
                    Unable to load students.
                </td>

            </tr>

        `;

    }

}


loadDashboard();