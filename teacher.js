function parseDate(dateString) {
    const parts = dateString.split("/");
    return new Date(parts[2], parts[0] - 1, parts[1]);
  }
  
  function loadAttendanceData() {
    return JSON.parse(localStorage.getItem("attendanceRecords")) || [];
  }
  
  function displayAttendance(filterBranch = "All") {
    const records = loadAttendanceData();
    const tbody = document.getElementById("attendanceBody");
    tbody.innerHTML = "";
  
    const filtered = filterBranch === "All"
      ? records
      : records.filter(r => r.branch === filterBranch);
  
    filtered.forEach(record => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${record.date}</td>
        <td>${record.timestamp}</td>
        <td>${record.name}</td>
        <td>${record.rollNumber}</td>
        <td>${record.branch}</td>
        <td>${record.division}</td>
        <td>${record.subject || "-"}</td>
        <td>${record.status}</td>
      `;
      tbody.appendChild(row);
    });
  
    return filtered;
  }
  
  function downloadCSV(records) {
    if (!records.length) return alert("No records to download.");
  
    let csv = "Date,Timestamp,Name,Roll Number,Branch,Division,Subject,Status\n";
    records.forEach(r => {
      csv += `${r.date},${r.timestamp},${r.name},${r.rollNumber},${r.branch},${r.division},${r.subject || "-"},${r.status}\n`;
    });
  
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "attendance_records.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  
    // Clear attendance records after download
    localStorage.removeItem("attendanceRecords");
    displayAttendance(); // Refresh UI
  }
  
  function createSession() {
    const subject = document.getElementById("subject").value;
    const branch = document.getElementById("sessionBranch").value;
    const startTime = document.getElementById("startTime").value;
    const endTime = document.getElementById("endTime").value;
    const range = parseInt(document.getElementById("sessionRange").value);
  
    if (!subject || !startTime || !endTime || !branch || isNaN(range)) {
      alert("Please fill in all session details.");
      return;
    }
  
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
  
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const session = {
          subject,
          branch,
          startTime,
          endTime,
          range,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
  
        localStorage.setItem("currentSession", JSON.stringify(session));
        document.getElementById("locationStatus").innerText =
          `✅ Session created for ${branch} at (${session.latitude.toFixed(5)}, ${session.longitude.toFixed(5)}) with range ${range}m.`;
      },
      () => {
        alert("Unable to retrieve your location.");
      }
    );
  }
  
  // Events
  const filterDropdown = document.getElementById("filterBranch");
  filterDropdown.addEventListener("change", () => {
    displayAttendance(filterDropdown.value);
  });
  
  document.getElementById("downloadCSV").addEventListener("click", () => {
    const records = loadAttendanceData();
    downloadCSV(records);
  });
  
  document.getElementById("logoutButton").addEventListener("click", () => {
    window.location.href = "index.html";
  });
  
  displayAttendance();
  