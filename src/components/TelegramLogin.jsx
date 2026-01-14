import { useEffect } from "react";

function TelegramLogin() {
  useEffect(() => {
    // Define callback globally (Telegram requires this)
    window.onTelegramAuth = function (user) {
      fetch(`${import.meta.env.VITE_API_URL}/auth/telegram`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(user)
      })
        .then(res => res.json())
        .then(data => {
          localStorage.setItem("token", data.token);
          localStorage.setItem("userId", data.userId);
          window.location.reload();
        })
        .catch(err => {
          console.error("Telegram login failed:", err);
        });
    };

    // Create Telegram script
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;

    // Telegram widget configuration
    script.setAttribute("data-telegram-login", "attendance_login_bot");
    script.setAttribute("data-size", "large");
    script.setAttribute("data-userpic", "true");
    script.setAttribute("data-request-access", "write");
    script.setAttribute("data-on-auth", "onTelegramAuth");

    // Append script
    document.getElementById("telegram-login-container")?.appendChild(script);

    // Cleanup on unmount
    return () => {
      delete window.onTelegramAuth;
    };
  }, []);

  return (
    <div
      id="telegram-login-container"
      style={{ marginTop: "20px", textAlign: "center" }}
    />
  );
}

export default TelegramLogin;
