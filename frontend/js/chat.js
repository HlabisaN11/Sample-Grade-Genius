const chatForm =
    document.getElementById("chatForm");

const chatInput =
    document.getElementById("chatInput");

const messages =
    document.getElementById("messages");


chatForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const text =
            chatInput.value.trim();


        if (!text) {
            return;
        }


        const message =
            document.createElement("div");


        message.className =
            "message-bubble message-sent";


        message.textContent =
            text;


        messages.appendChild(message);


        chatInput.value = "";


        messages.scrollTop =
            messages.scrollHeight;

    }
);