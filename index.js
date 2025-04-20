document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent the form from submitting

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const loginType = document.getElementById("loginType").value;

    // Updated user credentials
    const credentials = {
        teacher: { username: "Pranita", password: "Padhye" },
        student: [
            { username: "Vishesh", password: "Sharma" },
            { username: "Aditya", password: "Chavan" },
            { username: "Abhishek", password: "Gupta" }
        ]
    };

    // Check if credentials match for teacher
    if (loginType === "teacher" && username === credentials.teacher.username && password === credentials.teacher.password) {
        window.location.href = "teacher.html"; // Redirect to teacher page
    } 
    // Check if credentials match for student
    else if (loginType === "student") {
        const student = credentials.student.find(s => s.username === username && s.password === password);
        if (student) {
            window.location.href = "student.html"; // Redirect to student page
        } else {
            alert("Invalid username or password!");
        }
    } 
    // If loginType is incorrect
    else {
        alert("Invalid username or password!");
    }
});
