// Execute immediately rather than waiting for DOMContentLoaded
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

// Add all required styles
function addStyles() {
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    :root {
      --primary-color: #4361EE;
      --primary-light: #4361EE15;
      --primary-dark: #3A56D4;
      --background-color: #F7F9FC;
      --card-background: white;
      --text-color: #333;
      --text-secondary: #666;
      --accent-color: #FF6B6B;
      --accent-hover: #FF5252;
      --success-color: #2ECB71;
      --border-radius: 18px;
      --shadow: 0 10px 30px rgba(67, 97, 238, 0.15);
      --transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }
    
    .wikigap-container {
      margin: 15px 0;
    }
    
    .wikigap-btn {
      background-color: var(--primary-color);
      color: white;
      border: none;
      border-radius: 10px;
      padding: 8px 16px;
      margin-right: 10px;
      cursor: pointer;
      font-weight: 500;
      transition: var(--transition);
      display: flex;
      align-items: center;
    }
    
    .wikigap-btn:hover {
      background-color: var(--primary-dark);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }
    
    .wikigap-btn:active {
      transform: translateY(0);
    }
    
    .wikigap-btn-icon {
      margin-right: 8px;
    }
    
    /* Panel styles */
    .wikigap-panel {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.95);
      background-color: var(--card-background);
      width: 420px;
      max-width: 90vw;
      border-radius: var(--border-radius);
      box-shadow: var(--shadow);
      z-index: 10000;
      opacity: 0;
      transition: var(--transition);
      overflow: hidden;
    }
    
    .wikigap-panel.active {
      transform: translate(-50%, -50%) scale(1);
      opacity: 1;
    }
    
    .wikigap-panel.closing {
      transform: translate(-50%, -50%) scale(0.95);
      opacity: 0;
    }
    
    .wikigap-panel-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(5px);
      z-index: 9999;
      opacity: 0;
      transition: var(--transition);
    }
    
    .wikigap-panel-overlay.active {
      opacity: 1;
    }
    
    .wikigap-panel-overlay.closing {
      opacity: 0;
    }
    
    .wikigap-panel-header {
      background-color: var(--primary-color);
      color: white;
      padding: 14px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
    }
    
    .wikigap-panel-header h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      position: relative;
      z-index: 1;
    }
    
    .wikigap-close-btn-container {
      position: relative;
      z-index: 1;
    }
    
    .wikigap-close-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
      width: 32px;
      height: 32px;
      line-height: 1;
      border-radius: 50%;
      opacity: 0.9;
      transition: var(--transition);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    
    .wikigap-close-btn-ripple {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.5);
      transform: scale(0);
      opacity: 0;
      pointer-events: none;
    }
    
    .wikigap-close-btn:hover {
      opacity: 1;
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.1);
    }
    
    .wikigap-close-btn:hover .wikigap-close-btn-ripple {
      animation: ripple 0.6s ease-out;
    }
    
    @keyframes ripple {
      0% {
        transform: scale(0.3);
        opacity: 0.5;
      }
      100% {
        transform: scale(1.5);
        opacity: 0;
      }
    }
    
    .wikigap-close-btn:active {
      transform: scale(0.95);
    }
    
    .wikigap-panel-content {
      max-height: 480px;
      overflow-y: auto;
      overflow-x: hidden;
      position: relative;
      scrollbar-width: thin;
      scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
    }
    
    /* Custom scrollbar styling */
    .wikigap-panel-content::-webkit-scrollbar {
      width: 6px;
    }
    
    .wikigap-panel-content::-webkit-scrollbar-track {
      background: transparent;
      margin: 8px 0;
    }
    
    .wikigap-panel-content::-webkit-scrollbar-thumb {
      background-color: rgba(0, 0, 0, 0.2);
      border-radius: 10px;
    }
    
    .wikigap-panel-content::-webkit-scrollbar-thumb:hover {
      background-color: rgba(0, 0, 0, 0.3);
    }
    
    /* Facts panel styling */
    .wikigap-facts-list {
      padding: 6px 0;
    }
    
    .wikigap-fact-item {
      display: flex;
      padding: 14px 24px;
      border-bottom: 1px solid #eef2f6;
      cursor: pointer;
      transition: var(--transition);
      position: relative;
      align-items: center;
    }
    
    .wikigap-fact-item::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 0;
      background-color: var(--primary-color);
      transition: var(--transition);
      opacity: 0.8;
    }
    
    .wikigap-fact-item:last-child {
      border-bottom: none;
    }
    
    .wikigap-fact-item:hover {
      background-color: var(--primary-light);
      transform: translateX(4px);
    }
    
    .wikigap-fact-item:active {
      transform: translateX(2px) scale(0.98);
    }
    
    .wikigap-fact-item.selected {
      background-color: var(--primary-light);
    }
    
    .wikigap-fact-item:hover::before {
      width: 4px;
    }
    
    .wikigap-fact-item.selected::before {
      width: 4px;
    }
    
    .wikigap-fact-number {
      flex: 0 0 32px;
      font-weight: 600;
      color: var(--primary-color);
      font-size: 15px;
      position: relative;
      z-index: 1;
    }
    
    .wikigap-fact-language {
      flex: 1;
      font-weight: 500;
      font-size: 15px;
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      transition: var(--transition);
    }
    
    .wikigap-fact-item:hover .wikigap-fact-language {
      transform: translateX(4px);
    }
    
    .wikigap-flag-emoji {
      margin-right: 12px;
      font-size: 20px;
      opacity: 0.9;
      transform: translateY(1px);
    }
    
    .wikigap-fact-item:hover .wikigap-flag-emoji {
      animation: gentleWiggle 0.6s ease;
    }
    
    @keyframes gentleWiggle {
      0%, 100% { transform: translateY(1px) rotate(0deg); }
      25% { transform: translateY(1px) rotate(5deg); }
      75% { transform: translateY(1px) rotate(-5deg); }
    }
    
    .wikigap-fact-arrow {
      margin-left: auto;
      opacity: 0.4;
      transition: var(--transition);
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
    }
    
    .wikigap-fact-item:hover .wikigap-fact-arrow {
      opacity: 1;
      transform: translateX(4px);
      color: var(--primary-color);
    }
    
    /* Fact detail view */
    .wikigap-fact-view {
      padding: 20px 24px;
    }
    
    .wikigap-back-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--primary-color);
      display: flex;
      align-items: center;
      font-weight: 500;
      font-size: 15px;
      padding: 6px 12px;
      border-radius: 8px;
      transition: var(--transition);
      margin-bottom: 24px;
    }
    
    .wikigap-back-btn:hover {
      background-color: var(--primary-light);
      transform: translateX(-4px);
    }
    
    .wikigap-fact-content {
      background-color: #f8f9fc;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 20px;
      line-height: 1.5;
      color: var(--text-secondary);
      border-left: 3px solid var(--primary-color);
    }
    
    .wikigap-fact-meta {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .wikigap-source-link {
      color: var(--primary-color);
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      transition: var(--transition);
      font-weight: 500;
    }
    
    .wikigap-source-link:hover {
      text-decoration: underline;
    }
    
    .wikigap-external-icon {
      margin-left: 6px;
      font-size: 14px;
    }
    
    .wikigap-detail-actions {
      display: flex;
      gap: 10px;
      margin-top: 10px;
    }
    
    .wikigap-action-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background-color: #f0f2f5;
      border: none;
      border-radius: 8px;
      padding: 10px;
      cursor: pointer;
      transition: var(--transition);
      color: var(--text-color);
      font-weight: 500;
    }
    
    .wikigap-action-btn:hover {
      background-color: #e4e8ed;
      transform: translateY(-2px);
    }
    
    .wikigap-action-btn.active {
      background-color: var(--primary-light);
      color: var(--primary-color);
    }
    
    /* Notification */
    .wikigap-notification {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: var(--primary-color);
      color: white;
      padding: 12px 20px;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transform: translateY(20px);
      opacity: 0;
      transition: var(--transition);
      z-index: 10000;
    }
    
    .wikigap-notification.active {
      transform: translateY(0);
      opacity: 1;
    }
  `;
  
  document.head.appendChild(styleElement);
}

// Start the extension
initWikiGap();

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

function createPanel(title, className) {
  // Remove any existing panels first
  removeExistingPanels();
  
  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'wikigap-panel-overlay';
  document.body.appendChild(overlay);
  
  // Create panel
  const panel = document.createElement('div');
  panel.className = `wikigap-panel ${className}`;
  
  // Create header
  const header = document.createElement('div');
  header.className = 'wikigap-panel-header';
  
  const titleEl = document.createElement('h2');
  titleEl.textContent = title;
  header.appendChild(titleEl);
  
  // Create close button container
  const closeButtonContainer = document.createElement('div');
  closeButtonContainer.className = 'wikigap-close-btn-container';
  
  // Create close button with ripple effect
  const closeButton = document.createElement('button');
  closeButton.className = 'wikigap-close-btn';
  closeButton.innerHTML = '<span>&times;</span>';
  
  const ripple = document.createElement('div');
  ripple.className = 'wikigap-close-btn-ripple';
  closeButton.appendChild(ripple);
  
  closeButtonContainer.appendChild(closeButton);
  header.appendChild(closeButtonContainer);
  panel.appendChild(header);
  
  // Create content container
  const content = document.createElement('div');
  content.className = 'wikigap-panel-content';
  panel.appendChild(content);
  
  // Add to page
  document.body.appendChild(panel);
  
  // Add event listener to close button
  closeButton.addEventListener('click', () => {
    panel.classList.add('closing');
    overlay.classList.add('closing');
    setTimeout(() => {
      panel.remove();
      overlay.remove();
    }, 300);
  });
  
  // Add event listener to overlay
  overlay.addEventListener('click', () => {
    panel.classList.add('closing');
    overlay.classList.add('closing');
    setTimeout(() => {
      panel.remove();
      overlay.remove();
    }, 300);
  });
  
  // Animate in
  setTimeout(() => {
    panel.classList.add('active');
    overlay.classList.add('active');
  }, 10);
  
  return { panel, content };
}

function showSettingsPanel() {
  const { panel, content } = createPanel('Settings', 'wikigap-settings-panel');
  
  // Add panel content
  content.innerHTML = `
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
    
    <div class="wikigap-buttons" style="padding: 20px; display: flex; justify-content: flex-end; gap: 10px;">
      <button class="wikigap-btn wikigap-reset-btn" style="background-color: #f0f2f5; color: #333;">Reset to Default</button>
      <button class="wikigap-btn wikigap-save-btn">Save Settings</button>
    </div>
  `;
  
  // Add event listeners
  const saveBtn = content.querySelector('.wikigap-save-btn');
  saveBtn.addEventListener('click', () => {
    // Save settings logic would go here
    panel.classList.add('closing');
    document.querySelector('.wikigap-panel-overlay').classList.add('closing');
    setTimeout(() => {
      panel.remove();
      document.querySelector('.wikigap-panel-overlay').remove();
      showNotification('Settings saved successfully!');
    }, 300);
  });
  
  const resetBtn = content.querySelector('.wikigap-reset-btn');
  resetBtn.addEventListener('click', () => {
    // Reset settings logic would go here
    showNotification('Settings reset to default!');
  });
}

function showFactsPanel() {
  const { panel, content } = createPanel('More Facts', 'wikigap-facts-panel');
  
  // Add panel content
  content.innerHTML = `
    <div class="wikigap-facts-list">
      <div class="wikigap-fact-item" data-lang="es">
        <div class="wikigap-fact-number">1</div>
        <div class="wikigap-fact-language">
          <span class="wikigap-flag-emoji">🇪🇸</span>
          <span>Spanish</span>
        </div>
        <div class="wikigap-fact-arrow">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </div>
      </div>
      <div class="wikigap-fact-item" data-lang="fr">
        <div class="wikigap-fact-number">3</div>
        <div class="wikigap-fact-language">
          <span class="wikigap-flag-emoji">🇫🇷</span>
          <span>French</span>
        </div>
        <div class="wikigap-fact-arrow">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </div>
      </div>
      <div class="wikigap-fact-item" data-lang="de">
        <div class="wikigap-fact-number">2</div>
        <div class="wikigap-fact-language">
          <span class="wikigap-flag-emoji">🇩🇪</span>
          <span>German</span>
        </div>
        <div class="wikigap-fact-arrow">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </div>
      </div>
      <div class="wikigap-fact-item" data-lang="it">
        <div class="wikigap-fact-number">4</div>
        <div class="wikigap-fact-language">
          <span class="wikigap-flag-emoji">🇮🇹</span>
          <span>Italian</span>
        </div>
        <div class="wikigap-fact-arrow">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </div>
      </div>
      <div class="wikigap-fact-item" data-lang="zh">
        <div class="wikigap-fact-number">1</div>
        <div class="wikigap-fact-language">
          <span class="wikigap-flag-emoji">🇨🇳</span>
          <span>Chinese</span>
        </div>
        <div class="wikigap-fact-arrow">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </div>
      </div>
      <div class="wikigap-fact-item" data-lang="ru">
        <div class="wikigap-fact-number">1</div>
        <div class="wikigap-fact-language">
          <span class="wikigap-flag-emoji">🇷🇺</span>
          <span>Russian</span>
        </div>
        <div class="wikigap-fact-arrow">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </div>
      </div>
    </div>
  `;
  
  // Make fact items clickable
  const factItems = content.querySelectorAll('.wikigap-fact-item');
  factItems.forEach(item => {
    item.addEventListener('click', () => {
      const language = item.getAttribute('data-lang');
      
      // Get language name from the span
      const languageName = item.querySelector('.wikigap-fact-language span:nth-child(2)').textContent;
      
      // Get flag emoji
      const flagEmoji = item.querySelector('.wikigap-flag-emoji').textContent;
      
      showFactDetails(language, languageName, flagEmoji);
      panel.classList.add('closing');
      document.querySelector('.wikigap-panel-overlay').classList.add('closing');
      setTimeout(() => {
        panel.remove();
        document.querySelector('.wikigap-panel-overlay').remove();
      }, 300);
    });
  });
}

function showFactDetails(language, languageName, flagEmoji) {
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
    name: languageName,
    facts: [
      { title: 'General Information', content: 'Basic information about this topic.' }
    ],
    articleLink: '#'
  };
  
  // Create fact detail panel
  const { panel, content } = createPanel(`Facts in ${factInfo.name}`, 'wikigap-detail-panel');
  
  // Generate the fact list HTML
  let factsListHTML = '';
  factInfo.facts.forEach((fact, index) => {
    factsListHTML += `
      <div class="wikigap-fact-item" data-fact-index="${index}">
        <div class="wikigap-fact-language">
          <span class="language-name">${fact.title}</span>
        </div>
        <div class="wikigap-fact-arrow">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </div>
      </div>
    `;
  });
  
  // Add panel content
  content.innerHTML = `
    <div class="wikigap-facts-list">
      ${factsListHTML}
    </div>
    <div class="wikigap-fact-view" style="display:none;">
      <button class="wikigap-back-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Back to list
      </button>
      <div class="wikigap-fact-content"></div>
      <div class="wikigap-fact-meta">
        <a href="${factInfo.articleLink}" target="_blank" class="wikigap-source-link">
          View in ${factInfo.name} Wikipedia
          <span class="wikigap-external-icon">↗</span>
        </a>
        <div class="wikigap-detail-actions">
          <button class="wikigap-action-btn wikigap-translate-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2H2v10h10V2z"></path>
              <path d="M7 12v10h10V12H7z"></path>
              <path d="M22 12l-5-5v10l5-5z"></path>
            </svg>
            Translate
          </button>
          <button class="wikigap-action-btn wikigap-audio-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
            </svg>
            Listen
          </button>
          <button class="wikigap-action-btn wikigap-share-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
            Share
          </button>
        </div>
      </div>
    </div>
  `;
  
  // Handle fact list items
  const factListItems = content.querySelectorAll('.wikigap-fact-item');
  const factView = content.querySelector('.wikigap-fact-view');
  const factContent = content.querySelector('.wikigap-fact-content');
  const factsList = content.querySelector('.wikigap-facts-list');
  const backBtn = content.querySelector('.wikigap-back-btn');
  
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
  const translateBtn = content.querySelector('.wikigap-translate-btn');
  translateBtn.addEventListener('click', () => {
    translateBtn.classList.add('active');
    showNotification('Fact translated!');
    setTimeout(() => {
      translateBtn.classList.remove('active');
    }, 1000);
  });
  
  const audioBtn = content.querySelector('.wikigap-audio-btn');
  audioBtn.addEventListener('click', () => {
    audioBtn.classList.add('active');
    showNotification('Audio playback started!');
    setTimeout(() => {
      audioBtn.classList.remove('active');
    }, 3000);
  });
  
  const shareBtn = content.querySelector('.wikigap-share-btn');
  shareBtn.addEventListener('click', () => {
    shareBtn.classList.add('active');
    showNotification('Fact link copied to clipboard!');
    setTimeout(() => {
      shareBtn.classList.remove('active');
    }, 1000);
  });
}

function removeExistingPanels() {
  const existingPanels = document.querySelectorAll('.wikigap-panel');
  const existingOverlays = document.querySelectorAll('.wikigap-panel-overlay');
  
  existingPanels.forEach(panel => {
    panel.classList.add('closing');
    setTimeout(() => panel.remove(), 300);
  });
  
  existingOverlays.forEach(overlay => {
    overlay.classList.add('closing');
    setTimeout(() => overlay.remove(), 300);
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