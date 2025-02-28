// List of all possible vulnerabilities
const allVulnerabilities = [
  'SQL injection vulnerability',
  'Remote File Inclusion (RFI) vulnerability',
  'Command Injection vulnerability',
  'Software and Data Integrity Failures vulnerability',
  'Server-Side Request Forgery (SSRF) vulnerability',
  'Cross-site scripting (XSS) vulnerability',
  'Broken Access Control vulnerability',
  'Insufficient Logging and Monitoring vulnerability',
  'Security Misconfiguration vulnerability',
  'Insecure server configuration',
  'Cryptographic Failure vulnerability',
  'Insecure Design vulnerability',
  'Identification and Authentication Failures vulnerability',
  'Local File Inclusion (LFI) vulnerability',
  'Directory Traversal vulnerability',
  'Open Redirect vulnerability',
  'HTTP Header Injection vulnerability',
  'Vulnerable and Outdated Components vulnerability'
];

// Cache to store results for each URL
const scanResultsCache = {};

// Function to generate a deterministic seed from a string
const generateSeed = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

// Seeded random number generator
const seededRandom = (seed) => {
  let state = seed;
  return () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
};

// Function to get random items from an array using a seeded random function
const getSeededRandomItems = (array, min, max, randomFn) => {
  const count = Math.floor(randomFn() * (max - min + 1)) + min;
  
  // Create a copy of the array to shuffle
  const arrayCopy = [...array];
  
  // Fisher-Yates shuffle with seeded random
  for (let i = arrayCopy.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    [arrayCopy[i], arrayCopy[j]] = [arrayCopy[j], arrayCopy[i]];
  }
  
  return arrayCopy.slice(0, count);
};

// Function to get random number between min and max (inclusive) using a seeded random function
const getSeededRandomNumber = (min, max, randomFn) => {
  return Math.floor(randomFn() * (max - min + 1)) + min;
};

// Function to simulate scanning progress
const simulateScanningProgress = async (totalTime, onProgress) => {
  const steps = 8; // Increased number of progress steps
  const stepTime = totalTime / steps;
  
  for (let i = 0; i < steps; i++) {
    // Add some randomness to each step time
    const randomStepTime = stepTime * (0.8 + Math.random() * 0.4);
    await new Promise(resolve => setTimeout(resolve, randomStepTime));
    
    // Call the progress callback with the current step
    if (onProgress) {
      onProgress(i + 1, steps);
    }
  }
};

// This function simulates the results from the Python code
const scanWebsite = async (url, onProgress) => {
  try {
    // Normalize the URL to ensure consistent caching
    const normalizedUrl = url.toLowerCase().trim();
    
    // Check if we already have results for this URL
    if (scanResultsCache[normalizedUrl]) {
      // Still simulate the scanning process for UX purposes
      const scanTime = 60000; // Fixed time for cached results (1 minute)
      await simulateScanningProgress(scanTime, onProgress);
      return scanResultsCache[normalizedUrl];
    }
    
    // Generate a seed from the URL for deterministic randomness
    const seed = generateSeed(normalizedUrl);
    const randomFn = seededRandom(seed);
    
    // Simulate a scanning process (60-90 seconds)
    const scanTime = getSeededRandomNumber(60000, 90000, randomFn);
    await simulateScanningProgress(scanTime, onProgress);
    
    // Mock discovered URLs based on the input URL
    const baseUrl = normalizedUrl.endsWith('/') ? normalizedUrl.slice(0, -1) : normalizedUrl;
    
    // Generate paths for discovered URLs
    const possiblePaths = [
      '/about', '/contact', '/login', '/admin', '/blog', '/products', 
      '/services', '/faq', '/support', '/careers', '/news', '/events',
      '/gallery', '/team', '/partners', '/resources', '/downloads'
    ];
    
    // Select paths deterministically based on the URL
    const selectedPaths = getSeededRandomItems(possiblePaths, 4, 10, randomFn);
    
    const discoveredUrls = [
      { url: baseUrl, index: 1 },
      ...selectedPaths.map((path, index) => ({
        url: `${baseUrl}${path}`,
        index: index + 2
      }))
    ];
    
    const mockResponse = {
      discoveredUrls,
      vulnerabilities: []
    };
    
    // Decide if the main URL has vulnerabilities (deterministic based on URL)
    if (randomFn() < 0.7) {
      // Get vulnerabilities for the main URL
      const mainVulnerabilities = getSeededRandomItems(allVulnerabilities, 2, 5, randomFn);
      mockResponse.vulnerabilities.push({
        url: baseUrl,
        vulnerabilities: mainVulnerabilities
      });
    }
    
    // Add vulnerabilities to some of the discovered URLs
    const urlsToAddVulnerabilities = Math.floor(discoveredUrls.length * (0.3 + randomFn() * 0.2));
    
    // Skip the first URL (already handled above)
    // Sort deterministically based on URL
    const urlsForVulnerabilities = [...discoveredUrls.slice(1)]
      .sort((a, b) => {
        // Use the random function to sort, but in a way that's deterministic for this URL
        return randomFn() - 0.5;
      })
      .slice(0, urlsToAddVulnerabilities);
    
    urlsForVulnerabilities.forEach(urlObj => {
      // Get vulnerabilities for each URL
      const urlVulnerabilities = getSeededRandomItems(allVulnerabilities, 1, 3, randomFn);
      mockResponse.vulnerabilities.push({
        url: urlObj.url,
        vulnerabilities: urlVulnerabilities
      });
    });
    
    // If the URL doesn't use HTTPS, always add an insecure configuration vulnerability
    if (!normalizedUrl.startsWith('https://') && !mockResponse.vulnerabilities.some(v => 
      v.url === baseUrl && v.vulnerabilities.includes('Insecure server configuration'))) {
      
      // Find if the main URL already has vulnerabilities
      const mainUrlVulnIndex = mockResponse.vulnerabilities.findIndex(v => v.url === baseUrl);
      
      if (mainUrlVulnIndex >= 0) {
        // Add to existing vulnerabilities
        mockResponse.vulnerabilities[mainUrlVulnIndex].vulnerabilities.push('Insecure server configuration');
      } else {
        // Create new entry
        mockResponse.vulnerabilities.push({
          url: baseUrl,
          vulnerabilities: ['Insecure server configuration']
        });
      }
    }
    
    // Cache the results for future scans
    scanResultsCache[normalizedUrl] = mockResponse;
    
    return mockResponse;
  } catch (error) {
    console.error('Error scanning website:', error);
    throw new Error('Failed to scan website');
  }
};