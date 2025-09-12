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
    const res = await fetch("/login", {
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

window.onload = function () {
  google.accounts.id.initialize({
    client_id: '631095185833-skdoc8l4mn8oqfpvnu4ktvcu3ko1n5p1.apps.googleusercontent.com',
    callback: handleCredentialResponse
  });

  google.accounts.id.renderButton(
    document.getElementById('google-login-btn'),
    { theme: 'outline', size: 'medium' }
  );
};

function handleCredentialResponse(response) {
  fetch('/googleLogin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: response.credential })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      console.log("구글 로그인 성공:", data);
      localStorage.setItem("userId", data.userId);
      modal.style.display = "none";
      location.reload();
    } else {
      console.error("로그인 실패:", data.message);
    }
  });
}