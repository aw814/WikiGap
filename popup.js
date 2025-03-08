// WikiGap - Popup Script

document.addEventListener('DOMContentLoaded', () => {
    // Get UI elements
    const enableToggle = document.getElementById('enableToggle');
    const optionsButton = document.getElementById('optionsButton');
    const zhToggle = document.getElementById('zh-toggle');
    const frToggle = document.getElementById('fr-toggle');
    const ruToggle = document.getElementById('ru-toggle');
    
    // Get the extension state from storage
    chrome.storage.sync.get({
      enabled: true,
      languages: {
        zh: true,
        fr: true,
        ru: true
      }
    }, (items) => {
      // Set the toggle state
      enableToggle.checked = items.enabled;
      
      // Set the language badges
      zhToggle.classList.toggle('active', items.languages.zh);
      frToggle.classList.toggle('active', items.languages.fr);
      ruToggle.classList.toggle('active', items.languages.ru);
    });
    
    // Handle the enable/disable toggle
    enableToggle.addEventListener('change', () => {
      const enabled = enableToggle.checked;
      
      // Save the state
      chrome.storage.sync.set({ enabled });
      
      // Send message to active tabs to toggle the extension
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].url && tabs[0].url.includes('wikipedia.org')) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleWikiGap', enabled });
        }
      });
    });
    
    // Handle language toggles
    zhToggle.addEventListener('click', () => toggleLanguage('zh', zhToggle));
    frToggle.addEventListener('click', () => toggleLanguage('fr', frToggle));
    ruToggle.addEventListener('click', () => toggleLanguage('ru', ruToggle));
    
    // Open the options page
    optionsButton.addEventListener('click', () => {
      if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
      } else {
        window.open(chrome.runtime.getURL('options.html'));
      }
    });
    
    // Function to toggle a language
    function toggleLanguage(lang, element) {
      element.classList.toggle('active');
      const isActive = element.classList.contains('active');
      
      // Get current settings
      chrome.storage.sync.get({
        languages: {
          zh: true,
          fr: true,
          ru: true
        }
      }, (items) => {
        // Update the language setting
        items.languages[lang] = isActive;
        
        // Save updated settings
        chrome.storage.sync.set({ languages: items.languages });
        
        // Send message to active tabs to update languages
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0] && tabs[0].url && tabs[0].url.includes('wikipedia.org')) {
            chrome.tabs.sendMessage(tabs[0].id, { 
              action: 'updateLanguages', 
              languages: items.languages 
            });
          }
        });
      });
    }
    
    // Check if we're on a Wikipedia page
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].url) {
        const isWikipedia = tabs[0].url.includes('wikipedia.org');
        const statusText = document.querySelector('.status-text');
        
        if (!isWikipedia) {
          statusText.textContent = 'Not a Wikipedia page';
          enableToggle.disabled = true;
          enableToggle.checked = false;
        }
      }
    });
  });