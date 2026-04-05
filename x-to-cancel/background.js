const WHITELIST = ["x.com", "www.x.com"];

const ACTIONS = {
  copyFixupx: "fixupx.com",
  copyXcancel: "xcancel.com"
};

function createMenu(enabled) {
  chrome.contextMenus.removeAll(() => {
    if (!enabled) return;

    Object.entries(ACTIONS).forEach(([id, host]) => {
      chrome.contextMenus.create({
        id,
        title: `Kopiuj link jako ${host}`,
        contexts: ["page", "link"],
        documentUrlPatterns: ["*://x.com/*", "*://www.x.com/*"]
      });
    });
  });
}

function initMenu() {
  chrome.storage.sync.get(["contextEnabled"], (res) => {
    createMenu(res.contextEnabled ?? true);
  });
}

chrome.runtime.onInstalled.addListener(initMenu);
chrome.runtime.onStartup.addListener(initMenu);

chrome.storage.onChanged.addListener((changes) => {
  if (changes.contextEnabled) {
    createMenu(changes.contextEnabled.newValue);
  }
});

function showToast(tabId, message) {
  chrome.storage.sync.get(["toastEnabled"], (res) => {
    const enabled = res.toastEnabled ?? true;
    if (!enabled) return;

    chrome.scripting.executeScript({
      target: { tabId },
      func: (msg) => {
        const existing = document.getElementById("fixupx-toast");
        if (existing) existing.remove();

        const toast = document.createElement("div");
        toast.id = "fixupx-toast";
        toast.textContent = msg;

        Object.assign(toast.style, {
          position: "fixed",
          bottom: "20px",
          right: "20px",
          background: "#111",
          color: "#fff",
          padding: "10px 14px",
          borderRadius: "8px",
          fontSize: "13px",
          zIndex: 999999,
          opacity: "0",
          transform: "translateY(10px)",
          transition: "all 0.2s ease"
        });

        document.body.appendChild(toast);

        requestAnimationFrame(() => {
          toast.style.opacity = "1";
          toast.style.transform = "translateY(0)";
        });

        setTimeout(() => {
          toast.style.opacity = "0";
          toast.style.transform = "translateY(10px)";
          setTimeout(() => toast.remove(), 200);
        }, 1800);
      },
      args: [message]
    });
  });
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) return;
  let targetUrl = info.linkUrl;

  if (!targetUrl) {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const article = document.activeElement.closest("article") || document.querySelector("article");
        const link = article?.querySelector('a[href*="/status/"]');
        return link ? link.href : window.location.href;
      }
    });
    targetUrl = result?.result || tab.url;
  }

  const url = new URL(targetUrl);

  if (!WHITELIST.includes(url.hostname)) return;

  const newHost = ACTIONS[info.menuItemId];
  if (!newHost) return;

  url.hostname = newHost;
  const text = url.toString();

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: async (text) => {
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          const textarea = document.createElement("textarea");
          textarea.value = text;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand("copy");
          textarea.remove();
        }
      },
      args: [text]
    });

    showToast(tab.id, "Skopiowano link ✔");

  } catch (e) {
    console.error("Clipboard error:", e);
  }
});