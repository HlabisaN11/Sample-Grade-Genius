// ============================================================
// GRADE GENIUS - SERVER
// ============================================================

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const bcrypt = require("bcryptjs");

// Load environment variables
dotenv.config();

// Create Express application
const app = express();

const PORT = process.env.PORT || 3000;

// ============================================================
// MIDDLEWARE
// ============================================================

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================================
// FRONTEND
// ============================================================

// Your server.js is inside:
// student mangement/backend
//
// Your frontend is inside:
// student mangement/frontend

const frontendPath = path.join(__dirname, "../frontend");

// Serve HTML, CSS, JavaScript and other frontend files
app.use(express.static(frontendPath));

// Open the Grade Genius landing page when visiting:
// http://localhost:3000/

app.get("/", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
});

// ============================================================
// MYSQL CONNECTION
// ============================================================

const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "student_management",
    port: process.env.DB_PORT || 3306
});

db.connect((err) => {

    if (err) {

        console.error(
            "MySQL connection failed:",
            err.message
        );

        return;
    }

    console.log("Connected to MySQL successfully!");
});

// ============================================================
// TEST ROUTE
// ============================================================

app.get("/api/test", (req, res) => {

    res.json({
        success: true,
        message: "Grade Genius API is working."
    });

});

// ============================================================
// REGISTER
// ============================================================

app.post("/register", async (req, res) => {

    try {

        const {
            first_name,
            last_name,
            email,
            password,
            account_type
        } = req.body;

        // Validate fields
        if (
            !first_name ||
            !last_name ||
            !email ||
            !password ||
            !account_type
        ) {

            return res.status(400).json({
                success: false,
                message: "Please complete all required fields."
            });

        }

        // Check whether email already exists
        const checkSql = `
            SELECT user_id
            FROM users
            WHERE email = ?
        `;

        db.query(
            checkSql,
            [email],
            async (checkError, results) => {

                if (checkError) {

                    console.error(checkError);

                    return res.status(500).json({
                        success: false,
                        message: "Database error."
                    });

                }

                if (results.length > 0) {

                    return res.status(409).json({
                        success: false,
                        message: "An account with this email already exists."
                    });

                }

                // Encrypt password
                const hashedPassword =
                    await bcrypt.hash(password, 10);

                // Convert account type to role
                let role = "learner";

                if (
                    account_type.toLowerCase() === "teacher"
                ) {
                    role = "teacher";
                }

                // Insert user
                const sql = `
                    INSERT INTO users
                    (
                        first_name,
                        last_name,
                        email,
                        password,
                        role,
                        account_type
                    )
                    VALUES (?, ?, ?, ?, ?, ?)
                `;

                db.query(
                    sql,
                    [
                        first_name,
                        last_name,
                        email,
                        hashedPassword,
                        role,
                        account_type
                    ],
                    (error, result) => {

                        if (error) {

                            console.error(
                                "Registration error:",
                                error
                            );

                            return res.status(500).json({
                                success: false,
                                message: "Could not create your account.",
                                error: error.message
                            });

                        }

                        return res.status(201).json({

                            success: true,

                            message:
                                "Account created successfully.",

                            user: {
                                user_id: result.insertId,
                                first_name,
                                last_name,
                                email,
                                role,
                                account_type
                            }

                        });

                    }
                );

            }
        );

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                "An unexpected server error occurred."

        });

    }

});

// ============================================================
// LOGIN
// ============================================================

app.post("/login", (req, res) => {

    const {
        email,
        password
    } = req.body;

    if (!email || !password) {

        return res.status(400).json({

            success: false,

            message:
                "Email and password are required."

        });

    }

    const sql = `
        SELECT
            user_id,
            first_name,
            last_name,
            email,
            password,
            role,
            account_type,
            created_at
        FROM users
        WHERE email = ?
    `;

    db.query(
        sql,
        [email],
        async (error, results) => {

            if (error) {

                console.error(
                    "Login database error:",
                    error
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Database error."

                });

            }

            if (results.length === 0) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Invalid email or password."

                });

            }

            const user = results[0];

            // Compare password
            const passwordMatch =
                await bcrypt.compare(
                    password,
                    user.password
                );

            if (!passwordMatch) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Invalid email or password."

                });

            }

            // Don't send password to frontend
            delete user.password;

            res.json({

                success: true,

                message:
                    "Login successful.",

                user: user

            });

        }
    );

});

// ============================================================
// GET CURRENT USERS
// Useful for the chat system
// ============================================================

