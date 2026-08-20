const registerForm =
    document.getElementById("registerForm");


registerForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const message =
            document.getElementById("registerMessage");


        const data = {

            first_name:
                document.getElementById("first_name").value.trim(),

            last_name:
                document.getElementById("last_name").value.trim(),

            email:
                document.getElementById("email").value.trim(),

            password:
                document.getElementById("password").value,

            role:
                document.getElementById("role").value

        };


        try {

            const response = await fetch(
                "/register",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(data)

                }
            );


            const result =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    result.error ||
                    "Registration failed."
                );

            }


            message.className =
                "message success";

            message.textContent =
                "Account created successfully. Redirecting...";


            setTimeout(() => {

                window.location.href =
                    "/login.html";

            }, 1200);


        } catch (error) {

            message.className =
                "message error";

            message.textContent =
                error.message;

        }

    }
);