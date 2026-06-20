const WHITELIST = ["x.com", "www.x.com"];

const info = document.getElementById("info");
const button = document.getElementById("replaceBtn");
const copyBtn = document.getElementById("copyBtn");

const toastToggle = document.getElementById("toggleToast");

chrome.storage.sync.get(["toastEnabled"], (res) => {
  toastToggle.checked = res.toastEnabled ?? true;
});

toastToggle.addEventListener("change", () => {
  chrome.storage.sync.set({ toastEnabled: toastToggle.checked });
});

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
    copyBtn.style.display = "block";
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

copyBtn.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab?.url) return;

  const url = new URL(tab.url);
  url.hostname = "fixupx.com";

  try {
    await navigator.clipboard.writeText(url.toString());
    copyBtn.textContent = "Skopiowano!";
  } catch (err) {
    copyBtn.textContent = "Błąd kopiowania";
  }

  setTimeout(() => {
  copyBtn.textContent = "Kopiuj link (fixupx)";
  }, 2000);
});


const toggle = document.getElementById("toggleContext");

chrome.storage.sync.get(["contextEnabled"], (result) => {
  toggle.checked = result.contextEnabled ?? true;
});

toggle.addEventListener("change", () => {
  chrome.storage.sync.set({
    contextEnabled: toggle.checked
  });
});