app.get("/users", (req, res) => {

    const sql = `
        SELECT
            user_id,
            first_name,
            last_name,
            email,
            role,
            account_type,
            created_at
        FROM users
        ORDER BY first_name ASC
    `;

    db.query(
        sql,
        (error, results) => {

            if (error) {

                console.error(error);

                return res.status(500).json({

                    success: false,

                    message:
                        "Could not retrieve users."

                });

            }

            res.json({

                success: true,

                users: results

            });

        }
    );

});

// ============================================================
// GET TEACHERS
// ============================================================

app.get("/teachers", (req, res) => {

    const sql = `
        SELECT
            user_id,
            first_name,
            last_name,
            email,
            role,
            account_type
        FROM users
        WHERE role = 'teacher'
        ORDER BY first_name ASC
    `;

    db.query(
        sql,
        (error, results) => {

            if (error) {

                console.error(error);

                return res.status(500).json({

                    success: false,

                    message:
                        "Could not retrieve teachers."

                });

            }

            res.json({

                success: true,

                teachers: results

            });

        }
    );

});

// ============================================================
// GET LEARNERS
// ============================================================

app.get("/learners", (req, res) => {

    const sql = `
        SELECT
            user_id,
            first_name,
            last_name,
            email,
            role,
            account_type
        FROM users
        WHERE role = 'learner'
        ORDER BY first_name ASC
    `;

    db.query(
        sql,
        (error, results) => {

            if (error) {

                console.error(error);

                return res.status(500).json({

                    success: false,

                    message:
                        "Could not retrieve learners."

                });

            }

            res.json({

                success: true,

                learners: results

            });

        }
    );

});

// ============================================================
// CREATE CONVERSATION
// ============================================================

app.post("/conversations", (req, res) => {

    const {
        user_one_id,
        user_two_id
    } = req.body;

    if (!user_one_id || !user_two_id) {

        return res.status(400).json({

            success: false,

            message:
                "Both users are required."

        });

    }

    if (
        Number(user_one_id) ===
        Number(user_two_id)
    ) {

        return res.status(400).json({

            success: false,

            message:
                "You cannot start a conversation with yourself."

        });

    }

    // Always store the lower ID first
    const firstUser =
        Math.min(
            Number(user_one_id),
            Number(user_two_id)
        );

    const secondUser =
        Math.max(
            Number(user_one_id),
            Number(user_two_id)
        );

    const checkSql = `
        SELECT conversation_id
        FROM conversations
        WHERE user_one_id = ?
        AND user_two_id = ?
    `;

    db.query(
        checkSql,
        [firstUser, secondUser],
        (checkError, results) => {

            if (checkError) {

                console.error(checkError);

                return res.status(500).json({

                    success: false,

                    message:
                        "Database error."

                });

            }

            // Conversation already exists
            if (results.length > 0) {

                return res.json({

                    success: true,

                    conversation_id:
                        results[0].conversation_id,

                    existing: true

                });

            }

            const insertSql = `
                INSERT INTO conversations
                (
                    user_one_id,
                    user_two_id
                )
                VALUES (?, ?)
            `;

            db.query(
                insertSql,
                [firstUser, secondUser],
                (insertError, result) => {

                    if (insertError) {

                        console.error(insertError);

                        return res.status(500).json({

                            success: false,

                            message:
                                "Could not create conversation."

                        });

                    }

                    res.status(201).json({

                        success: true,

                        conversation_id:
                            result.insertId,

                        existing: false

                    });

                }
            );

        }
    );

});

// ============================================================
// GET CONVERSATIONS FOR USER
// ============================================================

app.get(
    "/conversations/:userId",
    (req, res) => {

        const userId =
            req.params.userId;

        const sql = `

            SELECT
                c.conversation_id,

                CASE
                    WHEN c.user_one_id = ?
                    THEN c.user_two_id
                    ELSE c.user_one_id
                END AS other_user_id,

                u.first_name,
                u.last_name,
                u.email,
                u.role,
                u.account_type,

                (
                    SELECT message
                    FROM messages m
                    WHERE m.conversation_id =
                        c.conversation_id
                    ORDER BY m.created_at DESC
                    LIMIT 1
                ) AS last_message,

                (
                    SELECT created_at
                    FROM messages m
                    WHERE m.conversation_id =
                        c.conversation_id
                    ORDER BY m.created_at DESC
                    LIMIT 1
                ) AS last_message_time

            FROM conversations c

            JOIN users u
                ON u.user_id =
                CASE
                    WHEN c.user_one_id = ?
                    THEN c.user_two_id
                    ELSE c.user_one_id
                END

            WHERE
                c.user_one_id = ?
                OR c.user_two_id = ?

            ORDER BY
                last_message_time DESC,
                c.created_at DESC

        `;

        db.query(
            sql,
            [
                userId,
                userId,
                userId,
                userId
            ],
            (error, results) => {

                if (error) {

                    console.error(error);

                    return res.status(500).json({

                        success: false,

                        message:
                            "Could not retrieve conversations."

                    });

                }

                res.json({

                    success: true,

                    conversations: results

                });

            }
        );

    }
);

