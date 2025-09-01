document.getElementById("copy-btn").addEventListener("click", () => {
    const textToCopy = document.getElementById("user-input").value;
    navigator.clipboard.writeText(textToCopy)
});