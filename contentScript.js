/****************************
 * WikiGap Content Script
 ****************************/

// Execute immediately rather than waiting for DOMContentLoaded
function initWikiGap() {
  // Wait for Wikipedia page to fully load
  if (document.querySelector('#firstHeading')) {
    initialize();
  } else {
    // For cases where Wikipedia might load content dynamically
    // or if the script loads before the page content
    const observer = new MutationObserver((mutations, obs) => {
      if (document.querySelector('#firstHeading')) {
        initialize();
        obs.disconnect();
      }
    });
    
    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true
    });
  }
}

// Start the extension
initWikiGap();

// content.js - Main script that runs on Wikipedia pages
document.addEventListener('DOMContentLoaded', () => {
  // Wait for Wikipedia page to fully load
  if (document.querySelector('#firstHeading')) {
    initialize();
  } else {
    // For cases where Wikipedia might load content dynamically
    const observer = new MutationObserver((mutations, obs) => {
      if (document.querySelector('#firstHeading')) {
        initialize();
        obs.disconnect();
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
});

function initialize() {
  // Get current language and article information
  const currentLang = document.documentElement.lang || 'en';
  const articleTitle = document.querySelector('#firstHeading')?.textContent || 'Unknown Article';
  
  // Create container for WikiGap buttons
  const wikiGapContainer = document.createElement('div');
  wikiGapContainer.className = 'wikigap-container';
  wikiGapContainer.style.display = 'flex';
  wikiGapContainer.style.flexDirection = 'row';
  wikiGapContainer.style.gap = '10px';
  
  // Insert container after the heading
  const firstHeading = document.querySelector('#firstHeading');
  if (firstHeading && firstHeading.parentNode) {
    firstHeading.parentNode.insertBefore(wikiGapContainer, firstHeading.nextSibling);
  }
  
  // Add Settings button
  const settingsButton = createButton('Settings', 'wikigap-btn wikigap-settings-btn');
  wikiGapContainer.appendChild(settingsButton);
  
  // Add Facts button (with dynamic count)
  const factCount = getFactCount(); // Function to get available facts count
  const factsButton = createButton(`${factCount} Facts`, 'wikigap-btn wikigap-facts-btn');
  wikiGapContainer.appendChild(factsButton);
  
  // Event listeners for buttons
  settingsButton.addEventListener('click', showSettingsPanel);
  factsButton.addEventListener('click', showFactsPanel);
}

function createButton(text, className) {
  const button = document.createElement('button');
  button.className = className;
  button.textContent = text;
  
  // Create an icon element
  const icon = document.createElement('span');
  icon.className = 'wikigap-btn-icon';
  
  // Icon content will be set via CSS for better control
  button.prepend(icon);
  
  return button;
}

function getFactCount() {
  // This would be dynamic in the real implementation
  // For now returning a sample count
  return 12;
}

function showSettingsPanel() {
  // Remove any existing panels first
  removeExistingPanels();
  
  // Create settings panel
  const settingsPanel = document.createElement('div');
  settingsPanel.className = 'wikigap-settings-panel';
  
  // Add panel content
  settingsPanel.innerHTML = `
    <div class="wikigap-panel-header">
      <h2>WikiGap Settings</h2>
      <button class="wikigap-close-btn">×</button>
    </div>
    <div class="wikigap-panel-content">
      <div class="wikigap-setting-group">
        <h3>Language Preferences</h3>
        <p>Select languages you're interested in learning more facts about:</p>
        <div class="wikigap-language-options">
          <label class="wikigap-checkbox">
            <input type="checkbox" name="lang-es" checked> 
            <span class="checkmark"></span>
            Spanish
          </label>
          <label class="wikigap-checkbox">
            <input type="checkbox" name="lang-fr" checked> 
            <span class="checkmark"></span>
            French
          </label>
          <label class="wikigap-checkbox">
            <input type="checkbox" name="lang-de"> 
            <span class="checkmark"></span>
            German
          </label>
          <label class="wikigap-checkbox">
            <input type="checkbox" name="lang-it"> 
            <span class="checkmark"></span>
            Italian
          </label>
          <label class="wikigap-checkbox">
            <input type="checkbox" name="lang-zh"> 
            <span class="checkmark"></span>
            Chinese
          </label>
          <label class="wikigap-checkbox">
            <input type="checkbox" name="lang-ru"> 
            <span class="checkmark"></span>
            Russian
          </label>
        </div>
      </div>
      
      <div class="wikigap-setting-group">
        <h3>Display Options</h3>
        <div class="wikigap-option">
          <label for="wikigap-auto-translate">Auto-translate facts:</label>
          <label class="wikigap-switch">
            <input type="checkbox" id="wikigap-auto-translate" checked>
            <span class="slider"></span>
          </label>
        </div>
        <div class="wikigap-option">
          <label for="wikigap-show-source">Show information source:</label>
          <label class="wikigap-switch">
            <input type="checkbox" id="wikigap-show-source" checked>
            <span class="slider"></span>
          </label>
        </div>
        <div class="wikigap-option">
          <label for="wikigap-highlight">Highlight matching content:</label>
          <label class="wikigap-switch">
            <input type="checkbox" id="wikigap-highlight">
            <span class="slider"></span>
          </label>
        </div>
      </div>
      
      <div class="wikigap-setting-group">
        <h3>Theme</h3>
        <div class="wikigap-theme-options">
          <label class="wikigap-radio">
            <input type="radio" name="theme" value="light" checked> 
            <span class="radio-mark"></span>
            Light
          </label>
          <label class="wikigap-radio">
            <input type="radio" name="theme" value="dark"> 
            <span class="radio-mark"></span>
            Dark
          </label>
          <label class="wikigap-radio">
            <input type="radio" name="theme" value="auto"> 
            <span class="radio-mark"></span>
            Match Wikipedia
          </label>
        </div>
      </div>
      
      <div class="wikigap-buttons">
        <button class="wikigap-btn wikigap-reset-btn">Reset to Default</button>
        <button class="wikigap-btn wikigap-save-btn">Save Settings</button>
      </div>
    </div>
  `;
  
  // Add to page
  document.body.appendChild(settingsPanel);
  
  // Add event listeners
  const closeBtn = settingsPanel.querySelector('.wikigap-close-btn');
  closeBtn.addEventListener('click', () => {
    settingsPanel.classList.add('closing');
    setTimeout(() => settingsPanel.remove(), 300);
  });
  
  const saveBtn = settingsPanel.querySelector('.wikigap-save-btn');
  saveBtn.addEventListener('click', () => {
    // Save settings logic would go here
    settingsPanel.classList.add('closing');
    setTimeout(() => {
      settingsPanel.remove();
      showNotification('Settings saved successfully!');
    }, 300);
  });
  
  const resetBtn = settingsPanel.querySelector('.wikigap-reset-btn');
  resetBtn.addEventListener('click', () => {
    // Reset settings logic would go here
    showNotification('Settings reset to default!');
  });
  
  // Animate in
  setTimeout(() => settingsPanel.classList.add('active'), 10);
}

function showFactsPanel() {
  // Remove any existing panels first
  removeExistingPanels();
  
  // Create facts panel
  const factsPanel = document.createElement('div');
  factsPanel.className = 'wikigap-facts-panel';
  
  // Add panel content with emoji flags instead of images
  factsPanel.innerHTML = `
    <div class="wikigap-panel-header">
      <h2>More Facts</h2>
      <button class="wikigap-close-btn">×</button>
    </div>
    <div class="wikigap-panel-content">
      <div class="wikigap-facts-list">
        <div class="wikigap-fact-item" data-lang="es">
          <div class="wikigap-fact-number">1</div>
          <div class="wikigap-fact-language">
            <span class="wikigap-flag-emoji">🇪🇸</span>
            <span>Spanish</span>
          </div>
          <div class="wikigap-fact-arrow">→</div>
        </div>
        <div class="wikigap-fact-item" data-lang="fr">
          <div class="wikigap-fact-number">3</div>
          <div class="wikigap-fact-language">
            <span class="wikigap-flag-emoji">🇫🇷</span>
            <span>French</span>
          </div>
          <div class="wikigap-fact-arrow">→</div>
        </div>
        <div class="wikigap-fact-item" data-lang="de">
          <div class="wikigap-fact-number">2</div>
          <div class="wikigap-fact-language">
            <span class="wikigap-flag-emoji">🇩🇪</span>
            <span>German</span>
          </div>
          <div class="wikigap-fact-arrow">→</div>
        </div>
        <div class="wikigap-fact-item" data-lang="it">
          <div class="wikigap-fact-number">4</div>
          <div class="wikigap-fact-language">
            <span class="wikigap-flag-emoji">🇮🇹</span>
            <span>Italian</span>
          </div>
          <div class="wikigap-fact-arrow">→</div>
        </div>
        <div class="wikigap-fact-item" data-lang="zh">
          <div class="wikigap-fact-number">1</div>
          <div class="wikigap-fact-language">
            <span class="wikigap-flag-emoji">🇨🇳</span>
            <span>Chinese</span>
          </div>
          <div class="wikigap-fact-arrow">→</div>
        </div>
        <div class="wikigap-fact-item" data-lang="ru">
          <div class="wikigap-fact-number">1</div>
          <div class="wikigap-fact-language">
            <span class="wikigap-flag-emoji">🇷🇺</span>
            <span>Russian</span>
          </div>
          <div class="wikigap-fact-arrow">→</div>
        </div>
      </div>
    </div>
  `;
  
  // Remove underline from header
  const headerElement = factsPanel.querySelector('.wikigap-panel-header h2');
  if (headerElement) {
    headerElement.style.borderBottom = 'none';
    headerElement.style.textDecoration = 'none';
  }
  
  // Add to page
  document.body.appendChild(factsPanel);
  
  // Add event listeners
  const closeBtn = factsPanel.querySelector('.wikigap-close-btn');
  closeBtn.addEventListener('click', () => {
    factsPanel.classList.add('closing');
    setTimeout(() => factsPanel.remove(), 300);
  });
  
  // Make fact items clickable
  const factItems = factsPanel.querySelectorAll('.wikigap-fact-item');
  factItems.forEach(item => {
    item.addEventListener('click', () => {
      const language = item.getAttribute('data-lang');
      showFactDetails(language);
      factsPanel.classList.add('closing');
      setTimeout(() => factsPanel.remove(), 300);
    });
    
    // Add hover effect
    item.addEventListener('mouseenter', () => {
      item.classList.add('hovering');
    });
    
    item.addEventListener('mouseleave', () => {
      item.classList.remove('hovering');
    });
  });
  
  // Animate in
  setTimeout(() => factsPanel.classList.add('active'), 10);
}

/**
 * Return static facts about "mooncake" in ENGLISH by default,
 * but also store the original language text for when users hit "Translate".
 */
async function fetchFactsForLanguage(language) {
  // We'll store both English and Original in each fact object.
  // The extension shows English by default, toggling to the original when "Translate" is clicked.
  
  // Basic structure:
  // {
  //   languageName: "Spanish",
  //   facts: [
  //     {
  //       englishTitle: "History (English)",
  //       englishContent: "Mooncakes are a Chinese pastry associated with the Mid-Autumn Festival.",
  //       originalTitle: "Origen (Spanish)",
  //       originalContent: "El pastel de luna (mooncake) es ..."
  //     },
  //     ...
  //   ],
  //   articleLink: "https://es.wikipedia.org/wiki/Pastel_de_luna"
  // }
  
  // Default fallback in case a language is not in the switch-case
  let data = {
    languageName: "Unknown",
    facts: [
      {
        englishTitle: "General Fact",
        englishContent:
          "Mooncakes are a traditional Chinese pastry typically eaten during the Mid-Autumn Festival.",
        originalTitle: "General Fact (Unknown)",
        originalContent:
          "No information available in the original language for this demo."
      }
    ],
    articleLink: "#"
  };

  switch (language) {
    case "es":
      data = {
        languageName: "Spanish",
        facts: [
          {
            englishTitle: "Origin (English)",
            englishContent:
              "Mooncakes are a traditional Chinese pastry, often eaten during the Mid-Autumn Festival. In Spanish-speaking regions, they're also appreciated as a cultural treat.",
            originalTitle: "Origen (Spanish)",
            originalContent:
              "El pastel de luna (mooncake) es un postre tradicional chino consumido durante el Festival de Medio Otoño."
          },
          {
            englishTitle: "Fillings (English)",
            englishContent:
              "Common fillings include lotus seed paste, red bean paste, and salted egg yolk.",
            originalTitle: "Rellenos (Spanish)",
            originalContent:
              "Los rellenos comunes incluyen pasta de semillas de loto, pasta de frijoles rojos y yema de huevo salada."
          },
          {
            englishTitle: "Historical Anecdote (English)",
            englishContent:
              "Sometimes, mooncakes were used to pass secret messages during historical periods in China.",
            originalTitle: "Curiosidad (Spanish)",
            originalContent:
              "A veces se utilizaban para enviar mensajes ocultos durante la historia de China."
          }
        ],
        articleLink: "https://es.wikipedia.org/wiki/Pastel_de_luna"
      };
      break;

    case "fr":
      data = {
        languageName: "French",
        facts: [
          {
            englishTitle: "History (English)",
            englishContent:
              "The mooncake is closely linked with the Mid-Autumn Festival. French enthusiasts enjoy it as an exotic pastry.",
            originalTitle: "Histoire (French)",
            originalContent:
              "Le mooncake est traditionnellement associé à la Fête de la mi-automne en Chine."
          },
          {
            englishTitle: "Varieties (English)",
            englishContent:
              "Popular flavors include lotus seed paste, red bean paste, and taro paste.",
            originalTitle: "Variétés (French)",
            originalContent:
              "Les saveurs courantes comprennent la pâte de graines de lotus, la purée de haricots rouges et la pâte de taro."
          },
          {
            englishTitle: "Cultural Importance (English)",
            englishContent:
              "Giving and sharing mooncakes symbolizes family reunion and longevity.",
            originalTitle: "Importance culturelle (French)",
            originalContent:
              "Offrir et partager des mooncakes symbolise la réunion familiale et la longévité."
          }
        ],
        articleLink: "https://fr.wikipedia.org/wiki/Mooncake"
      };
      break;

    case "de":
      data = {
        languageName: "German",
        facts: [
          {
            englishTitle: "Background (English)",
            englishContent:
              "Mooncake is a traditional pastry from China, enjoyed especially during the Moon Festival. Some Germans also appreciate them for cultural exchange.",
            originalTitle: "Hintergrund (German)",
            originalContent:
              "Der Mondkuchen (Mooncake) ist ein traditionelles Gebäck aus China und wird zum Mondfest verzehrt."
          },
          {
            englishTitle: "Fillings (English)",
            englishContent:
              "Typical fillings include lotus seed paste, red bean paste, and salted egg yolk.",
            originalTitle: "Füllungen (German)",
            originalContent:
              "Häufige Füllungen sind Lotuspaste, rote Bohnenpaste und gesalzene Eigelbe."
          },
          {
            englishTitle: "Tradition (English)",
            englishContent:
              "The tradition of gifting mooncakes symbolizes togetherness and prosperity.",
            originalTitle: "Tradition (German)",
            originalContent:
              "Das Verschenken von Mondkuchen symbolisiert Zusammengehörigkeit und Wohlstand."
          }
        ],
        articleLink: "https://de.wikipedia.org/wiki/Mondkuchen"
      };
      break;

    case "it":
      data = {
        languageName: "Italian",
        facts: [
          {
            englishTitle: "Origin (English)",
            englishContent:
              "Mooncake is a classic Chinese dessert, consumed especially during the Mid-Autumn Festival. Italians might find it similar to certain festive pastries.",
            originalTitle: "Origine (Italian)",
            originalContent:
              "Il mooncake è un dolce tradizionale cinese, consumato principalmente durante la Festa di Metà Autunno."
          },
          {
            englishTitle: "Common Fillings (English)",
            englishContent:
              "Lotus seed paste, red bean paste, and salted egg yolks are the most common fillings.",
            originalTitle: "Ripieni Comuni (Italian)",
            originalContent:
              "Le farciture più diffuse includono pasta di semi di loto, pasta di fagioli rossi e tuorli d’uovo salati."
          },
          {
            englishTitle: "Significance (English)",
            englishContent:
              "They represent family unity and good fortune, often exchanged among friends and relatives.",
            originalTitle: "Significato (Italian)",
            originalContent:
              "Simbolizza l’unione familiare e la fortuna, spesso scambiato come dono tra amici e parenti."
          }
        ],
        articleLink: "https://it.wikipedia.org/wiki/Mooncake"
      };
      break;

    case "zh":
      data = {
        languageName: "Chinese",
        facts: [
          {
            englishTitle: "Origin (English)",
            englishContent:
              "Mooncakes are Chinese pastries mainly eaten during the Mid-Autumn Festival to celebrate the harvest moon.",
            originalTitle: "起源 (Chinese)",
            originalContent:
              "月饼是中国传统糕点，主要用于中秋节祭月、赏月等活动。"
          },
          {
            englishTitle: "Common Fillings (English)",
            englishContent:
              "Lotus seed paste, red bean paste, salted egg yolk, and assorted nuts are common.",
            originalTitle: "常见馅料 (Chinese)",
            originalContent:
              "莲蓉、豆沙、蛋黄、五仁等口味都十分常见。"
          },
          {
            englishTitle: "Cultural Meaning (English)",
            englishContent:
              "They symbolize family reunion and are exchanged as gifts among relatives and friends.",
            originalTitle: "文化意义 (Chinese)",
            originalContent:
              "月饼象征团圆与和谐，亲友之间互相赠送以表思念。"
          }
        ],
        articleLink: "https://zh.wikipedia.org/wiki/月饼"
      };
      break;

    case "ru":
      data = {
        languageName: "Russian",
        facts: [
          {
            englishTitle: "History (English)",
            englishContent:
              "Mooncake is a traditional Chinese pastry tied to the Mid-Autumn Festival. Some Russian bakeries have begun to sell them as a cultural curiosity.",
            originalTitle: "История (Russian)",
            originalContent:
              "Мункейк — традиционная китайская выпечка, связанная с Праздником середины осени."
          },
          {
            englishTitle: "Fillings (English)",
            englishContent:
              "Popular fillings include lotus seed paste, red bean paste, and salted egg yolks.",
            originalTitle: "Начинки (Russian)",
            originalContent:
              "Популярные начинки включают пасту из лотосовых семян, пасту из красной фасоли и солёные яичные желтки."
          },
          {
            englishTitle: "Tradition (English)",
            englishContent:
              "Gifting mooncakes to relatives and friends is a symbol of unity and happiness.",
            originalTitle: "Традиция (Russian)",
            originalContent:
              "Принято дарить лунные пряники родственникам и друзьям как символ единения и счастья."
          }
        ],
        articleLink: "https://ru.wikipedia.org/wiki/Мункейк"
      };
      break;
      
    default:
      // The 'data' variable is already set to the fallback above
      break;
  }

  // Simulate an async delay (just for demonstration)
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), 500);
  });
}

