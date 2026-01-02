const WHITELIST = ["x.com", "www.x.com"];

const info = document.getElementById("info");
const button = document.getElementById("replaceBtn");

chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  if (!tab?.url) {
    info.textContent = "Nie można odczytać adresu strony";
    info.style.display = "block";
    return;
  }

  const url = new URL(tab.url);

  const isWhitelisted = WHITELIST.includes(url.hostname);

  if (isWhitelisted) {
    button.style.display = "block";
  } else {
    info.style.display = "block";
  }
});

button.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab?.url) return;

  const url = new URL(tab.url);
  url.hostname = "xcancel.com";

  chrome.tabs.create({
    url: url.toString(),
    active: true
  });
});
