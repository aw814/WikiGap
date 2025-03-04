function initWikiGap() {
  // Add CSS styles to the page
  addStyles();
  
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
  const articleTitle = document.querySelector('#firstHeading').textContent;
  
  // Create container for WikiGap buttons
  const wikiGapContainer = document.createElement('div');
  wikiGapContainer.className = 'wikigap-container';
  
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
  
  // Add panel content
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
            <img src="${chrome.runtime.getURL('images/flags/es.png')}" alt="Spanish flag">
            <span>Spanish</span>
          </div>
          <div class="wikigap-fact-arrow">→</div>
        </div>
        <div class="wikigap-fact-item" data-lang="fr">
          <div class="wikigap-fact-number">3</div>
          <div class="wikigap-fact-language">
            <img src="${chrome.runtime.getURL('images/flags/fr.png')}" alt="French flag">
            <span>French</span>
          </div>
          <div class="wikigap-fact-arrow">→</div>
        </div>
        <div class="wikigap-fact-item" data-lang="de">
          <div class="wikigap-fact-number">2</div>
          <div class="wikigap-fact-language">
            <img src="${chrome.runtime.getURL('images/flags/de.png')}" alt="German flag">
            <span>German</span>
          </div>
          <div class="wikigap-fact-arrow">→</div>
        </div>
        <div class="wikigap-fact-item" data-lang="it">
          <div class="wikigap-fact-number">4</div>
          <div class="wikigap-fact-language">
            <img src="${chrome.runtime.getURL('images/flags/it.png')}" alt="Italian flag">
            <span>Italian</span>
          </div>
          <div class="wikigap-fact-arrow">→</div>
        </div>
        <div class="wikigap-fact-item" data-lang="zh">
          <div class="wikigap-fact-number">1</div>
          <div class="wikigap-fact-language">
            <img src="${chrome.runtime.getURL('images/flags/cn.png')}" alt="Chinese flag">
            <span>Chinese</span>
          </div>
          <div class="wikigap-fact-arrow">→</div>
        </div>
        <div class="wikigap-fact-item" data-lang="ru">
          <div class="wikigap-fact-number">1</div>
          <div class="wikigap-fact-language">
            <img src="${chrome.runtime.getURL('images/flags/ru.png')}" alt="Russian flag">
            <span>Russian</span>
          </div>
          <div class="wikigap-fact-arrow">→</div>
        </div>
      </div>
    </div>
  `;
  
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

function showFactDetails(language) {
  // Example fact details based on language
  const languageMap = {
    'es': {
      name: 'Spanish',
      fact: 'En España, este artículo es conocido por...',
      articleLink: 'https://es.wikipedia.org/wiki/Example'
    },
    'fr': {
      name: 'French',
      fact: 'En France, cet article est connu pour...',
      articleLink: 'https://fr.wikipedia.org/wiki/Example'
    },
    'de': {
      name: 'German',
      fact: 'In Deutschland ist dieser Artikel bekannt für...',
      articleLink: 'https://de.wikipedia.org/wiki/Example'
    },
    'it': {
      name: 'Italian',
      fact: 'In Italia, questo articolo è conosciuto per...',
      articleLink: 'https://it.wikipedia.org/wiki/Example'
    },
    'zh': {
      name: 'Chinese',
      fact: '在中国，这篇文章因...而闻名',
      articleLink: 'https://zh.wikipedia.org/wiki/Example'
    },
    'ru': {
      name: 'Russian',
      fact: 'В России эта статья известна...',
      articleLink: 'https://ru.wikipedia.org/wiki/Example'
    }
  };
  
  const factInfo = languageMap[language] || {
    name: language,
    fact: 'Additional information in this language.',
    articleLink: '#'
  };
  
  // Create fact detail panel
  const detailPanel = document.createElement('div');
  detailPanel.className = 'wikigap-detail-panel';
  
  // Add panel content
  detailPanel.innerHTML = `
    <div class="wikigap-panel-header">
      <h2>
        <img src="${chrome.runtime.getURL(`images/flags/${language}.png`)}" alt="${factInfo.name} flag">
        Fact in ${factInfo.name}
      </h2>
      <button class="wikigap-close-btn">×</button>
    </div>
    <div class="wikigap-panel-content">
      <div class="wikigap-fact-detail">
        <div class="wikigap-fact-text">
          ${factInfo.fact}
        </div>
        <div class="wikigap-fact-meta">
          <a href="${factInfo.articleLink}" target="_blank" class="wikigap-source-link">
            View in ${factInfo.name} Wikipedia
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
  
  // Add to page
  document.body.appendChild(detailPanel);
  
  // Add event listeners
  const closeBtn = detailPanel.querySelector('.wikigap-close-btn');
  closeBtn.addEventListener('click', () => {
    detailPanel.classList.add('closing');
    setTimeout(() => detailPanel.remove(), 300);
  });
  
  const translateBtn = detailPanel.querySelector('.wikigap-translate-btn');
  translateBtn.addEventListener('click', () => {
    const factText = detailPanel.querySelector('.wikigap-fact-text');
    factText.innerHTML = 'Translated text would appear here. This is a placeholder for the translation feature.';
    translateBtn.classList.add('active');
    showNotification('Fact translated!');
  });
  
  const audioBtn = detailPanel.querySelector('.wikigap-audio-btn');
  audioBtn.addEventListener('click', () => {
    audioBtn.classList.add('active');
    showNotification('Audio playback started!');
    // Audio playback logic would go here
    setTimeout(() => {
      audioBtn.classList.remove('active');
    }, 3000);
  });
  
  const shareBtn = detailPanel.querySelector('.wikigap-share-btn');
  shareBtn.addEventListener('click', () => {
    shareBtn.classList.add('active');
    showNotification('Fact link copied to clipboard!');
    setTimeout(() => {
      shareBtn.classList.remove('active');
    }, 1000);
  });
  
  // Animate in
  setTimeout(() => detailPanel.classList.add('active'), 10);
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