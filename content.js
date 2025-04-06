// WikiGap - Content Script (Fixed Version)
// This script runs on Wikipedia pages and adds multilingual fact highlights

// Configuration
const LANGUAGES = {
    zh: { name: "Chinese", color: "#ff6b6b" },
    fr: { name: "French", color: "#3498db" }, // Brighter blue for French
    ru: { name: "Russian", color: "#06d6a0" }
  };
  
  const FACT_TYPES = {
    CONTRADICTION: { 
      icon: "error", 
      label: "Contradictory Information" 
    },
    ADDITIONAL: { 
      icon: "add_circle", 
      label: "Additional Information" 
    },
    NOT_MENTIONED: { 
      icon: "new_releases", 
      label: "Topic Not Mentioned" 
    }
  };

  function logUserAction(actionType, details = {}) {
    const event = {
      action: actionType,
      timestamp: Date.now(),
      pageTitle: document.title, // or window.location.href if you prefer
      ...details
    };
  
    // Save locally
    saveEventToLocal(event);
  }
  
  function saveEventToLocal(event) {
    const existingLogs = JSON.parse(localStorage.getItem('wikigap_logs') || '[]');
    existingLogs.push(event);
    localStorage.setItem('wikigap_logs', JSON.stringify(existingLogs));
  }
  
