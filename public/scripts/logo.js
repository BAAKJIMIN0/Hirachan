logo.addEventListener("click", (event) => {
    event.preventDefault();
    chatContainer.innerHTML = "";
    location.reload();
});

loginBtn.onclick = () => modal.style.display = "block";
closeBtn.onclick = () => modal.style.display = "none";

const loginForm = document.querySelector("#loginModal form");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userid = document.getElementById("userid").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userid, password }),
    });

    const data = await res.json();

    if (data.success) {
      alert("로그인 성공!");
      localStorage.setItem("userId", data.userId);
      modal.style.display = "none";
      location.reload();
    } else {
      alert("로그인 실패: " + data.message);
    }
  } catch (err) {
    console.error(err);
    alert("로그인 중 오류가 발생했습니다.");
  }
});