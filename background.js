// WikiGap - Background Script

// Initialize extension when installed
chrome.runtime.onInstalled.addListener(() => {
    console.log('WikiGap extension installed');
    
    // Set default settings
    chrome.storage.sync.set({
      enabled: true,
      languages: {
        zh: true,
        fr: true,
        ru: true
      },
      appearance: {
        showUnderlines: true,
        sidebarWidth: 320,
        colorCoding: true
      }
    });
  });
  
  // Listen for tab updates to show the icon in the correct color
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.url.includes('wikipedia.org')) {
      // Check if the extension is enabled
      chrome.storage.sync.get('enabled', (data) => {
        if (data.enabled) {
          // Set the active icon
          chrome.action.setIcon({
            tabId: tabId,
            path: {
              16: 'icons/puzzle_16.png',
              64: 'icons/puzzle_64.png',
              128: 'icons/puzzle_128.png'
            }
          });
        } else {
          // Set the inactive icon
          chrome.action.setIcon({
            tabId: tabId,
            path: {
              16: 'icons/puzzle_16.png',
              64: 'icons/puzzle_64.png',
              128: 'icons/puzzle_128.png'
            }
          });
        }
      });
    }
  });
  
  // Listen for messages from content script or popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getFactsData') {
      // In a real implementation, this would make API calls to Wikipedia
      // For demonstration, we'll return mock data
      const fakeFacts = generateMockFacts(message.article);
      sendResponse({ success: true, facts: fakeFacts });
      return true; // Indicates we will respond asynchronously
    }
  });
  
  // Generate mock facts based on article name (for demonstration)
  function generateMockFacts(articleName) {
    // This is just for demonstration - in a real extension, you would
    // fetch real data from Wikipedia APIs for different languages
    
    const mockData = {
      zh: [],
      fr: [],
      ru: []
    };
    
    // Some sample data for common articles
    if (articleName.toLowerCase().includes('tea') || 
        articleName.toLowerCase().includes('oolong')) {
      mockData.zh.push({
        id: 'zh1',
        text: 'In Chinese culture, oolong tea is considered to have originated from the Wuyi Mountains in Fujian province.',
        relatedText: 'origin of oolong tea',
        type: 'additional'
      });
    }
    
    if (articleName.toLowerCase().includes('paris') || 
        articleName.toLowerCase().includes('france')) {
      mockData.fr.push({
        id: 'fr1',
        text: 'Le nom "Paris" vient du peuple gaulois des Parisii qui s\'installèrent sur l\'île de la Cité au IIIe siècle avant J.-C.',
        relatedText: 'origin of the name Paris',
        type: 'contradiction'
      });
    }
    
    if (articleName.toLowerCase().includes('space') || 
        articleName.toLowerCase().includes('cosmos')) {
      mockData.ru.push({
        id: 'ru1',
        text: 'Российский космонавт Юрий Гагарин стал первым человеком в космосе 12 апреля 1961 года.',
        relatedText: 'first human in space',
        type: 'additional'
      });
    }
    
    return mockData;
  }