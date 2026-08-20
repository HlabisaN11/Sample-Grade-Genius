const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const message = document.getElementById("loginMessage");

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;


    if (!email || !password) {

        message.className = "message error";

        message.textContent =
            "Please enter your email and password.";

        return;

    }


    try {

        const response = await fetch("/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                email: email,

                password: password

            })

        });


        const result = await response.json();


        if (!response.ok) {

            throw new Error(
                result.error || "Login failed."
            );

        }


        localStorage.setItem(
            "user",
            JSON.stringify(result.user)
        );


        window.location.href =
            "/dashboard.html";


    } catch (error) {

        message.className =
            "message error";

        message.textContent =
            error.message;

    }

});