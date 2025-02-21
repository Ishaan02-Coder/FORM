function getCookie(name) {
  const cookies = document.cookie.split("; ");
  const cookie = cookies.find(row => row.startsWith(name + "="));
  return cookie ? decodeURIComponent(cookie.split("=")[1]) : null;
}

function setCookie(name, value, days = 7) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=None; Secure`;
}

function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=None; Secure`;
}

let usedEmails = new Set(JSON.parse(getCookie("usedEmails") || "[]"));

document.addEventListener("DOMContentLoaded", function () {
  let latestRegistration = JSON.parse(getCookie("latestRegistration") || "{}");

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
      setCookie("latestRegistration", JSON.stringify(formData));
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
  ["responseMessage", "i", "p", "e","checkboxMessage","n"].forEach(id => showMessage(id, "", ""));

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
  if (name.value.trim() === "" || !validateName(name.value)) {
    name.style.border = "2px solid red";
    isValid = false;
    showMessage("n", "NAME INVALID", "red");
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

  let allRegistrations = JSON.parse(getCookie("allRegistrations") || "[]");
  allRegistrations.push(formData);
  setCookie("allRegistrations", JSON.stringify(allRegistrations));

  setCookie("latestRegistration", JSON.stringify(formData));

  try {
      let response = await fetch("https://jsonplaceholder.typicode.com/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
      });

      let result = await response.json();

      showMessage("responseMessage", "Registration Successful! 🎉", "green");
      usedEmails.add(emailInput);
      setCookie("usedEmails", JSON.stringify([...usedEmails]));

      console.log("Stored Response:", result);
      fetch("https://www.foo.com", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
              name: document.getElementById("name").value.trim(),
              email: document.getElementById("email").value.trim()
          })
      });
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
  let re = /^202[0-4](([AB][ABCD1-7]){1,2}[PT]S||([AB][ABCD1-7]){1,2})(?!0000)([01][0-9]{3})P$/;
  return re.test(BITS_ID);
}
function validateName(name) {
  let re = /^[A-Za-z ]{5,50}$/;
  return re.test(name);
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
  ["responseMessage", "i", "p", "e","checkboxMessage","n"].forEach(id => document.getElementById(id).textContent = "");
  deleteCookie("latestRegistration");
  document.getElementById("agree").checked = false;
});