function cleanSnippet(snippet) {
  let trimmed = snippet.trim();
  // remove any trailing punctuation like . ! ?
  return trimmed.replace(/[.!?]+$/, "");
}
// State management
function buildTextFragmentUrl(baseLink, snippet) {
  if (!baseLink) return baseLink;
  if (!snippet || !snippet.trim()) return baseLink;

  // Clean snippet to remove trailing period (or other punctuation).
  snippet = cleanSnippet(snippet);

  const encodedSnippet = encodeURIComponent(snippet.trim());
  return `${baseLink}#:~:text=${encodedSnippet}`;
}


  let factsLoaded = false;
  let totalFacts = 0;
  let highlightedSentences = [];
  let languageFacts = {
    zh: [],
    fr: [],
    ru: []
  };
  // Track user text selections
  let lastSelected = "";
  let selectionTimeout = null;
  
  document.addEventListener("selectionchange", () => {
    if (selectionTimeout) clearTimeout(selectionTimeout);
  
    selectionTimeout = setTimeout(() => {
      const sel = window.getSelection();
      if (!sel || !sel.rangeCount) return;
  
      const text = sel.toString().trim();
      if (!text || text === lastSelected) return;
  
      lastSelected = text;
  
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const containerTag = range.startContainer?.parentElement?.tagName || "UNKNOWN";
  
      logUserAction("text_selection", {
        selectedText: text,
        containerTag,
        boundingRect: {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        }
      });
    }, 300); // 300ms delay after selection stops
  });

  
  // Initialize the extension
  function initWikiGap() {
    // Only run on Wikipedia article pages
    if (!document.querySelector('body.mediawiki') || 
        !document.getElementById('content') || 
        document.getElementById('wikigap-container')) {
      return;
    }
  
    console.log("WikiGap: Initializing on Wikipedia page");
    
    // Inject Material Icons
    injectMaterialIcons();
    
    // Create main UI elements
    createMainInterface();
    
    // Fetch potential facts based on the current article
    fetchFacts()
      .then(() => {
        // Process the article content to highlight relevant sentences
        processArticleContent();
        updateFactCounter();
        factsLoaded = true;
      })
      .catch(err => {
        console.error("WikiGap error:", err);
      });
  }
  
  // Inject Material Icons stylesheet
  function injectMaterialIcons() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
    document.head.appendChild(link);
  }
  
  // Create the main UI interface
  function createMainInterface() {
    // Create the container for the WikiGap UI
    const container = document.createElement('div');
    container.id = 'wikigap-container';
    container.className = 'wikigap-ui';
    
    // Add resize handle
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'wikigap-resize-handle';
    container.appendChild(resizeHandle);
    
    // Create the header
    const header = document.createElement('div');
    header.className = 'wikigap-header';
    
    // FIXED: Create the settings button with consistent styling
    const settingsBtn = document.createElement('button');
    settingsBtn.className = 'wikigap-settings-btn';
    settingsBtn.innerHTML = '<i class="material-icons">settings</i>';
    settingsBtn.addEventListener('click', toggleSettings);
    
    // FIXED: Create the facts counter with proper text
    const factsCounter = document.createElement('div');
    factsCounter.className = 'wikigap-facts-counter';
    factsCounter.id = 'wikigap-facts-counter';
    factsCounter.innerHTML = '<i class="material-icons">insights</i> <span id="wikigap-fact-count">0</span> Facts';
    factsCounter.addEventListener('click', showAllFacts);
    
    const exportBtn = document.createElement('button');
    exportBtn.className = 'wikigap-settings-btn';
    exportBtn.innerHTML = '<i class="material-icons">file_download</i> Logs';
    exportBtn.addEventListener('click', exportLogsToFile);

    // Add the buttons to the header
    header.appendChild(settingsBtn);
    header.appendChild(exportBtn)
    header.appendChild(factsCounter);
    container.appendChild(header);
    
    // Create the tabs for different views
    const tabs = document.createElement('div');
    tabs.className = 'wikigap-tabs';
    
    const allTab = document.createElement('button');
    allTab.className = 'wikigap-tab wikigap-tab-active';
    allTab.textContent = 'All';
    allTab.dataset.tab = 'all';
    
    const zhTab = document.createElement('button');
    zhTab.className = 'wikigap-tab';
    zhTab.textContent = 'Chinese';
    zhTab.dataset.tab = 'zh';
    
    const frTab = document.createElement('button');
    frTab.className = 'wikigap-tab';
    frTab.textContent = 'French';
    frTab.dataset.tab = 'fr';
    
    const ruTab = document.createElement('button');
    ruTab.className = 'wikigap-tab';
    ruTab.textContent = 'Russian';
    ruTab.dataset.tab = 'ru';
    
    // Add flags if setting is enabled
    chrome.storage.sync.get({ showFlags: false }, (items) => {
      if (items.showFlags) {
        zhTab.innerHTML = '<span class="flag-emoji">🇨🇳</span> Chinese';
        frTab.innerHTML = '<span class="flag-emoji">🇫🇷</span> French';
        ruTab.innerHTML = '<span class="flag-emoji">🇷🇺</span> Russian';
      }
    });
    
    tabs.appendChild(allTab);
    tabs.appendChild(zhTab);
    tabs.appendChild(frTab);
    tabs.appendChild(ruTab);
    
    // Add event listeners for tabs
    tabs.querySelectorAll('.wikigap-tab').forEach(tab => {
      tab.addEventListener('click', function() {
        logUserAction("lang_tab_switch", { languageTab: this.dataset.tab });
        const currentActive = tabs.querySelector('.wikigap-tab-active');
        if (currentActive) {
          currentActive.classList.remove('wikigap-tab-active');
        }
        this.classList.add('wikigap-tab-active');
        filterFactsByLanguage(this.dataset.tab);
      });
    });
    
    container.appendChild(tabs);
    
    // Create search box
    const searchContainer = document.createElement('div');
    searchContainer.className = 'wikigap-search-container';
    
    const searchBox = document.createElement('input');
    searchBox.type = 'text';
    searchBox.className = 'wikigap-search-box';
    searchBox.placeholder = '';
    
    const searchIcon = document.createElement('i');
    searchIcon.className = 'material-icons wikigap-search-icon';
    searchIcon.textContent = 'search';
    
    searchContainer.appendChild(searchIcon);
    searchContainer.appendChild(searchBox);
    container.appendChild(searchContainer);
    
    // Add search functionality
    let searchTimeout;
    searchBox.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        const searchTerm = e.target.value.toLowerCase();
        filterFactsBySearch(searchTerm);
      }, 300); // Debounce search for better performance
    });
    
    // Create the content area for facts
    const factsContainer = document.createElement('div');
    factsContainer.id = 'wikigap-facts-container';
    factsContainer.className = 'wikigap-facts-container';
    container.appendChild(factsContainer);
    
    // Create the settings panel (hidden by default)
    const settingsPanel = document.createElement('div');
    settingsPanel.id = 'wikigap-settings-panel';
    settingsPanel.className = 'wikigap-settings-panel wikigap-hidden';
    
    // Settings content
    settingsPanel.innerHTML = `
      <h3>WikiGap Settings</h3>
      <div class="wikigap-setting-group">
        <label>
          <input type="checkbox" id="wikigap-setting-zh" class="wikigap-checkbox" checked> 
          Show Chinese facts
        </label>
      </div>
      <div class="wikigap-setting-group">
        <label>
          <input type="checkbox" id="wikigap-setting-fr" class="wikigap-checkbox" checked> 
          Show French facts
        </label>
      </div>
      <div class="wikigap-setting-group">
        <label>
          <input type="checkbox" id="wikigap-setting-ru" class="wikigap-checkbox" checked> 
          Show Russian facts
        </label>
      </div>
      <div class="wikigap-setting-group">
        <label>
          <input type="checkbox" id="wikigap-setting-underline" class="wikigap-checkbox" checked> 
          Show underlines in article
        </label>
      </div>
      <div class="wikigap-setting-group">
        <label>
          <input type="checkbox" id="wikigap-setting-auto-highlight" class="wikigap-checkbox" checked> 
          Auto-highlight related content
        </label>
      </div>
      <div class="wikigap-setting-group">
        <label>
          <input type="checkbox" id="wikigap-setting-show-flags" class="wikigap-checkbox"> 
          Show country flags in tabs
        </label>
      </div>
      <button id="wikigap-settings-close" class="wikigap-button">Close</button>
    `;
    
    container.appendChild(settingsPanel);
    
    // Add event listener for the close button
    settingsPanel.querySelector('#wikigap-settings-close').addEventListener('click', toggleSettings);
    
    // Add event listeners for settings changes
    settingsPanel.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', updateSettings);
    });
    
    // Add the container to the page
    document.body.appendChild(container);
    
    // Make the container draggable
    makeDraggable(container);
    
    // FIXED: Make the container resizable with improved function
    makeResizable(container, resizeHandle);
    
    // Position initially
    positionContainer();
  }
  
  // Make an element draggable with improved performance
  function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    element.onmousedown = startDrag;
    
    function startDrag(e) {
      // Ignore if clicking on a button, input, or the resize handle
      if (e.target.tagName === 'BUTTON' || 
          e.target.tagName === 'INPUT' || 
          e.target.tagName === 'A' ||
          e.target.classList.contains('wikigap-resize-handle') ||
          e.target.closest('.wikigap-facts-container') ||
          e.target.closest('.wikigap-settings-panel')) {
        return;
      }
      
      e.preventDefault();
      // Get the mouse cursor position at startup
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = stopDrag;
      // Call a function whenever the cursor moves
      document.onmousemove = dragElement;
      
      // Add "dragging" class for visual feedback
      element.classList.add('wikigap-dragging');
    }
    
    function dragElement(e) {
      e.preventDefault();
      
      // Calculate the new cursor position
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      
      // Use transform for smoother dragging (better performance)
      const left = element.offsetLeft - pos1;
      const top = element.offsetTop - pos2;
      element.style.left = left + "px";
      element.style.top = top + "px";
      element.style.right = "auto";
    }
    
    function stopDrag() {
      // Stop moving when mouse button is released
      document.onmouseup = null;
      document.onmousemove = null;
      element.classList.remove('wikigap-dragging');
    }
  }
  
  // FIXED: Improved resize functionality
  function makeResizable(element, handle) {
    handle.addEventListener('mousedown', initResize, false);
    
    let startWidth, startHeight, startX, startY;
    
    function initResize(e) {
      e.stopPropagation();
      e.preventDefault();
      
      startX = e.clientX;
      startY = e.clientY;
      startWidth = parseInt(document.defaultView.getComputedStyle(element).width, 10);
      startHeight = parseInt(document.defaultView.getComputedStyle(element).height, 10);
      
      document.addEventListener('mousemove', resize, false);
      document.addEventListener('mouseup', stopResize, false);
      
      // Add resizing class for visual feedback
      element.classList.add('wikigap-resizing');
    }
    
    function resize(e) {
      e.preventDefault();
      
      // Ensure minimum dimensions
      const newWidth = Math.max(250, startWidth + e.clientX - startX);
      const newHeight = Math.max(300, startHeight + e.clientY - startY);
      
      element.style.width = newWidth + 'px';
      element.style.height = newHeight + 'px';
    }
    
    function stopResize() {
      document.removeEventListener('mousemove', resize, false);
      document.removeEventListener('mouseup', stopResize, false);
      element.classList.remove('wikigap-resizing');
    }
  }
  
  // Position the WikiGap container properly
  function positionContainer() {
    const container = document.getElementById('wikigap-container');
    if (!container) return;
    
    // Only position if container doesn't have a left position yet
    if (!container.style.left) {
      const content = document.getElementById('content');
      if (content) {
        const contentRect = content.getBoundingClientRect();
        container.style.top = `${contentRect.top + window.scrollY}px`;
        container.style.right = '20px';
      }
    }
  }
  
  // Toggle settings panel visibility
  function toggleSettings() {
    const settingsPanel = document.getElementById('wikigap-settings-panel');
    if (settingsPanel) {
      settingsPanel.classList.toggle('wikigap-hidden');
    }
  }
  
  // Show all facts function (clicked on Facts counter)
  function showAllFacts() {
    // Set the 'All' tab as active
    const tabs = document.querySelector('.wikigap-tabs');
    if (tabs) {
      const currentActive = tabs.querySelector('.wikigap-tab-active');
      if (currentActive) {
        currentActive.classList.remove('wikigap-tab-active');
      }
      const allTab = tabs.querySelector('[data-tab="all"]');
      if (allTab) {
        allTab.classList.add('wikigap-tab-active');
      }
    }
    
    // Show all facts
    filterFactsByLanguage('all');
    
    // Scroll to top of facts container
    const factsContainer = document.getElementById('wikigap-facts-container');
    if (factsContainer) {
      factsContainer.scrollTop = 0;
    }
  }
  
  // Update settings based on user preferences
  function updateSettings() {
    // Update visibility of facts by language
    const showChinese = document.getElementById('wikigap-setting-zh').checked;
    const showFrench = document.getElementById('wikigap-setting-fr').checked;
    const showRussian = document.getElementById('wikigap-setting-ru').checked;
    const showUnderlines = document.getElementById('wikigap-setting-underline').checked;
    const showFlags = document.getElementById('wikigap-setting-show-flags').checked;
    
    // Save the flag setting
    chrome.storage.sync.set({ showFlags });
    
    // Update CSS visibility
    document.documentElement.style.setProperty('--wikigap-zh-display', showChinese ? 'block' : 'none');
    document.documentElement.style.setProperty('--wikigap-fr-display', showFrench ? 'block' : 'none');
    document.documentElement.style.setProperty('--wikigap-ru-display', showRussian ? 'block' : 'none');
    
    // Update underlines
    const underlines = document.querySelectorAll('.wikigap-underline');
    underlines.forEach(underline => {
      if (showUnderlines) {
        underline.style.textDecoration = 'underline';
      } else {
        underline.style.textDecoration = 'none';
      }
    });
    
    // Update fact counter
    updateFactCounter();
    
    // Update tab flags
    const tabs = document.querySelectorAll('.wikigap-tab[data-tab]');
    tabs.forEach(tab => {
      const lang = tab.dataset.tab;
      if (lang !== 'all') {
        const langNames = {
          zh: 'Chinese',
          fr: 'French',
          ru: 'Russian'
        };
        if (showFlags) {
          const flag = {
            zh: '🇨🇳',
            fr: '🇫🇷',
            ru: '🇷🇺'
          }[lang];
          tab.innerHTML = `<span class="flag-emoji">${flag}</span> ${langNames[lang]}`;
        } else {
          tab.textContent = langNames[lang];
        }
      }
    });
  }
  
  // Filter displayed facts by language
  function filterFactsByLanguage(language) {
    const factElements = document.querySelectorAll('.wikigap-fact');
    
    if (language === 'all') {
      factElements.forEach(fact => {
        fact.style.display = 'block';
      });
    } else {
      factElements.forEach(fact => {
        if (fact.dataset.language === language) {
          fact.style.display = 'block';
        } else {
          fact.style.display = 'none';
        }
      });
    }
  }
  
  // Update the fact counter
  function updateFactCounter() {
    const factCount = document.getElementById('wikigap-fact-count');
    if (factCount) {
      let visibleFacts = 0;
      
      const showChinese = document.getElementById('wikigap-setting-zh')?.checked ?? true;
      const showFrench = document.getElementById('wikigap-setting-fr')?.checked ?? true;
      const showRussian = document.getElementById('wikigap-setting-ru')?.checked ?? true;
      
      if (showChinese) visibleFacts += languageFacts.zh.length;
      if (showFrench) visibleFacts += languageFacts.fr.length;
      if (showRussian) visibleFacts += languageFacts.ru.length;
      
      factCount.textContent = visibleFacts;
    }
  }
  
  // Filter facts by search term
  function filterFactsBySearch(searchTerm) {
    const factElements = document.querySelectorAll('.wikigap-fact');
    let visibleCount = 0;

    factElements.forEach(fact => {
      const factContent = fact.querySelector('.wikigap-fact-content').textContent.toLowerCase();
      const factLanguage = fact.querySelector('.wikigap-fact-language').textContent.toLowerCase();
      const matches = factContent.includes(searchTerm) || factLanguage.includes(searchTerm);
      
      if (matches) {
        fact.style.display = 'block';
        visibleCount++;
      } else {
        fact.style.display = 'none';
      }
    });

    // Update the fact counter with filtered count
    const factCount = document.getElementById('wikigap-fact-count');
    if (factCount) {
      factCount.textContent = visibleCount;
    }

    // Show "no results" message if needed
    let noResultsMsg = document.querySelector('.wikigap-no-results');
    if (visibleCount === 0 && searchTerm) {
      if (!noResultsMsg) {
        noResultsMsg = document.createElement('div');
        noResultsMsg.className = 'wikigap-no-results';
        const factsContainer = document.getElementById('wikigap-facts-container');
        factsContainer.appendChild(noResultsMsg);
      }
      noResultsMsg.textContent = `No facts found for "${searchTerm}"`;
      noResultsMsg.style.display = 'block';
    } else if (noResultsMsg) {
      noResultsMsg.style.display = 'none';
    }
  }
  
  async function fetchFacts() {
    console.log("WikiGap: Fetching facts from external JSON data...");
    // Grab the current Wikipedia article title
    const pageTitle = document.title.replace(' - Wikipedia', '').trim();
    console.log(pageTitle)
  
    // Construct the path for the JSON file (adjust path or logic as needed)
    const jsonFilePath = chrome.runtime.getURL(`json/${pageTitle}.json`);
    console.log(jsonFilePath)
  
    try {
      const response = await fetch(jsonFilePath);
      if (!response.ok) {
        throw new Error('Failed to fetch data for ' + pageTitle);
      }
       console.log("pageTitle:", pageTitle);
  
      // Parse JSON
      const data = await response.json();
  
      // Bail out if no matching structure
      if (!data[pageTitle] || !data[pageTitle].languages) {
        console.warn("No language data found for page:", pageTitle);
        // fallback
        languageFacts.zh = [];
        languageFacts.fr = [];
        languageFacts.ru = [];
        totalFacts = 0;
        return false;
      }
  
      // Reset existing facts
      languageFacts.zh = [];
      languageFacts.fr = [];
      languageFacts.ru = [];
  
      function parseLanguage(langCode) {
        let counter = 1;
        const MAX_FACTS = 40; // limit for demonstration
        const langData = data[pageTitle].languages[langCode];
        if (!langData || !langData.headers) return;
      
        Object.keys(langData.headers).forEach(headerKey => {
          const headerObj = langData.headers[headerKey];
          if (!headerObj.entries || !Array.isArray(headerObj.entries)) {
            return;
          }
      
          headerObj.entries.forEach(entry => {
            if (counter > MAX_FACTS) return;
      
            // Gather all aligned sentences into one array
            const sentencesArray = Array.isArray(entry.tgt_fact_aligned_sentences)
              ? entry.tgt_fact_aligned_sentences
              : [];
      
            // Build a final link value that uses wiki_link_direct if available
            let finalLink;
            if (entry.fact?.wiki_link_direct) {
              finalLink = entry.fact.wiki_link_direct;
            } else {
              finalLink = buildTextFragmentUrl(
                entry.fact?.wiki_link,
                entry.fact?.fact_aligned_sentence
              ) || entry.fact?.wiki_link;
            }

            // Push ONE fact object with an array of sentences
            languageFacts[langCode].push({
              id: `${langCode}${counter++}`,
              relatedTexts: sentencesArray,  // store all sentences here
              fact: entry.fact?.translated || "",
              type: FACT_TYPES.ADDITIONAL,
              link: finalLink
            });
          });
        });
      }
      
      // Parse for each language
      parseLanguage('zh');
      parseLanguage('fr');
      parseLanguage('ru');
  
      // Update total facts
      totalFacts = languageFacts.zh.length 
                 + languageFacts.fr.length 
                 + languageFacts.ru.length;
      console.log(`Fetched ${totalFacts} facts from ${pageTitle}.json`);
      return true;
    } catch (err) {
      // TODO: There will be an error when clicking the URL
      console.error("WikiGap data fetch error:", err);
      // fallback to empty if there's an error
      languageFacts.zh = [];
      languageFacts.fr = [];
      languageFacts.ru = [];
      totalFacts = 0;
      return false;
    }
  }


  // Process article content to highlight relevant sentences
  function processArticleContent() {
    const contentElement = document.querySelector('.mw-parser-output');
    if (!contentElement) return;
    
    // Find all paragraphs and other text elements in the content
    const textElements = contentElement.querySelectorAll('p, li, h1, h2, h3, h4, h5, h6');
    
    // Process each language's facts
    for (const lang in languageFacts) {
      const facts = languageFacts[lang];
      
      facts.forEach(fact => {
        if (!fact.relatedTexts || fact.relatedTexts.length === 0) return;
        
        fact.relatedTexts.forEach(sentence => {
          // Try to find the sentence in the text elements
          let found = false;
          
          textElements.forEach(element => {
            console.log("Searching for snippet:", sentence);
            console.log("In element:", element, element.textContent);
            if (element.textContent.includes(sentence) && !found) {
              // Try to find the exact text
              const html = element.innerHTML;
              const index = element.textContent.indexOf(sentence);
              console.log("Match found at index:", index);
              
              if (index !== -1) {
                // Use DOM methods to find and wrap the text node
                const walker = document.createTreeWalker(
                  element,
                  NodeFilter.SHOW_TEXT,
                  null,
                  false
                );
                
                let currentNode;
                let currentPos = 0;
                let targetNode = null;
                let targetIndex = 0;
                
                // Find the text node containing our target sentence
                while ((currentNode = walker.nextNode())) {
                  const nodeTextLength = currentNode.textContent.length;
                  if (index >= currentPos && index < currentPos + nodeTextLength) {
                    targetNode = currentNode;
                    targetIndex = index - currentPos;
                    break;
                  }
                  currentPos += nodeTextLength;
                }
                
                if (targetNode) {
                  const span = document.createElement('span');
                  span.className = `wikigap-underline wikigap-underline-${lang}`;
                  span.dataset.factId = fact.id;
                  
                  const beforeText = targetNode.textContent.substring(0, targetIndex);
                  const targetText = sentence;
                  const afterText = targetNode.textContent.substring(targetIndex + targetText.length);
                  
                  // Create text nodes for before and after
                  const beforeTextNode = document.createTextNode(beforeText);
                  const afterTextNode = document.createTextNode(afterText);
                  
                  // Set the target text as the span content
                  span.textContent = targetText;

                  // Log before insertion
                  console.log("Found target node:", targetNode, "with text:", targetNode.textContent);
                  console.log("Before insertion, parent HTML is:", targetNode.parentNode.innerHTML);
                  console.log("Target index:", targetIndex, "and snippet:", sentence);

                  // Replace the original text node with our sequence
                  const parentNode = targetNode.parentNode;
                  parentNode.insertBefore(beforeTextNode, targetNode);
                  parentNode.insertBefore(span, targetNode);
                  parentNode.insertBefore(afterTextNode, targetNode);
                  parentNode.removeChild(targetNode);
                  console.log("After insertion, parent HTML is now:", parentNode.innerHTML);
                  console.log("Created highlight span:", span);
                  
                  found = true;
                  
                  // Add to highlighted sentences list
                  highlightedSentences.push({
                    id: fact.id,
                    element: span,
                    fact: fact
                  });
                }
              }
            }
          });
        });
        
        // Create fact card once per fact
        createFactCard(fact, lang);
      });
    }
    
    // Add event listeners to the highlighted sentences
    highlightedSentences.forEach(item => {
      if (item.element) {
        // Critical fix: Using direct click handler for immediate highlighting
        item.element.addEventListener('click', (e) => {
          logUserAction("fact_highlight_click", {
            factId: item.fact.id,
            language: item.fact.language || item.fact.lang || "unknown",
            sentence: item.element.textContent
          });
          e.preventDefault();
          e.stopPropagation();
          
          // Clear all highlights first
          clearAllHighlights();
          
          // Highlight the corresponding fact
          const factCard = document.querySelector(`.wikigap-fact[data-fact-id="${item.id}"]`);
          if (factCard) {
            factCard.classList.add('wikigap-fact-highlighted');
            
            // Scroll the fact into view
            factCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            
            // Add background highlight to the clicked text
            item.element.classList.add('wikigap-underline-highlighted');
            
            // Make sure the appropriate tab is active for the language
            const lang = factCard.dataset.language;
            const tabs = document.querySelector('.wikigap-tabs');
            if (tabs) {
              const currentTab = tabs.querySelector('.wikigap-tab-active');
              if (currentTab) {
                currentTab.classList.remove('wikigap-tab-active');
              }
              
              const langTab = tabs.querySelector(`[data-tab="${lang}"]`);
              if (langTab) {
                langTab.classList.add('wikigap-tab-active');
              }
              
              // Show only facts for this language
              filterFactsByLanguage(lang);
            }
          }
        });
        
        // Hover effects
        item.element.addEventListener('mouseenter', () => {
          item.element.classList.add('wikigap-underline-hover');
        });
        
        item.element.addEventListener('mouseleave', () => {
          item.element.classList.remove('wikigap-underline-hover');
        });
      }
    });
  }
  
  // Clear all highlighted elements
  function clearAllHighlights() {
    // Clear highlighted facts
    const highlightedFacts = document.querySelectorAll('.wikigap-fact-highlighted');
    highlightedFacts.forEach(el => el.classList.remove('wikigap-fact-highlighted'));
    
    // Clear highlighted underlines
    const highlightedUnderlines = document.querySelectorAll('.wikigap-underline-highlighted');
    highlightedUnderlines.forEach(el => el.classList.remove('wikigap-underline-highlighted'));
  }
  
  // FIXED: Create a fact card with proper Material Icons display
  function createFactCard(fact, language) {
    const factsContainer = document.getElementById('wikigap-facts-container');
    if (!factsContainer) return;
    
    const factCard = document.createElement('div');
    factCard.className = `wikigap-fact wikigap-fact-${language}`;
    factCard.dataset.factId = fact.id;
    factCard.dataset.language = language;
    
    // Set the border color based on language
    factCard.style.borderLeftColor = LANGUAGES[language].color;
    
    // FIXED: Removed text display of icon name and using proper Material Icons
    factCard.innerHTML = `
      <div class="wikigap-fact-header">
        <div class="wikigap-fact-language">
          <i class="material-icons">${fact.type.icon}</i>
          ${LANGUAGES[language].name}
        </div>
      </div>
      <div class="wikigap-fact-content">
        ${fact.fact}
      </div>
      <div class="wikigap-fact-footer">
        <a href="${fact.link}" target="_blank" class="wikigap-source-link">
          View on ${LANGUAGES[language].name} Wikipedia
        </a>
      </div>
    `;
    
    factsContainer.appendChild(factCard);
    
    // Add click event to the fact card
    factCard.addEventListener('click', (e) => {
      logUserAction("fact_card_click", {
        factId: fact.id,
        language,
        sentence: fact.fact
      });
      // Don't trigger if clicking on a link
      if (e.target.tagName === 'A') return;
      
      // Clear all highlights
      clearAllHighlights();
      
      // Highlight this fact
      factCard.classList.add('wikigap-fact-highlighted');
      
      // Find and highlight the corresponding underlined text
      const underlinedElement = document.querySelector(`.wikigap-underline[data-fact-id="${fact.id}"]`);
      if (underlinedElement) {
        underlinedElement.classList.add('wikigap-underline-highlighted');
        
        // Scroll to the underlined element
        underlinedElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center'
        });
      }
    });
    
    // Hover effects
    factCard.addEventListener('mouseenter', () => {
      factCard.classList.add('wikigap-fact-hover');
    });
    
    factCard.addEventListener('mouseleave', () => {
      factCard.classList.remove('wikigap-fact-hover');
    });
    
    const linkEl = factCard.querySelector('a.wikigap-source-link');
    if (linkEl) {
      linkEl.addEventListener('click', () => {
        logUserAction("external_link_click", {
          factId: fact.id,
          language,
          url: linkEl.href
        });
      });
    }
  }
  
  // Initialize WikiGap when the page is fully loaded
  window.addEventListener('load', initWikiGap);
  
  // Listen for messages from the popup or background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'toggleWikiGap') {
      const container = document.getElementById('wikigap-container');
      if (container) {
        if (container.classList.contains('wikigap-hidden')) {
          container.classList.remove('wikigap-hidden');
        } else {
          container.classList.add('wikigap-hidden');
        }
      }
      sendResponse({ success: true });
    } else if (message.action === 'updateLanguages') {
      // Update language settings
      if (message.languages) {
        document.getElementById('wikigap-setting-zh').checked = message.languages.zh;
        document.getElementById('wikigap-setting-fr').checked = message.languages.fr;
        document.getElementById('wikigap-setting-ru').checked = message.languages.ru;
        updateSettings();
      }
      sendResponse({ success: true });
    } else if (message.action === 'updateSettings') {
      // Update all settings
      if (message.settings) {
        // Apply settings from the options page
        document.getElementById('wikigap-setting-zh').checked = message.settings.languages.zh;
        document.getElementById('wikigap-setting-fr').checked = message.settings.languages.fr;
        document.getElementById('wikigap-setting-ru').checked = message.settings.languages.ru;
        document.getElementById('wikigap-setting-underline').checked = message.settings.appearance.showUnderlines;
        document.getElementById('wikigap-setting-auto-highlight').checked = message.settings.appearance.autoHighlight;
        updateSettings();
      }
      sendResponse({ success: true });
    }
    
    // Return true to indicate we'll respond asynchronously
    return true;
  });

  function exportLogsToFile() {
    const logs = localStorage.getItem('wikigap_logs');
    if (!logs) {
      alert("No logs found to export.");
      return;
    }
  
    const blob = new Blob([logs], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const filename = `wikigap_logs_${Date.now()}.json`;
  
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Clear logs from localStorage
    localStorage.removeItem('wikigap_logs');
    console.log("WikiGap logs exported and cleared from localStorage.");
  }
