let usedEmails = new Set(JSON.parse(localStorage.getItem("usedEmails")) || []);


document.addEventListener("DOMContentLoaded", function () {
    let latestRegistration = JSON.parse(localStorage.getItem("latestRegistration"));
    if (latestRegistration) {
        document.getElementById("name").value = latestRegistration.name || "";
        document.getElementById("email").value = latestRegistration.email || "";
        document.getElementById("phone").value = latestRegistration.phone || "";
        document.getElementById("BITS_ID").value = latestRegistration.BITS_ID || "";
        document.getElementById("merchandise").value = latestRegistration.merchandise || "";
        document.getElementById("hostel").value = latestRegistration.hostel || "";
        document.getElementById("agree").checked = latestRegistration.agree || false;

        if (latestRegistration.size) {
            document.querySelector(`input[name="size"][value="${latestRegistration.size}"]`).checked = true;
        }
    }
});


document.querySelectorAll("#registrationForm input, #registrationForm select").forEach(input => {
    input.addEventListener("input", function () {
        let formData = getFormData();
        
        localStorage.setItem("latestRegistration", JSON.stringify(formData));
    });
});

function getFormData() {
    let selectedSize = document.querySelector('input[name="size"]:checked');
    return {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        BITS_ID: document.getElementById("BITS_ID").value.trim(),
        merchandise: document.getElementById("merchandise").value,
        hostel: document.getElementById("hostel").value,
        size: selectedSize ? selectedSize.value : "",
        agree: document.getElementById("agree").checked 
    };
}

document.getElementById("registrationForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    let name = document.getElementById("name");
    let email = document.getElementById("email");
    let phone = document.getElementById("phone");
    let merchandise = document.getElementById("merchandise");
    let BITS_ID = document.getElementById("BITS_ID");
    let checkbox = document.getElementById("agree");

    let emailInput = email.value.trim();
    
    console.log("Checking for duplicate email:", emailInput, usedEmails);

    if (usedEmails.has(emailInput)) {
        alert("This email is already registered! Please use a different email.");
        email.style.border = "2px solid red";
        return;
    }

    let isValid = true;

    [name, email, phone, BITS_ID].forEach(input => input.style.border = "1px solid #ccc");
    ["responseMessage", "i", "p", "e"].forEach(id => showMessage(id, "", ""));

    if (name.value.trim() === "") {
        name.style.border = "2px solid red";
        isValid = false;
    }
    if (email.value.trim() === "" || !validateEmail(email.value)) {
        email.style.border = "2px solid red";
        isValid = false;
        showMessage("e", "EMAIL INVALID", "red");
    }

    if (phone.value.trim() === "" || !validatePhone(phone.value)) {
        phone.style.border = "2px solid red";
        isValid = false;
        showMessage("p", "PHONE NO. INVALID", "red");
    }

    if (BITS_ID.value.trim() === "" || !validateID(BITS_ID.value)) {
        BITS_ID.style.border = "2px solid red";
        isValid = false;
        showMessage("i", "ID INVALID", "red");
    }

    if (!checkbox.checked) {
        let checkboxMessage = document.getElementById("checkboxMessage");
        checkboxMessage.textContent = "You must agree to the terms and conditions!";
        checkboxMessage.style.color = "red";        
        isValid = false;
    }

    if (!isValid) {
        console.log("Form validation failed.");
        showMessage("responseMessage", "Please fill all fields correctly!", "red");
        return;
    }

    console.log("Validation successful. Proceeding with submission.");

    let formData = getFormData();
    if (!formData.hostel ) {
        alert("Please select hostel.");
        return;
    }
    if (!formData.size ) {
        alert("Please select size.");
        return;
    }
    let allRegistrations = JSON.parse(localStorage.getItem("allRegistrations")) || [];
    allRegistrations.push(formData);
    localStorage.setItem("allRegistrations", JSON.stringify(allRegistrations));

    localStorage.setItem("latestRegistration", JSON.stringify(formData));

    try {
        let response = await fetch("https://jsonplaceholder.typicode.com/posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        let result = await response.json();

        showMessage("responseMessage", "Registration Successful! 🎉", "green");
        usedEmails.add(emailInput);
        localStorage.setItem("usedEmails", JSON.stringify([...usedEmails]));

        console.log("Stored Response:", result);
    } catch (error) {
        showMessage("responseMessage", "Error submitting form. Try again.", "red");
        console.error("Error:", error);
    }
});
function validateEmail(email) {
    let re = /^[fh]202[0-4](?!0000)([01][0-9]{3})@pilani.bits-pilani.ac.in$/;
    return re.test(email);
}

function validatePhone(phone) {
    let re = /^[0-9]{10}$/;
    return re.test(phone);
}

function validateID(BITS_ID) {
    let re = /^202[0-4]([AB][ABCD1-7]){1,2}[PT]S(?!0000)([01][0-9]{3})P$/;
    return re.test(BITS_ID);
}

function showMessage(id, msg, color) {
    let responseDiv = document.getElementById(id);
    if (responseDiv) {
        responseDiv.textContent = msg;
        responseDiv.style.color = color;
    }
}

document.getElementById("resetButton").addEventListener("click", function () {
    document.querySelectorAll("#registrationForm input, #registrationForm select").forEach(input => input.value = "");
    ["responseMessage", "i", "p", "e"].forEach(id => document.getElementById(id).textContent = "");
    localStorage.removeItem("latestRegistration");
    document.getElementById("agree").checked = false; 

});