async function showFactDetails(language) {
  // Remove any existing panels first
  removeExistingPanels();
  
  // Create a panel (initially showing a loading message)
  const detailPanel = document.createElement('div');
  detailPanel.className = 'wikigap-detail-panel';
  
  detailPanel.innerHTML = `
    <div class="wikigap-panel-header">
      <h2>Loading facts...</h2>
      <button class="wikigap-close-btn">×</button>
    </div>
    <div class="wikigap-panel-content">
      <p>Fetching facts about mooncakes in <strong>${language}</strong>. Please wait...</p>
    </div>
  `;
  document.body.appendChild(detailPanel);
  
  // Animate in
  setTimeout(() => detailPanel.classList.add('active'), 10);

  // Fetch the data (which includes both English and Original)
  const factInfo = await fetchFactsForLanguage(language);

  // Once data is fetched, update the panel with the real content
  detailPanel.innerHTML = `
    <div class="wikigap-panel-header">
      <h2>Facts in ${factInfo.languageName} (English by default)</h2>
      <button class="wikigap-close-btn">×</button>
    </div>
    <div class="wikigap-panel-content">
      <div class="wikigap-facts-list">
        ${factInfo.facts
          .map(
            (fact, index) => `
          <div class="wikigap-fact-list-item" data-fact-index="${index}">
            <div class="wikigap-fact-title">
              ${fact.englishTitle}
            </div>
            <div class="wikigap-fact-arrow">→</div>
          </div>
        `
          )
          .join('')}
      </div>
      <div class="wikigap-fact-view" style="display:none;">
        <button class="wikigap-back-btn">← Back to list</button>
        <div class="wikigap-fact-content"></div>
        <div class="wikigap-fact-meta">
          <a href="${factInfo.articleLink}" target="_blank" class="wikigap-source-link">
            View in ${factInfo.languageName} Wikipedia
            <span class="wikigap-external-icon">↗</span>
          </a>
          <div class="wikigap-detail-actions">
            <button class="wikigap-action-btn wikigap-translate-btn">
              <span class="wikigap-btn-icon translate-icon"></span>
              Translate
            </button>
            <button class="wikigap-action-btn wikigap-audio-btn">
              <span class="wikigap-btn-icon audio-icon"></span>
              Listen
            </button>
            <button class="wikigap-action-btn wikigap-share-btn">
              <span class="wikigap-btn-icon share-icon"></span>
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Remove underline from header (optional style tweak)
  const headerElement = detailPanel.querySelector('.wikigap-panel-header h2');
  if (headerElement) {
    headerElement.style.borderBottom = 'none';
    headerElement.style.textDecoration = 'none';
  }
  
  // Add close button event listener
  const closeBtn = detailPanel.querySelector('.wikigap-close-btn');
  closeBtn.addEventListener('click', () => {
    detailPanel.classList.add('closing');
    setTimeout(() => detailPanel.remove(), 300);
  });
  
  // Handle fact list items
  const factListItems = detailPanel.querySelectorAll('.wikigap-fact-list-item');
  const factView = detailPanel.querySelector('.wikigap-fact-view');
  const factContent = detailPanel.querySelector('.wikigap-fact-content');
  const factsList = detailPanel.querySelector('.wikigap-facts-list');
  const backBtn = detailPanel.querySelector('.wikigap-back-btn');

  // We'll keep track of the current fact and whether it's translated or not
  let currentFactIndex = -1;
  let isTranslated = false;

  factListItems.forEach(item => {
    item.addEventListener('click', () => {
      currentFactIndex = parseInt(item.getAttribute('data-fact-index'), 10);
      isTranslated = false; // reset translation state each time a new fact is clicked
      showFactInEnglish(currentFactIndex);
      
      // Show the fact view, hide the list
      factsList.style.display = 'none';
      factView.style.display = 'block';
    });
  });
  
  // Display the fact in English
  function showFactInEnglish(factIndex) {
    const fact = factInfo.facts[factIndex];
    factContent.innerHTML = `
      <h3>${fact.englishTitle}</h3>
      <p>${fact.englishContent}</p>
    `;
  }

  // Display the fact in the original language
  function showFactInOriginal(factIndex) {
    const fact = factInfo.facts[factIndex];
    factContent.innerHTML = `
      <h3>${fact.originalTitle}</h3>
      <p>${fact.originalContent}</p>
    `;
  }

  // Handle back button
  backBtn.addEventListener('click', () => {
    factView.style.display = 'none';
    factsList.style.display = 'block';
  });
  
  // Action buttons
  const translateBtn = detailPanel.querySelector('.wikigap-translate-btn');
  translateBtn.addEventListener('click', () => {
    if (currentFactIndex < 0) return;

    if (!isTranslated) {
      // Switch to original language
      showFactInOriginal(currentFactIndex);
      showNotification('Showing original language');
      translateBtn.classList.add('active');
      isTranslated = true;
    } else {
      // Switch back to English
      showFactInEnglish(currentFactIndex);
      showNotification('Showing English version');
      translateBtn.classList.remove('active');
      isTranslated = false;
    }
  });
  
  const audioBtn = detailPanel.querySelector('.wikigap-audio-btn');
  audioBtn.addEventListener('click', () => {
    audioBtn.classList.add('active');
    showNotification('Audio playback started! (Fake audio for demo)');
    setTimeout(() => {
      audioBtn.classList.remove('active');
    }, 3000);
  });
  
  const shareBtn = detailPanel.querySelector('.wikigap-share-btn');
  shareBtn.addEventListener('click', () => {
    shareBtn.classList.add('active');
    showNotification('Fact link copied to clipboard! (Demo action)');
    setTimeout(() => {
      shareBtn.classList.remove('active');
    }, 1000);
  });
}

function removeExistingPanels() {
  const existingPanels = document.querySelectorAll('.wikigap-settings-panel, .wikigap-facts-panel, .wikigap-detail-panel');
  existingPanels.forEach(panel => {
    panel.classList.add('closing');
    setTimeout(() => panel.remove(), 300);
  });
}

function showNotification(message) {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'wikigap-notification';
  notification.textContent = message;
  
  // Add to page
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => notification.classList.add('active'), 10);
  
  // Auto-remove after delay
  setTimeout(() => {
    notification.classList.remove('active');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}