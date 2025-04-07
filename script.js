document.addEventListener("DOMContentLoaded", () => {
    const submitBtn = document.getElementById("submitBtn");
    const statusText = document.getElementById("status");
    const studentIdInput = document.getElementById("studentId");

    // รายการรหัสนักศึกษาที่ได้รับอนุญาต
    const allowedStudentIds = ["650001", "650002", "650003", "650004"]; // เพิ่มรหัสที่ต้องการ

    // พิกัดของ SC09 คณะวิทยาศาสตร์ มข.
    const allowedLatitude = 16.4756894;
    const allowedLongitude = 102.8251242;
    const radius = 0.0005; // ระยะห่างที่อนุญาต (ประมาณ 50 เมตร)


    let isLocationValid = false;
    let isStudentIdValid = false;

    // ฟังก์ชันตรวจสอบตำแหน่ง
    function checkLocation(position) {
        const { latitude, longitude } = position.coords;
        const distance = Math.sqrt(
            Math.pow(latitude - allowedLatitude, 2) + 
            Math.pow(longitude - allowedLongitude, 2)
        );

        if (distance < radius) {
            isLocationValid = true;
            statusText.textContent = "อยู่ในพื้นที่ กรุณากรอกรหัสนักศึกษา";
        } else {
            isLocationValid = false;
            statusText.textContent = "อยู่นอกพื้นที่ ไม่สามารถเช็กชื่อได้";
        }

        updateSubmitButton();
    }

    function errorHandler() {
        statusText.textContent = "ไม่สามารถระบุตำแหน่งของคุณได้";
        isLocationValid = false;
        updateSubmitButton();
    }

    // ตรวจสอบรหัสนักศึกษา
    function checkStudentId() {
        const studentId = studentIdInput.value.trim();
        isStudentIdValid = allowedStudentIds.includes(studentId);
        updateSubmitButton();
    }

    // อัปเดตสถานะปุ่มยืนยัน
    function updateSubmitButton() {
        if (isLocationValid && isStudentIdValid) {
            submitBtn.disabled = false;
        } else {
            submitBtn.disabled = true;
        }
    }

    // ขอสิทธิ์ใช้ตำแหน่งของผู้ใช้
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(checkLocation, errorHandler);
    } else {
        statusText.textContent = "อุปกรณ์ของคุณไม่รองรับการใช้ตำแหน่ง";
    }

    // ตรวจสอบรหัสนักศึกษาเมื่อพิมพ์
    studentIdInput.addEventListener("input", checkStudentId);

    // เมื่อกดปุ่มยืนยัน
    document.getElementById("attendanceForm").addEventListener("submit", (event) => {
        event.preventDefault();
        
        const name = document.getElementById("name").value;
        const studentId = studentIdInput.value;

        // ส่งข้อมูลไปยัง Google Form หรือ Backend
        const googleFormUrl = "https://docs.google.com/forms/d/e/1FAIpQLSfskGbqUt07_uaLxVjqFaKhMByEZ_du5GPp0GvznNgmVfVFvQ/formResponse"; 
        const formData = new FormData();
        formData.append("entry.0", name); // แทนที่ entry.xxx ด้วยค่า entry ของฟิลด์ใน Google Form
        formData.append("entry.1", studentId);

        fetch(googleFormUrl, {
            method: "POST",
            body: formData,
            mode: "no-cors",
        }).then(() => {
            alert("เช็กชื่อสำเร็จ!");
        }).catch(() => {
            alert("เกิดข้อผิดพลาดในการส่งข้อมูล");
        });
    });
});
