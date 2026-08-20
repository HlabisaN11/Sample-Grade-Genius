const studentList =
    document.getElementById("studentList");

const messagesContainer =
    document.getElementById("messages");

const chatHeader =
    document.getElementById("chatHeader");

const messageForm =
    document.getElementById("messageForm");

const messageInput =
    document.getElementById("messageInput");


let selectedStudent = null;

let conversationId = null;


// =====================================
// TEMPORARY TEACHER ID
// =====================================

// This matches the test teacher we created.

const teacherId = 1;


// =====================================
// LOAD STUDENTS
// =====================================

async function loadStudents() {

    try {

        const response =
            await fetch("/students");


        if (!response.ok) {

            throw new Error(
                "Failed to load students"
            );

        }


        const students =
            await response.json();


        displayStudents(students);


    } catch (error) {

        console.error(error);

        studentList.innerHTML = `

            <p class="error-message">
                Unable to load learners.
            </p>

        `;

    }

}


// =====================================
// DISPLAY STUDENTS
// =====================================

function displayStudents(students) {

    studentList.innerHTML = "";


    if (students.length === 0) {

        studentList.innerHTML = `

            <p>
                No learners available.
            </p>

        `;

        return;

    }


    students.forEach(student => {

        const studentButton =
            document.createElement("button");


        studentButton.className =
            "teacher-item";


        studentButton.innerHTML = `

            <strong>

                ${student.first_name}
                ${student.last_name}

            </strong>

            <span>

                ${student.email}

            </span>

        `;


        studentButton.addEventListener(
            "click",
            () => {

                selectStudent(student);

            }
        );


        studentList.appendChild(
            studentButton
        );

    });

}


// =====================================
// SELECT STUDENT
// =====================================

async function selectStudent(student) {

    selectedStudent =
        student;


    chatHeader.innerHTML = `

        <h2>

            ${student.first_name}
            ${student.last_name}

        </h2>

        <p>

            ${student.email}

        </p>

    `;


    try {

        const response =
            await fetch(
                "/conversations",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            student_id:
                                student.student_id,

                            teacher_id:
                                teacherId

                        })

                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.error
            );

        }


        conversationId =
            result.conversation_id;


        messageInput.disabled =
            false;


        messageForm
            .querySelector("button")
            .disabled = false;


        await loadMessages();


        // Mark messages as read

        await markMessagesRead();


        messageInput.focus();


    } catch (error) {

        console.error(error);

        messagesContainer.innerHTML = `

            <p class="error-message">

                Unable to open conversation.

            </p>

        `;

    }

}


// =====================================
// LOAD MESSAGES
// =====================================

async function loadMessages() {

    if (!conversationId) {

        return;

    }


    try {

        const response =
            await fetch(
                `/conversations/${conversationId}/messages`
            );


        const messages =
            await response.json();


        displayMessages(messages);


    } catch (error) {

        console.error(error);

    }

}


// =====================================
// DISPLAY MESSAGES
// =====================================

function displayMessages(messages) {

    messagesContainer.innerHTML = "";


    if (messages.length === 0) {

        messagesContainer.innerHTML = `

            <div class="empty-chat">

                <div class="empty-chat-icon">
                    💬
                </div>

                <h3>
                    No messages yet
                </h3>

                <p>
                    Send a message to start the conversation.
                </p>

            </div>

        `;

        return;

    }


    messages.forEach(message => {

        const messageElement =
            document.createElement("div");


        messageElement.className =
            message.sender_type === "teacher"
                ? "message student-message"
                : "message teacher-message";


        messageElement.innerHTML = `

            <div class="message-bubble">

                <p>
                    ${escapeHtml(
                        message.message_text
                    )}
                </p>

                <small>

                    ${formatDate(
                        message.created_at
                    )}

                </small>

            </div>

        `;


        messagesContainer.appendChild(
            messageElement
        );

    });


    messagesContainer.scrollTop =
        messagesContainer.scrollHeight;

}


// =====================================
// SEND TEACHER REPLY
// =====================================

messageForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const text =
            messageInput.value.trim();


        if (!text || !conversationId) {

            return;

        }


        try {

            const response =
                await fetch(
                    `/conversations/${conversationId}/messages`,
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify({

                                sender_type:
                                    "teacher",

                                message_text:
                                    text

                            })

                        }
                );


            const result =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    result.error
                );

            }


            messageInput.value = "";


            await loadMessages();


        } catch (error) {

            console.error(error);

            alert(
                "Unable to send reply."
            );

        }

    }
);


// =====================================
// MARK MESSAGES AS READ
// =====================================

async function markMessagesRead() {

    if (!conversationId) {

        return;

    }


    try {

        await fetch(
            `/conversations/${conversationId}/read`,
            {
                method: "PUT"
            }
        );

    } catch (error) {

        console.error(error);

    }

}


// =====================================
// FORMAT DATE
// =====================================

function formatDate(date) {

    return new Date(date)
        .toLocaleString();

}


// =====================================
// SECURITY
// =====================================

function escapeHtml(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;

}


// =====================================
// START
// =====================================

loadStudents();