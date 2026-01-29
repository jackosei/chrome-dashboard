// State Management
const defaultSettings = {
  showCrypto: true,
  showWeather: true,
};

let settings =
  JSON.parse(localStorage.getItem("dashboard_settings")) || defaultSettings;

// Elements
const settingsIcon = document.getElementById("settings-icon");
const settingsModal = document.getElementById("settings-modal");
const closeModal = document.getElementById("close-modal");
const toggleCrypto = document.getElementById("toggle-crypto");
const toggleWeather = document.getElementById("toggle-weather");
const cryptoWidget = document.getElementById("crypto");
const weatherWidget = document.getElementById("weather");
const authorWidget = document.getElementById("author");
const timeWidget = document.getElementById("time");

// Initialization
function initUI() {
  toggleCrypto.checked = settings.showCrypto;
  toggleWeather.checked = settings.showWeather;

  applySettings();

  // Apply Glassmorphism
  cryptoWidget.classList.add("glass");
  // weatherWidget.classList.add("glass"); // Weather looks better clean
  // timeWidget.classList.add("glass") // Time might look better clean
  authorWidget.classList.add("glass");
}

function applySettings() {
  cryptoWidget.style.display = settings.showCrypto ? "block" : "none";
  weatherWidget.style.display = settings.showWeather ? "flex" : "none";
}

function saveSettings() {
  localStorage.setItem("dashboard_settings", JSON.stringify(settings));
}

// Event Listeners
settingsIcon.addEventListener("click", () => {
  settingsModal.classList.remove("hidden");
});

closeModal.addEventListener("click", () => {
  settingsModal.classList.add("hidden");
});

window.addEventListener("click", (e) => {
  if (e.target === settingsModal) {
    settingsModal.classList.add("hidden");
  }
});

toggleCrypto.addEventListener("change", (e) => {
  settings.showCrypto = e.target.checked;
  applySettings();
  saveSettings();
});

toggleWeather.addEventListener("change", (e) => {
  settings.showWeather = e.target.checked;
  applySettings();
  saveSettings();
});

initUI();

// --- Original Logic Below ---

try {
  const cachedBackground = JSON.parse(
    localStorage.getItem("dashboard_background"),
  );
  const today = new Date().toDateString();

  if (cachedBackground && cachedBackground.date === today) {
    document.body.style.backgroundImage = `url(${cachedBackground.url})`;
    document.getElementById("author").textContent =
      `By: ${cachedBackground.author}`;
  } else {
    fetch(
      "https://apis.scrimba.com/unsplash/photos/random?orientation=landscape&query=nature",
    )
      .then((res) => res.json())
      .then((data) => {
        document.body.style.backgroundImage = `url(${data.urls.full})`;
        document.getElementById("author").textContent = `By: ${data.user.name}`;

        localStorage.setItem(
          "dashboard_background",
          JSON.stringify({
            url: data.urls.full,
            author: data.user.name,
            date: today,
          }),
        );
      })
      .catch((err) => {
        // Use a default background image/author
        document.body.style.backgroundImage = `url(https://images.unsplash.com/photo-1560008511-11c63416e52d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwyMTEwMjl8MHwxfHJhbmRvbXx8fHx8fHx8fDE2MjI4NDIxMTc&ixlib=rb-1.2.1&q=80&w=1080)`;
        document.getElementById("author").textContent = `By: Dodi Achmad`;
      });
  }
} catch (error) {
  console.error("Error accessing localStorage or parsing JSON:", error);
  // Fallback if local storage fails completely
  fetch(
    "https://apis.scrimba.com/unsplash/photos/random?orientation=landscape&query=nature",
  )
    .then((res) => res.json())
    .then((data) => {
      document.body.style.backgroundImage = `url(${data.urls.full})`;
      document.getElementById("author").textContent = `By: ${data.user.name}`;
    });
}

// Loading States
document.getElementById("crypto-top").innerHTML =
  `<span class="loading">Loading...</span>`;
// document.getElementById("crypto").innerHTML = ""; // Removed to prevent deleting #crypto-top

if (settings.showCrypto) {
  // Only fetch if visible
  fetch("https://api.coingecko.com/api/v3/coins/dogecoin")
    .then((res) => {
      if (!res.ok) {
        throw Error("Something went wrong");
      }
      return res.json();
    })
    .then((data) => {
      document.getElementById("crypto-top").innerHTML = `
                <img src=${data.image.small} />
                <span>${data.name}</span>
            `;
      document.getElementById("crypto").innerHTML += `
                <p>🎯: $${data.market_data.current_price.usd}</p>
                <p>👆: $${data.market_data.high_24h.usd}</p>
                <p>👇: $${data.market_data.low_24h.usd}</p>
            `;
    })
    .catch((err) => {
      console.error(err);
      document.getElementById("crypto-top").innerHTML =
        `<span class="error">N/A</span>`;
    });
}

function getCurrentTime() {
  const date = new Date();
  document.getElementById("time").textContent = date.toLocaleTimeString(
    "en-us",
    { timeStyle: "short" },
  );
}

setInterval(getCurrentTime, 1000);

if (settings.showWeather) {
  // Only fetch if visible (though geolocation might be permission blocker, usually fine to init)
  navigator.geolocation.getCurrentPosition((position) => {
    document.getElementById("weather").innerHTML =
      `<span class="loading">Loading...</span>`;
    fetch(
      `https://apis.scrimba.com/openweathermap/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&units=imperial`,
    )
      .then((res) => {
        if (!res.ok) {
          throw Error("Weather data not available");
        }
        return res.json();
      })
      .then((data) => {
        const iconUrl = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        document.getElementById("weather").innerHTML = `
                    <img src=${iconUrl} />
                    <div class="weather-info">
                        <p class="weather-temp">${Math.round(data.main.temp)}º</p>
                        <p class="weather-city">${data.name}</p>
                    </div>
                `;
      })
      .catch((err) => {
        console.error(err);
        document.getElementById("weather").innerHTML =
          `<span class="error">Data N/A</span>`;
      });
  });
}
