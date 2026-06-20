// TUTAJ MOŻESZ ZMIENIĆ EMOJI WEDŁUG UZNANIA
const EMOJI_FIXUP = "📋";   // Przycisk kopiowania fixupx
const EMOJI_XCANCEL = "🌐"; // Przycisk otwierania xcancel

// 1. FUNKCJA DLA PRZYCISKU FIXUPX (KOPIOWANIE)
function createFixupButton(tweetArticle) {
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "fixupx-btn-container";
    buttonContainer.title = "Kopiuj link (fixupx)";

    Object.assign(buttonContainer.style, {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        padding: "0 12px",
        minWidth: "36px",
        minHeight: "36px",
        borderRadius: "9999px",
        transition: "background-color 0.2s ease",
        fontSize: "16px",
        userSelect: "none"
    });

    buttonContainer.addEventListener("mouseenter", () => {
        buttonContainer.style.backgroundColor = "rgba(29, 155, 240, 0.1)";
    });
    buttonContainer.addEventListener("mouseleave", () => {
        buttonContainer.style.backgroundColor = "transparent";
    });

    buttonContainer.textContent = EMOJI_FIXUP;

    buttonContainer.addEventListener("click", async (e) => {
        e.stopPropagation();
        e.preventDefault();

        const linkElement = tweetArticle.querySelector('a[href*="/status/"]');
        let targetUrl = linkElement ? linkElement.href : window.location.href;

        if (targetUrl) {
            const url = new URL(targetUrl);
            url.hostname = "fixupx.com";

            try {
                // Zapis do schowka
                await navigator.clipboard.writeText(url.toString());

                // Efekt wizualny sukcesu - zmiana emoji na 2 sekundy
                buttonContainer.textContent = "✔️";
                setTimeout(() => {
                    buttonContainer.textContent = EMOJI_FIXUP;
                }, 2000);
            } catch (err) {
                console.error("Błąd kopiowania:", err);
            }
        }
    });

    return buttonContainer;
}

// 2. FUNKCJA DLA PRZYCISKU XCANCEL (OTWIERANIE)
function createXcancelButton(tweetArticle) {
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "xcancel-btn-container";
    buttonContainer.title = "Otwórz w xcancel";

    Object.assign(buttonContainer.style, {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        padding: "0 12px",
        minWidth: "36px",
        minHeight: "36px",
        borderRadius: "9999px",
        transition: "background-color 0.2s ease",
        fontSize: "16px",
        userSelect: "none"
    });

    buttonContainer.addEventListener("mouseenter", () => {
        buttonContainer.style.backgroundColor = "rgba(29, 155, 240, 0.1)";
    });
    buttonContainer.addEventListener("mouseleave", () => {
        buttonContainer.style.backgroundColor = "transparent";
    });

    buttonContainer.textContent = EMOJI_XCANCEL;

    buttonContainer.addEventListener("click", (e) => {
        e.stopPropagation();
        e.preventDefault();

        const linkElement = tweetArticle.querySelector('a[href*="/status/"]');
        let targetUrl = linkElement ? linkElement.href : window.location.href;

        if (targetUrl) {
            const url = new URL(targetUrl);
            url.hostname = "xcancel.com";
            window.open(url.toString(), "_blank");
        }
    });

    return buttonContainer;
}

// MAIN: Wstrzykiwanie obu przycisków na stronę
function injectButtons() {
    const tweets = document.querySelectorAll('article[role="article"]');

    tweets.forEach((tweet) => {
        // Sprawdzamy czy przyciski już istnieją (wystarczy sprawdzić jeden z nich)
        if (tweet.querySelector(".xcancel-btn-container") || tweet.querySelector(".fixupx-btn-container")) return;

        const actionGroup = tweet.querySelector('div[role="group"]');
        if (!actionGroup) return;

        // Szukamy ikony zakładki/udostępniania, przed którą wstawimy nasz duet
        const shareButton = actionGroup.querySelector('div[data-testid="bookmark"]')?.parentElement || actionGroup.lastElementChild;

        if (shareButton) {
            const fixupBtn = createFixupButton(tweet);
            const xcancelBtn = createXcancelButton(tweet);

            // Wstawiamy najpierw fixupx, a zaraz po nim xcancel (czyli xcancel będzie po prawej)
            shareButton.insertAdjacentElement("beforebegin", fixupBtn);
            shareButton.insertAdjacentElement("beforebegin", xcancelBtn);
        }
    });
}

// Obserwator zmian na stronie (dla dynamicznego ładowania)
const observer = new MutationObserver(() => {
    injectButtons();
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

injectButtons();
