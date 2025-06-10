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

    // พิกัดของ SC09 คณะวิทยาศาสตร์ มข.
    const allowedLatitude = 16.4756894;
    const allowedLongitude = 102.8251242;
    const radius = 0.0005; // ประมาณ 50 เมตร
    // // พิกัดของ ทดสอบ
    // const allowedLatitude = 16.463014;
    // const allowedLongitude = 102.823627;
    // const radius = 0.0005; // ประมาณ 50 เมตร

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
            statusText.textContent = "คุณอยู่ในพื้นที่ทำงานแล้ว กรอกข้อมูลเลยยย";
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
      
        const name = document.getElementById("name").value.trim();
        const studentId = document.getElementById("studentId").value.trim();
        const pictureFile = document.getElementById("picture").files[0];
        const submitBtn = document.getElementById("submitBtn");
      
        if (!name || !studentId || !pictureFile) {
          alert("กรุณากรอกข้อมูลให้ครบถ้วนและเลือกรูป");
          return;
        }
      
        const reader = new FileReader();
        reader.readAsDataURL(pictureFile);

        reader.onload = async () => {
            const base64Image = reader.result.replace(/^data:image\/[a-z]+;base64,/, "");

            const driveUploadUrl = "https://script.google.com/macros/s/AKfycbzrM0lhCYyz8yGgmVHAcHqOWXL9j_8s9Is29zkQUjdJtcn-SNZMEr0nUBgbpvV39CMXuA/exec";

            try {
                const uploadRes = await fetch(driveUploadUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        image: base64Image,
                        name: `${studentId}_${Date.now()}`
                    })
                });

                const json = await uploadRes.json();
                if (!json.success) throw new Error(json.error);

                const imageUrl = json.url;

      
            if (submitBtn.disabled) return;
            submitBtn.disabled = true;
            submitBtn.textContent = "กำลังส่ง...";
      
            fetch("https://api64.ipify.org?format=json")
              .then(response => response.json())
              .then(data => {
                const ip = data.ip;
                const key = `checkin_ip_${ip}`;
                const lastCheck = localStorage.getItem(key);
                const now = Date.now();
      
                if (lastCheck && now - parseInt(lastCheck) < 3600000) {
                  alert("เครื่องนี้เคยเช็กชื่อไปแล้ว");
                  submitBtn.disabled = false;
                  submitBtn.textContent = "ยืนยัน";
                  return;
                }
      
                const googleFormUrl = "https://docs.google.com/forms/d/e/1FAIpQLSfskGbqUt07_uaLxVjqFaKhMByEZ_du5GPp0GvznNgmVfVFvQ/formResponse";
                const formData = new FormData();
                formData.append("entry.21734374", name);          // ช่องชื่อ
                formData.append("entry.1103605559", studentId);   // ช่องรหัสนักศึกษา
                formData.append("entry.269578723", imageUrl);     // ✅ ส่ง URL ภาพที่ได้
      
                fetch(googleFormUrl, {
                  method: "POST",
                  mode: "no-cors",
                  body: formData,
                }).then(() => {
                  localStorage.setItem(key, now.toString());
                  alert("เช็กชื่อสำเร็จ!");
                }).catch(() => {
                  alert("เกิดข้อผิดพลาดในการส่งข้อมูล");
                }).finally(() => {
                  setTimeout(() => {
                    submitBtn.disabled = true;
                    submitBtn.textContent = "ยืนยัน";
                  }, 3000);
                });
      
              }).catch(() => {
                alert("ไม่สามารถตรวจสอบ IP ได้ กรุณาลองใหม่");
                submitBtn.disabled = false;
                submitBtn.textContent = "ยืนยัน";
              });
      
          } catch (error) {
            console.error("การอัปโหลดรูปผิดพลาด:", error);
            alert("อัปโหลดรูปไม่สำเร็จ กรุณาลองใหม่");
          }
        };
      });      
    
});
