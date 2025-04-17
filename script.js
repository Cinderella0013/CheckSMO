document.addEventListener("DOMContentLoaded", () => {
    const submitBtn = document.getElementById("submitBtn");
    const statusText = document.getElementById("status");
    const studentIdInput = document.getElementById("studentId");

    // รายการรหัสนักศึกษาที่ได้รับอนุญาต
    const allowedStudentIds = [
        "663380456-0", "663380346-7", "663380623-7", "663380616-4", "663380445-5",
        "663380228-3", "673380608-4", "673380096-5", "673380149-0", "663380518-4",
        "663380594-8", "663380175-8", "663380220-9", "673380108-4", "663380366-1",
        "663380214-4", "673380175-9", "673380374-3", "663380209-7", "673380087-6",
        "663380449-7", "673380402-4", "673380011-9", "673380106-8", "663380116-4",
        "673380028-2", "663380208-9", "673380145-8", "673380208-0", "663380351-4",
        "663380338-6", "663380381-5", "673380128-8", "673380468-4", "663380129-5",
        "663380362-9", "663380363-7", "673380552-5", "673380459-5", "663380030-4",
        "673380123-8", "673380111-5", "663380024-9"
    ];

    // // พิกัดของ SC09 คณะวิทยาศาสตร์ มข.
    // const allowedLatitude = 16.4756894;
    // const allowedLongitude = 102.8251242;
    // const radius = 0.0005; // ประมาณ 50 เมตร
    // พิกัดของ ทดสอบ
    const allowedLatitude = 16.463044140532077;
    const allowedLongitude = 102.8236292862173;
    const radius = 0.0005; // ประมาณ 50 เมตร

    let isLocationValid = false;
    let isStudentIdValid = false;

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
            statusText.textContent = "คุณอยู่นอกพื้นที่ทำงานนนนนนนนน";
        }

        updateSubmitButton();
    }

    function errorHandler() {
        statusText.textContent = "รีเฟรชหน้าเว็บแล้วกดอนุญาตแชร์ตำแหน่ง หรือเข้าไปเปิดในตั้งค่าของแอพ";
        isLocationValid = false;
        updateSubmitButton();
    }

    function checkStudentId() {
        const studentId = studentIdInput.value.trim();
        isStudentIdValid = allowedStudentIds.includes(studentId);
        updateSubmitButton();
    }

    function updateSubmitButton() {
        submitBtn.disabled = !(isLocationValid && isStudentIdValid);
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(checkLocation, errorHandler);
    } else {
        statusText.textContent = "อุปกรณ์ของคุณไม่รองรับการใช้ตำแหน่ง";
    }

    studentIdInput.addEventListener("input", checkStudentId);

    // เมื่อกดปุ่มยืนยัน
    document.getElementById("attendanceForm").addEventListener("submit", (event) => {
        event.preventDefault();

        const name = document.getElementById("name").value;
        const studentId = studentIdInput.value.trim();

        const key = `checkin_${studentId}`;
        const lastCheckIn = localStorage.getItem(key);
        const now = Date.now();

        if (lastCheckIn && now - parseInt(lastCheckIn) < 3600000) {
            alert("คุณได้เช็กชื่อไปแล้วใน 1 ชั่วโมงที่ผ่านมา กรุณารออีกสักครู่");
            return;
        }

        const googleFormUrl = "https://docs.google.com/forms/d/e/1FAIpQLSfskGbqUt07_uaLxVjqFaKhMByEZ_du5GPp0GvznNgmVfVFvQ/formResponse";
        const formData = new FormData();
        formData.append("entry.21734374", name); // ช่องชื่อ
        formData.append("entry.1103605559", studentId); // ช่องรหัสนักศึกษา

        fetch(googleFormUrl, {
            method: "POST",
            mode: "no-cors",
            body: formData,
        }).then(() => {
            localStorage.setItem(key, now.toString());
            alert("เช็กชื่อสำเร็จ!");
        }).catch(() => {
            alert("เกิดข้อผิดพลาดในการส่งข้อมูล");
        });
    });
});
