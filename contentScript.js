// contentScript.js

// icons link: https://www.flaticon.com/free-icon/puzzle_1476174?term=jigsaw&related_id=1476174

// SAMPLE DATA (same as before)
const wikiGapData = {
  chinese: [
    "In ancient times, mooncakes were used as offerings during the Mid-Autumn Festival, but they have since become a festive treat and popular gift.",
    "About two hours before eating, you can move snow skin mooncakes to a 4°C refrigerator.",
    "In recent years, the rise of luxury mooncake packaging has led to their use for gifting and even bribery.",
    "In mainland China, some companies custom-make mooncakes for distributing them to clients, often featuring specially designed packaging and embossed patterns.",
    "In Chinese communities, mooncakes are only popular during the Mid-Autumn Festival, leading to post-holiday discounts and disposal by manufacturers."
  ],
  french: [
    "Some additional fact in French #1",
    "Some additional fact in French #2"
  ],
  russian: [
    "Some additional fact in Russian #1",
    "Some additional fact in Russian #2",
    "Some additional fact in Russian #3"
  ]
};

// A function to create a clickable number that, when clicked,
// shows the facts in a pop-up.
function createNumberLink(language, count) {
  const span = document.createElement("span");
  span.textContent = count;
  span.classList.add("wikigap-number-link");

  // On click, show the facts for the given language.
  span.addEventListener("click", () => {
    showFacts(language);
  });
  return span;
}

// This function creates a small, draggable pop-up (overlay) displaying the facts.
function showFacts(language) {
  // Remove any existing pop-up first:
  const existingPopup = document.getElementById("wikigap-facts-popup");
  if (existingPopup) {
    existingPopup.remove();
  }

  // Create a container for the facts
  const popup = document.createElement("div");
  popup.id = "wikigap-facts-popup";

  // Add a close button:
  const closeBtn = document.createElement("button");
  closeBtn.textContent = "Close";
  closeBtn.classList.add("wikigap-close-btn");
  closeBtn.addEventListener("click", () => {
    popup.remove();
  });

  const title = document.createElement("h3");
  title.textContent = `Facts from ${language.charAt(0).toUpperCase() + language.slice(1)} Wikipedia`;
  title.classList.add("wikigap-popup-title");

  // Create a **numbered** list of the facts using <ol>:
  const factList = document.createElement("ol");
  factList.classList.add("wikigap-ordered-list");
  wikiGapData[language].forEach((fact) => {
    const li = document.createElement("li");
    li.textContent = fact;
    factList.appendChild(li);
  });

  // Append elements:
  popup.appendChild(closeBtn);
  popup.appendChild(title);
  popup.appendChild(factList);
  document.body.appendChild(popup);

  // Position the popup (initially near 20% from top, 30% from left).
  popup.style.top = "20%";
  popup.style.left = "30%";

  // Make the popup draggable.
  makeDraggable(popup);
}

// A simple utility to make any element draggable.
function makeDraggable(element) {
  let isDragging = false;
  let offsetX, offsetY;

  // On mousedown, begin dragging
  element.addEventListener("mousedown", (e) => {
    // Only start drag if you're not clicking the close button
    if (e.target.classList.contains("wikigap-close-btn")) {
      return; // Don’t drag if user clicks on the button
    }
    isDragging = true;
    // `offsetX`/`offsetY` track the distance between the mouse and the top-left corner of the element
    offsetX = e.clientX - element.offsetLeft;
    offsetY = e.clientY - element.offsetTop;
    element.style.cursor = "move";
  });

  // On mousemove, if dragging, reposition the element
  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    // Because it's position:fixed, offset the top/left by the mouse movement
    element.style.left = (e.clientX - offsetX) + "px";
    element.style.top = (e.clientY - offsetY) + "px";
  });

  // On mouseup, stop dragging
  document.addEventListener("mouseup", () => {
    isDragging = false;
    element.style.cursor = "default";
  });
}

// Insert the “WikiGap” box at the top of the article (example).
(function injectWikiGapBox() {
  const target = document.querySelector("#content") || document.body; // Fallback if #content isn't found

  // Create a container div for our WikiGap notice
  const container = document.createElement("div");
  container.id = "wikigap-notice";

  // If you want an icon (puzzle piece, etc.), you can insert it here:
  // const icon = document.createElement("img");
  // icon.src = chrome.runtime.getURL("puzzle-icon.png");
  // icon.alt = "WikiGap Icon";
  // icon.classList.add("wikigap-icon");
  // container.appendChild(icon);

  // Build the main message
  const mainMessage = document.createElement("p");
  mainMessage.textContent = "More information is found by WikiGap! There are ";

  // Create numeric links for the facts
  const chineseSpan = createNumberLink("chinese", wikiGapData.chinese.length);
  const frenchSpan = createNumberLink("french", wikiGapData.french.length);
  const russianSpan = createNumberLink("russian", wikiGapData.russian.length);

  mainMessage.appendChild(document.createTextNode(" "));
  mainMessage.appendChild(chineseSpan);
  mainMessage.appendChild(document.createTextNode(" more facts found on the Chinese page; "));

  mainMessage.appendChild(frenchSpan);
  mainMessage.appendChild(document.createTextNode(" more facts found on the French page; "));

  mainMessage.appendChild(russianSpan);
  mainMessage.appendChild(document.createTextNode(" more facts found on the Russian page."));

  container.appendChild(mainMessage);

  // Insert the container at the top of the page (before the article)
  target.prepend(container);
})();