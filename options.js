// WikiGap - Options Page Script

document.addEventListener('DOMContentLoaded', () => {
    // Get UI elements
    const enableWikigap = document.getElementById('enable-wikigap');
    const showUnderlines = document.getElementById('show-underlines');
    const colorCoding = document.getElementById('color-coding');
    const autoShow = document.getElementById('auto-show');
    const sidebarWidth = document.getElementById('sidebar-width');
    const sidebarWidthValue = document.querySelector('.range-value');
    const showFactTypes = document.getElementById('show-fact-types');
    const enableNotifications = document.getElementById('enable-notifications');
    const autoTranslate = document.getElementById('auto-translate');
    const saveButton = document.getElementById('save-button');
    const resetButton = document.getElementById('reset-button');
    const statusMessage = document.getElementById('status-message');
    
    // Language cards
    const langZh = document.getElementById('lang-zh');
    const langFr = document.getElementById('lang-fr');
    const langRu = document.getElementById('lang-ru');
    const langDe = document.getElementById('lang-de');
    const langEs = document.getElementById('lang-es');
    const langJa = document.getElementById('lang-ja');
    
    // Load saved settings
    loadSettings();
    
    // Add event listeners for sidebar width range
    sidebarWidth.addEventListener('input', () => {
      sidebarWidthValue.textContent = `${sidebarWidth.value}px`;
    });
    
    // Add event listeners for language cards
    langZh.addEventListener('click', () => toggleLanguageCard(langZh));
    langFr.addEventListener('click', () => toggleLanguageCard(langFr));
    langRu.addEventListener('click', () => toggleLanguageCard(langRu));
    langDe.addEventListener('click', () => toggleLanguageCard(langDe));
    langEs.addEventListener('click', () => toggleLanguageCard(langEs));
    langJa.addEventListener('click', () => toggleLanguageCard(langJa));
    
    // Add event listener for save button
    saveButton.addEventListener('click', saveSettings);
    
    // Add event listener for reset button
    resetButton.addEventListener('click', resetSettings);
    
    // Function to load settings from storage
    function loadSettings() {
      chrome.storage.sync.get({
        enabled: true,
        languages: {
          zh: true,
          fr: true,
          ru: true,
          de: false,
          es: false,
          ja: false
        },
        appearance: {
          showUnderlines: true,
          sidebarWidth: 320,
          colorCoding: true,
          autoShow: true
        },
        advanced: {
          showFactTypes: true,
          enableNotifications: false,
          autoTranslate: true
        }
      }, (items) => {
        // Set checkboxes
        enableWikigap.checked = items.enabled;
        showUnderlines.checked = items.appearance.showUnderlines;
        colorCoding.checked = items.appearance.colorCoding;
        autoShow.checked = items.appearance.autoShow;
        showFactTypes.checked = items.advanced.showFactTypes;
        enableNotifications.checked = items.advanced.enableNotifications;
        autoTranslate.checked = items.advanced.autoTranslate;
        
        // Set sidebar width
        sidebarWidth.value = items.appearance.sidebarWidth;
        sidebarWidthValue.textContent = `${items.appearance.sidebarWidth}px`;
        
        // Set language cards
        langZh.classList.toggle('active', items.languages.zh);
        langFr.classList.toggle('active', items.languages.fr);
        langRu.classList.toggle('active', items.languages.ru);
        langDe.classList.toggle('active', items.languages.de);
        langEs.classList.toggle('active', items.languages.es);
        langJa.classList.toggle('active', items.languages.ja);
      });
    }
    
    // Function to save settings to storage
    function saveSettings() {
      const settings = {
        enabled: enableWikigap.checked,
        languages: {
          zh: langZh.classList.contains('active'),
          fr: langFr.classList.contains('active'),
          ru: langRu.classList.contains('active'),
          de: langDe.classList.contains('active'),
          es: langEs.classList.contains('active'),
          ja: langJa.classList.contains('active')
        },
        appearance: {
          showUnderlines: showUnderlines.checked,
          sidebarWidth: parseInt(sidebarWidth.value),
          colorCoding: colorCoding.checked,
          autoShow: autoShow.checked
        },
        advanced: {
          showFactTypes: showFactTypes.checked,
          enableNotifications: enableNotifications.checked,
          autoTranslate: autoTranslate.checked
        }
      };
      
      chrome.storage.sync.set(settings, () => {
        // Show success message
        statusMessage.style.display = 'block';
        
        // Hide message after animation completes
        setTimeout(() => {
          statusMessage.style.display = 'none';
        }, 2000);
        
        // Update any active tabs
        chrome.tabs.query({ url: '*://*.wikipedia.org/*' }, (tabs) => {
          tabs.forEach((tab) => {
            chrome.tabs.sendMessage(tab.id, { 
              action: 'updateSettings', 
              settings: settings 
            });
          });
        });
      });
    }
    
    // Function to reset settings to default
    function resetSettings() {
      const defaultSettings = {
        enabled: true,
        languages: {
          zh: true,
          fr: true,
          ru: true,
          de: false,
          es: false,
          ja: false
        },
        appearance: {
          showUnderlines: true,
          sidebarWidth: 320,
          colorCoding: true,
          autoShow: true
        },
        advanced: {
          showFactTypes: true,
          enableNotifications: false,
          autoTranslate: true
        }
      };
      
      chrome.storage.sync.set(defaultSettings, () => {
        // Reload the page to reflect changes
        location.reload();
      });
    }
    
    // Function to toggle a language card
    function toggleLanguageCard(card) {
      card.classList.toggle('active');
    }
  });