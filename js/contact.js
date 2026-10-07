/* contact.js - checks the inquiry form and shows a thank-you message.
   The form is front-end only (nothing is sent or stored), as the brief asks. Original code. */
(function () {
  "use strict";

  var form = document.getElementById("inquiryForm");
  if (!form) { return; }

  var errorBox = document.getElementById("formErrors");
  var okBox = document.getElementById("formThanks");

  function value(id) { return document.getElementById(id).value.trim(); }

  function showErrors(list) {
    errorBox.textContent = "";
    if (list.length) {
      var intro = document.createElement("p");
      intro.className = "mb-1 fw-semibold";
      intro.textContent = "Please fix the following:";
      errorBox.appendChild(intro);
      var ul = document.createElement("ul");
      ul.className = "mb-0";
      list.forEach(function (text) {
        var li = document.createElement("li");
        li.textContent = text;
        ul.appendChild(li);
      });
      errorBox.appendChild(ul);
    }
    errorBox.classList.toggle("d-none", list.length === 0);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    okBox.classList.add("d-none");

    var problems = [];
    var name = value("inqName");
    if (name.length < 2 || name.length > 60) { problems.push("Enter your full name (2 to 60 characters)."); }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value("inqEmail"))) { problems.push("Enter a valid email address."); }
    if (!document.getElementById("inqType").value) { problems.push("Choose an enquiry type."); }
    if (value("inqMessage").length < 10) { problems.push("Write a message of at least 10 characters."); }

    showErrors(problems);
    if (problems.length) {
      errorBox.focus();
      return;
    }

    form.reset();                       /* clears the form (and hides old messages) ... */
    document.getElementById("thanksName").textContent = name.split(" ")[0];
    okBox.classList.remove("d-none");   /* ... then show the thank-you */
    okBox.focus();
  });

  form.addEventListener("reset", function () {
    showErrors([]);
    okBox.classList.add("d-none");
  });
})();
