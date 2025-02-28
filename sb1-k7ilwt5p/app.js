document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons
  lucide.createIcons();
  
  // DOM Elements
  const scanForm = document.getElementById('scan-form');
  const urlInput = document.getElementById('url-input');
  const scanButton = document.getElementById('scan-button');
  const errorMessage = document.getElementById('error-message');
  const loadingSection = document.getElementById('loading-section');
  const resultsSection = document.getElementById('results-section');
  const scanDuration = document.getElementById('scan-duration');
  const urlsCount = document.getElementById('urls-count');
  const vulnerabilitiesCount = document.getElementById('vulnerabilities-count');
  const vulnerabilitiesSummary = document.getElementById('vulnerabilities-summary');
  const vulnerabilitiesLabel = document.getElementById('vulnerabilities-label');
  const discoveredUrlsTitle = document.getElementById('discovered-urls-title');
  const urlsTableBody = document.getElementById('urls-table-body');
  const vulnerabilitiesContainer = document.getElementById('vulnerabilities-container');
  
  // Scan stages for the loading spinner
  const scanStages = [
    { message: 'Initializing scan...', icon: 'shield' },
    { message: 'Discovering URLs...', icon: 'search' },
    { message: 'Analyzing server configuration...', icon: 'server' },
    { message: 'Checking for SQL vulnerabilities...', icon: 'database' },
    { message: 'Scanning for XSS vulnerabilities...', icon: 'code' },
    { message: 'Testing for injection attacks...', icon: 'alert-triangle' },
    { message: 'Analyzing authentication mechanisms...', icon: 'lock' },
    { message: 'Checking for file inclusion vulnerabilities...', icon: 'file-warning' },
    { message: 'Testing for SSRF vulnerabilities...', icon: 'network' },
    { message: 'Finalizing results...', icon: 'shield' }
  ];
  
  // Create and update the loading spinner
  function createLoadingSpinner() {
    const loadingSpinner = document.getElementById('loading-spinner');
    loadingSpinner.innerHTML = `
      <div class="loading-spinner-container">
        <div class="loading-spinner-icon-container">
          <div class="loading-spinner-circle"></div>
          <i data-lucide="${scanStages[0].icon}" class="loading-spinner-icon"></i>
        </div>
        <p class="loading-spinner-message">${scanStages[0].message}</p>
        <div class="loading-spinner-progress">
          <div class="loading-spinner-progress-bar" style="width: 0%"></div>
        </div>
        <p class="loading-spinner-time">This may take 1-1.5 minutes...</p>
      </div>
    `;
    lucide.createIcons();
    return loadingSpinner;
  }
  
  // Update the loading spinner with the current progress
  function updateLoadingSpinner(currentStep, totalSteps) {
    const loadingSpinner = document.getElementById('loading-spinner');
    const stageIndex = Math.min(currentStep, scanStages.length - 1);
    const progressPercentage = (currentStep / totalSteps) * 100;
    
    loadingSpinner.innerHTML = `
      <div class="loading-spinner-container">
        <div class="loading-spinner-icon-container">
          <div class="loading-spinner-circle"></div>
          <i data-lucide="${scanStages[stageIndex].icon}" class="loading-spinner-icon"></i>
        </div>
        <p class="loading-spinner-message">${scanStages[stageIndex].message}</p>
        <div class="loading-spinner-progress">
          <div class="loading-spinner-progress-bar" style="width: ${progressPercentage}%"></div>
        </div>
        <p class="loading-spinner-time">This may take 1-1.5 minutes...</p>
      </div>
    `;
    lucide.createIcons();
  }
  
  // Handle form submission
  scanForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const url = urlInput.value.trim();
    
    if (!url) {
      errorMessage.textContent = 'Please enter a URL';
      return;
    }
    
    // Validate URL format
    try {
      // Add protocol if missing
      let urlToScan = url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        urlToScan = 'https://' + url;
        urlInput.value = urlToScan;
      }
      
      new URL(urlToScan);
    } catch (err) {
      errorMessage.textContent = 'Please enter a valid URL (e.g., example.com or https://example.com)';
      return;
    }
    
    // Clear previous error
    errorMessage.textContent = '';
    
    // Show loading and hide results
    loadingSection.classList.remove('hidden');
    resultsSection.classList.add('hidden');
    
    // Create loading spinner
    createLoadingSpinner();
    
    // Disable the scan button
    scanButton.disabled = true;
    scanButton.innerHTML = `
      <div class="spinner"></div>
      <span>Scanning...</span>
    `;
    
    // Record start time
    const startTime = Date.now();
    
    try {
      // Scan the website
      const result = await scanWebsite(urlInput.value, updateLoadingSpinner);
      
      // Calculate scan duration
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000; // in seconds
      
      // Update the UI with results
      displayResults(result, duration);
      
    } catch (err) {
      errorMessage.textContent = 'Failed to scan the website. Please try again.';
      console.error(err);
    } finally {
      // Hide loading and re-enable the scan button
      loadingSection.classList.add('hidden');
      scanButton.disabled = false;
      scanButton.innerHTML = `
        <i data-lucide="search" class="button-icon"></i>
        <span>Scan Website</span>
      `;
      lucide.createIcons();
    }
  });
  
  // Display scan results
  function displayResults(result, duration) {
    // Update summary
    scanDuration.textContent = `${duration.toFixed(1)}s`;
    urlsCount.textContent = result.discoveredUrls.length;
    
    // Count total vulnerabilities
    const totalVulnerabilities = result.vulnerabilities.reduce((total, item) => {
      return total + item.vulnerabilities.length;
    }, 0);
    
    vulnerabilitiesCount.textContent = totalVulnerabilities;
    
    // Update vulnerability summary styling based on results
    if (totalVulnerabilities > 0) {
      vulnerabilitiesSummary.className = 'summary-item summary-item-red';
      vulnerabilitiesLabel.className = 'summary-label red';
      vulnerabilitiesCount.className = 'summary-value red';
    } else {
      vulnerabilitiesSummary.className = 'summary-item summary-item-green';
      vulnerabilitiesLabel.className = 'summary-label green';
      vulnerabilitiesCount.className = 'summary-value green';
    }
    
    // Update discovered URLs title
    discoveredUrlsTitle.textContent = `Discovered URLs (${result.discoveredUrls.length})`;
    
    // Populate URLs table
    urlsTableBody.innerHTML = '';
    result.discoveredUrls.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${item.index}</td>
        <td>${item.url}</td>
        <td>
          <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="url-link">
            Visit <i data-lucide="external-link" class="url-link-icon"></i>
          </a>
        </td>
      `;
      urlsTableBody.appendChild(row);
    });
    
    // Populate vulnerabilities
    vulnerabilitiesContainer.innerHTML = '';
    
    if (result.vulnerabilities.length === 0) {
      vulnerabilitiesContainer.innerHTML = `
        <div class="no-vulnerabilities">
          <i data-lucide="check-circle" class="no-vulnerabilities-icon"></i>
          <p class="no-vulnerabilities-text">No vulnerabilities detected!</p>
        </div>
      `;
    } else {
      result.vulnerabilities.forEach(item => {
        const card = document.createElement('div');
        card.className = 'vulnerability-card';
        
        const header = document.createElement('div');
        header.className = 'vulnerability-header';
        header.innerHTML = `
          <i data-lucide="alert-triangle" class="vulnerability-icon"></i>
          <h3 class="vulnerability-url">${item.url}</h3>
        `;
        
        const list = document.createElement('ul');
        list.className = 'vulnerability-list';
        
        item.vulnerabilities.forEach(vuln => {
          const listItem = document.createElement('li');
          listItem.className = 'vulnerability-item';
          listItem.textContent = vuln;
          list.appendChild(listItem);
        });
        
        card.appendChild(header);
        card.appendChild(list);
        vulnerabilitiesContainer.appendChild(card);
      });
    }
    
    // Show results section
    resultsSection.classList.remove('hidden');
    
    // Initialize Lucide icons for the new elements
    lucide.createIcons();
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
  }
});