// ============================================================
// GET MESSAGES FOR CONVERSATION
// ============================================================

app.get(
    "/conversations/:conversationId/messages",
    (req, res) => {

        const conversationId =
            req.params.conversationId;

        const sql = `

            SELECT

                m.message_id,
                m.conversation_id,
                m.sender_id,
                m.receiver_id,
                m.message,
                m.is_read,
                m.created_at,

                u.first_name,
                u.last_name,
                u.role

            FROM messages m

            JOIN users u
                ON u.user_id = m.sender_id

            WHERE
                m.conversation_id = ?

            ORDER BY
                m.created_at ASC

        `;

        db.query(
            sql,
            [conversationId],
            (error, results) => {

                if (error) {

                    console.error(error);

                    return res.status(500).json({

                        success: false,

                        message:
                            "Could not retrieve messages."

                    });

                }

                res.json({

                    success: true,

                    messages: results

                });

            }
        );

    }
);

// ============================================================
// SEND MESSAGE
// ============================================================

app.post("/messages", (req, res) => {

    const {
        conversation_id,
        sender_id,
        receiver_id,
        message
    } = req.body;

    if (
        !conversation_id ||
        !sender_id ||
        !receiver_id ||
        !message
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Conversation, sender, receiver and message are required."

        });

    }

    const cleanMessage =
        String(message).trim();

    if (!cleanMessage) {

        return res.status(400).json({

            success: false,

            message:
                "Message cannot be empty."

        });

    }

    const sql = `

        INSERT INTO messages
        (
            conversation_id,
            sender_id,
            receiver_id,
            message
        )
        VALUES (?, ?, ?, ?)

    `;

    db.query(
        sql,
        [
            conversation_id,
            sender_id,
            receiver_id,
            cleanMessage
        ],
        (error, result) => {

            if (error) {

                console.error(error);

                return res.status(500).json({

                    success: false,

                    message:
                        "Could not send message."

                });

            }

            res.status(201).json({

                success: true,

                message:
                    "Message sent successfully.",

                message_id:
                    result.insertId

            });

        }
    );

});

// ============================================================
// MARK MESSAGES AS READ
// ============================================================

app.put(
    "/conversations/:conversationId/read",
    (req, res) => {

        const conversationId =
            req.params.conversationId;

        const {
            user_id
        } = req.body;

        if (!user_id) {

            return res.status(400).json({

                success: false,

                message:
                    "User ID is required."

            });

        }

        const sql = `

            UPDATE messages

            SET is_read = TRUE

            WHERE conversation_id = ?

            AND receiver_id = ?

        `;

        db.query(
            sql,
            [
                conversationId,
                user_id
            ],
            (error) => {

                if (error) {

                    console.error(error);

                    return res.status(500).json({

                        success: false,

                        message:
                            "Could not update messages."

                    });

                }

                res.json({

                    success: true,

                    message:
                        "Messages marked as read."

                });

            }
        );

    }
);

// ============================================================
// GET STUDENTS
// ============================================================

app.get("/students", (req, res) => {

    const sql = `

        SELECT *

        FROM students

        ORDER BY student_id DESC

    `;

    db.query(
        sql,
        (error, results) => {

            if (error) {

                console.error(error);

                return res.status(500).json({

                    success: false,

                    message:
                        "Could not retrieve students."

                });

            }

            res.json({

                success: true,

                students: results

            });

        }
    );

});

// ============================================================
// 404 API HANDLER
// ============================================================

app.use("/api", (req, res) => {

    res.status(404).json({

        success: false,

        message: "API endpoint not found."

    });

});

// ============================================================
// ERROR HANDLER
// ============================================================

app.use(
    (err, req, res, next) => {

        console.error(
            "Server error:",
            err
        );

        res.status(500).json({

            success: false,

            message:
                "Internal server error."

        });

    }
);

// ============================================================
// START SERVER
// ============================================================

app.listen(
    PORT,
    () => {

        console.log(
            `Grade Genius server running on port ${PORT}`
        );

        console.log(
            `Open your application at: http://localhost:${PORT}/`
        );

    }
);