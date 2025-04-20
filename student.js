// Haversine formula to calculate distance in meters between two points
function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function markAttendance() {
    const name = document.getElementById('studentName').value;
    const rollNumber = document.getElementById('studentRollNumber').value;
    const branch = document.getElementById('studentBranch').value;
    const division = document.getElementById('studentDivision').value;

    const session = JSON.parse(localStorage.getItem('currentSession'));
    if (!session) {
        showNotification("No active session found.", true);
        return;
    }

    if (session.branch !== branch) {
        showNotification("No session available for your branch.", true);
        return;
    }

    // Global cooldown check (applies to all users from same browser)
    const globalCooldown = localStorage.getItem("globalLastAttendanceTime");
    if (globalCooldown && Date.now() - parseInt(globalCooldown) < 20 * 60 * 1000) {
        const minutesLeft = Math.ceil((20 * 60 * 1000 - (Date.now() - globalCooldown)) / 60000);
        showNotification(`You have already marked attendance. Wait ${minutesLeft} more minute(s).`, true);
        return;
    }

    // Check if student already marked attendance for this subject
    const existingRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
    const alreadyMarked = existingRecords.some(r => r.rollNumber === rollNumber && r.subject === session.subject);
    if (alreadyMarked) {
        showNotification("You have already marked attendance for this subject.", true);
        return;
    }

    if (!navigator.geolocation) {
        showNotification("Geolocation not supported.", true);
        return;
    }

    navigator.geolocation.getCurrentPosition(position => {
        const studentLat = position.coords.latitude;
        const studentLng = position.coords.longitude;
        const distance = getDistanceFromLatLonInMeters(studentLat, studentLng, session.latitude, session.longitude);

        const now = new Date();
        const currentTime = now.toTimeString().slice(0,5);

        if (distance > session.range) {
            showNotification(`You are out of range. (${Math.round(distance)}m > ${session.range}m)`, true);
            return;
        }

        if (currentTime < session.startTime || currentTime > session.endTime) {
            showNotification("You are not in the allowed time window.", true);
            return;
        }

        const attendanceRecord = {
            date: now.toLocaleDateString(),
            timestamp: now.toLocaleTimeString(),
            name: name,
            rollNumber: rollNumber,
            branch: branch,
            division: division,
            subject: session.subject,
            status: 'Present'
        };

        existingRecords.push(attendanceRecord);
        localStorage.setItem('attendanceRecords', JSON.stringify(existingRecords));
        localStorage.setItem("globalLastAttendanceTime", Date.now()); // Set global cooldown

        showNotification("Your attendance has been marked successfully!", false);
        document.getElementById('attendanceForm').reset();
        loadAttendanceHistory();
    }, () => {
        showNotification("Unable to retrieve your location.", true);
    });
}

function showNotification(message, isError) {
    const notif = document.getElementById('notification');
    notif.innerText = message;
    notif.style.display = 'block';
    notif.style.backgroundColor = isError ? '#f8d7da' : '#d4edda';
    notif.style.color = isError ? '#721c24' : '#155724';
    notif.style.borderColor = isError ? '#f5c6cb' : '#c3e6cb';
    setTimeout(() => notif.style.display = 'none', 4000);
}

function loadAttendanceHistory() {
    const storedRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
    const attendanceBody = document.getElementById('attendanceBody');
    attendanceBody.innerHTML = '';

    storedRecords.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.date}</td>
            <td>${record.timestamp}</td>
            <td>${record.subject}</td>
            <td>${record.status}</td>
        `;
        attendanceBody.appendChild(row);
    });
}

function loadSessionInfo() {
    const session = JSON.parse(localStorage.getItem('currentSession'));
    const sessionDiv = document.getElementById('sessionInfo');
    if (session) {
        sessionDiv.innerHTML = `
            <strong>Subject:</strong> ${session.subject} | 
            <strong>Time Window:</strong> ${session.startTime} - ${session.endTime} | 
            <strong>Location:</strong> (${session.latitude.toFixed(5)}, ${session.longitude.toFixed(5)}) | 
            <strong>Branch:</strong> ${session.branch} | 
            <strong>Range:</strong> ${session.range}m
        `;
    } else {
        sessionDiv.innerText = 'No active session.';
    }
}

document.getElementById('attendanceForm').addEventListener('submit', function(event) {
    event.preventDefault();
    markAttendance();
});

document.getElementById('logoutButton').addEventListener('click', function() {
    alert('You have been logged out.');
    window.location.href = 'index.html';
});

loadSessionInfo();
loadAttendanceHistory();