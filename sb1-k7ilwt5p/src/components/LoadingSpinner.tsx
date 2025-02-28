import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Search, Server, Database, Code, Lock, FileWarning, Network } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  message = 'Loading...' 
}) => {
  const sizeClasses = {
    small: 'h-4 w-4 border-2',
    medium: 'h-8 w-8 border-3',
    large: 'h-12 w-12 border-4'
  };

  const [scanStage, setScanStage] = useState(0);
  const [scanMessage, setScanMessage] = useState('Initializing scan...');
  
  const scanStages = [
    { message: 'Initializing scan...', icon: Shield },
    { message: 'Discovering URLs...', icon: Search },
    { message: 'Analyzing server configuration...', icon: Server },
    { message: 'Checking for SQL vulnerabilities...', icon: Database },
    { message: 'Scanning for XSS vulnerabilities...', icon: Code },
    { message: 'Testing for injection attacks...', icon: AlertTriangle },
    { message: 'Analyzing authentication mechanisms...', icon: Lock },
    { message: 'Checking for file inclusion vulnerabilities...', icon: FileWarning },
    { message: 'Testing for SSRF vulnerabilities...', icon: Network },
    { message: 'Finalizing results...', icon: Shield }
  ];
  
  useEffect(() => {
    let isMounted = true;
    
    const advanceScanStage = () => {
      if (!isMounted) return;
      
      setScanStage(prevStage => {
        const newStage = prevStage + 1;
        if (newStage < scanStages.length) {
          setScanMessage(scanStages[newStage].message);
          return newStage;
        }
        return prevStage;
      });
    };
    
    // Set up timers for each stage with random intervals
    const timers: NodeJS.Timeout[] = [];
    let cumulativeTime = 0;
    
    for (let i = 0; i < scanStages.length - 1; i++) {
      // Random time between 6-10 seconds for each stage
      const randomTime = Math.floor(Math.random() * 4000) + 6000;
      cumulativeTime += randomTime;
      
      const timer = setTimeout(advanceScanStage, cumulativeTime);
      timers.push(timer);
    }
    
    return () => {
      isMounted = false;
      timers.forEach(timer => clearTimeout(timer));
    };
  }, []);
  
  const CurrentIcon = scanStages[scanStage].icon;

  return (
    <div className="flex flex-col items-center justify-center py-6">
      <div className="flex items-center justify-center mb-6">
        <div className={`animate-spin ${sizeClasses[size]} border-indigo-500 border-t-transparent rounded-full mr-3`}></div>
        <CurrentIcon className="h-6 w-6 text-indigo-500" />
      </div>
      <p className="text-gray-700 font-medium">{scanMessage}</p>
      <div className="w-full max-w-md mt-6 bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${(scanStage / (scanStages.length - 1)) * 100}%` }}
        ></div>
      </div>
      <p className="text-sm text-gray-500 mt-2">This may take 1-1.5 minutes...</p>
    </div>
  );
};

export default LoadingSpinner;