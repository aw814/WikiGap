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
  const articleTitle = document.querySelector('#firstHeading').textContent;
  
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

function showFactDetails(language) {
  // Example fact details based on language
  const languageMap = {
    'es': {
      name: 'Spanish',
      facts: [
        { title: 'History', content: 'Historical information about this topic in Spanish culture.' },
        { title: 'Making Process', content: 'How this is created or made in Spanish context.' },
        { title: 'Cultural Significance', content: 'Why this is important in Spanish-speaking countries.' }
      ],
      articleLink: 'https://es.wikipedia.org/wiki/Example'
    },
    'fr': {
      name: 'French',
      facts: [
        { title: 'History', content: 'Historical information about this topic in French culture.' },
        { title: 'Making Process', content: 'How this is created or made in French context.' },
        { title: 'Regional Variations', content: 'How this differs across French-speaking regions.' }
      ],
      articleLink: 'https://fr.wikipedia.org/wiki/Example'
    },
    'de': {
      name: 'German',
      facts: [
        { title: 'History', content: 'Historical information about this topic in German culture.' },
        { title: 'Technical Details', content: 'German engineering or technical aspects of this topic.' },
        { title: 'Cultural Impact', content: 'The influence of this topic on German society.' }
      ],
      articleLink: 'https://de.wikipedia.org/wiki/Example'
    },
    'it': {
      name: 'Italian',
      facts: [
        { title: 'Artistic Significance', content: 'The artistic value of this topic in Italian culture.' },
        { title: 'Regional Traditions', content: 'How this topic varies across different Italian regions.' },
        { title: 'Historical Context', content: 'The historical background of this topic in Italy.' }
      ],
      articleLink: 'https://it.wikipedia.org/wiki/Example'
    },
    'zh': {
      name: 'Chinese',
      facts: [
        { title: 'Historical Significance', content: 'The historical importance of this topic in Chinese culture.' },
        { title: 'Cultural Context', content: 'How this topic fits into broader Chinese cultural traditions.' }
      ],
      articleLink: 'https://zh.wikipedia.org/wiki/Example'
    },
    'ru': {
      name: 'Russian',
      facts: [
        { title: 'Historical Development', content: 'How this topic evolved in Russian history.' },
        { title: 'Cultural Importance', content: 'The significance of this topic in Russian society.' }
      ],
      articleLink: 'https://ru.wikipedia.org/wiki/Example'
    }
  };
  
  const factInfo = languageMap[language] || {
    name: language,
    facts: [
      { title: 'General Information', content: 'Basic information about this topic.' }
    ],
    articleLink: '#'
  };
  
  // Create fact detail panel
  const detailPanel = document.createElement('div');
  detailPanel.className = 'wikigap-detail-panel';
  
  // Generate the fact list HTML
  let factsListHTML = '';
  factInfo.facts.forEach((fact, index) => {
    factsListHTML += `
      <div class="wikigap-fact-list-item" data-fact-index="${index}">
        <div class="wikigap-fact-title">${fact.title}</div>
        <div class="wikigap-fact-arrow">→</div>
      </div>
    `;
  });
  
  // Add panel content - no flag in the title, just "Facts in [Language]"
  detailPanel.innerHTML = `
    <div class="wikigap-panel-header">
      <h2>Facts in ${factInfo.name}</h2>
      <button class="wikigap-close-btn">×</button>
    </div>
    <div class="wikigap-panel-content">
      <div class="wikigap-facts-list">
        ${factsListHTML}
      </div>
      <div class="wikigap-fact-view" style="display:none;">
        <button class="wikigap-back-btn">← Back to list</button>
        <div class="wikigap-fact-content"></div>
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
  
  // Remove underline from header
  const headerElement = detailPanel.querySelector('.wikigap-panel-header h2');
  if (headerElement) {
    headerElement.style.borderBottom = 'none';
    headerElement.style.textDecoration = 'none';
  }
  
  // Add to page
  document.body.appendChild(detailPanel);
  
  // Add event listeners
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
  
  factListItems.forEach(item => {
    item.addEventListener('click', () => {
      const factIndex = parseInt(item.getAttribute('data-fact-index'), 10);
      const fact = factInfo.facts[factIndex];
      
      // Update the content
      factContent.textContent = fact.content;
      
      // Show the fact view, hide the list
      factsList.style.display = 'none';
      factView.style.display = 'block';
    });
  });
  
  // Handle back button
  backBtn.addEventListener('click', () => {
    factView.style.display = 'none';
    factsList.style.display = 'block';
  });
  
  // Action buttons
  const translateBtn = detailPanel.querySelector('.wikigap-translate-btn');
  translateBtn.addEventListener('click', () => {
    translateBtn.classList.add('active');
    showNotification('Fact translated!');
    setTimeout(() => {
      translateBtn.classList.remove('active');
    }, 1000);
  });
  
  const audioBtn = detailPanel.querySelector('.wikigap-audio-btn');
  audioBtn.addEventListener('click', () => {
    audioBtn.classList.add('active');
    showNotification('Audio playback started!');
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