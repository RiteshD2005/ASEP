import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, Globe, Search } from 'lucide-react';
import { scanWebsite } from './api/scanner';
import VulnerabilityCard from './components/VulnerabilityCard';
import UrlTable from './components/UrlTable';
import LoadingSpinner from './components/LoadingSpinner';

interface Vulnerability {
  url: string;
  vulnerabilities: string[];
}

interface DiscoveredUrl {
  url: string;
  index: number;
}

interface ScanResult {
  discoveredUrls: DiscoveredUrl[];
  vulnerabilities: Vulnerability[];
  message?: string;
  error?: string;
}

function App() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanStartTime, setScanStartTime] = useState<number | null>(null);
  const [scanDuration, setScanDuration] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      setError('Please enter a URL');
      return;
    }

    // Validate URL format
    try {
      // Add protocol if missing
      let urlToScan = url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        urlToScan = 'https://' + url;
        setUrl(urlToScan);
      }
      
      new URL(urlToScan);
    } catch (err) {
      setError('Please enter a valid URL (e.g., example.com or https://example.com)');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setScanDuration(null);
    const startTime = Date.now();
    setScanStartTime(startTime);

    try {
      const scanResult = await scanWebsite(url);
      const endTime = Date.now();
      setScanDuration(endTime - startTime);
      setResult(scanResult);
    } catch (err) {
      setError('Failed to scan the website. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Count total vulnerabilities
  const totalVulnerabilities = result?.vulnerabilities.reduce((total, item) => {
    return total + item.vulnerabilities.length;
  }, 0) || 0;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield size={32} className="text-white" />
            <div>
              <h1 className="text-2xl font-bold">VULN-TRACKER</h1>
              <p className="text-sm opacity-80">A tool to scan websites for vulnerabilities</p>
            </div>
          </div>
          <div className="text-sm">
            <p>Made by: VIT Students (Software)</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-8 px-4 flex-grow">
        {/* URL Input Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Enter Website URL to Scan</h2>
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Globe className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="example.com or https://example.com"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-md shadow-sm flex items-center justify-center transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Scanning...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Scan Website
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Section */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-col items-center justify-center py-12">
              <LoadingSpinner size="large" />
            </div>
          </div>
        )}

        {result && !isLoading && (
          <div className="space-y-8">
            {/* Scan Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Scan Summary
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-800 font-medium">Scan Duration</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {scanDuration ? `${(scanDuration / 1000).toFixed(1)}s` : '0s'}
                  </p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <p className="text-indigo-800 font-medium">URLs Discovered</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {result.discoveredUrls.length}
                  </p>
                </div>
                <div className={`${totalVulnerabilities > 0 ? 'bg-red-50' : 'bg-green-50'} p-4 rounded-lg`}>
                  <p className={`${totalVulnerabilities > 0 ? 'text-red-800' : 'text-green-800'} font-medium`}>
                    Vulnerabilities Found
                  </p>
                  <p className={`text-2xl font-bold ${totalVulnerabilities > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {totalVulnerabilities}
                  </p>
                </div>
              </div>
            </div>

            {/* Discovered URLs */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Discovered URLs ({result.discoveredUrls.length})
              </h2>
              <UrlTable urls={result.discoveredUrls} />
            </div>

            {/* Vulnerabilities */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Vulnerabilities Found
              </h2>
              
              {result.vulnerabilities.length === 0 ? (
                <div className="flex items-center justify-center py-8 bg-green-50 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                  <p className="text-green-700 font-medium">No vulnerabilities detected!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {result.vulnerabilities.map((item, index) => (
                    <VulnerabilityCard 
                      key={index} 
                      url={item.url} 
                      vulnerabilities={item.vulnerabilities} 
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-lg font-semibold">VULN-TRACKER</p>
              <p className="text-sm text-gray-400">A tool to scan websites for vulnerabilities</p>
            </div>
            <div className="text-center md:text-right">
              <p className="font-medium">Rameez Pathan</p>
              <p className="text-sm text-gray-400">FY (Software Engineer) | Python Developer | Cyber Security Enthusiast | VIT Student</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;