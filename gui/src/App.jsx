import React, { useState, useEffect, useRef, useCallback } from 'react';

const API_BASE_URL = 'http://localhost:8080/api/sort';

// Visualizing with Histogram
function HistogramChart({ data }) {
  const MARGIN = { top: 20, right: 20, bottom: 50, left: 55 };
  const WIDTH = 680;
  const HEIGHT = 340;
  const INNER_W = WIDTH - MARGIN.left - MARGIN.right;
  const INNER_H = HEIGHT - MARGIN.top - MARGIN.bottom;

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center text-slate-400 text-sm h-full">
        No data to display
      </div>
    );
  }

  const maxVal = Math.max(...data, 1);
  const yTickCount = 6;
  const yTicks = Array.from({ length: yTickCount + 1 }, (_, i) =>
    Math.round((maxVal / yTickCount) * i)
  );
  const xTickStep = Math.max(1, Math.floor(data.length / 8));
  const xTicks = Array.from({ length: data.length }, (_, i) => i).filter(
    (i) => i % xTickStep === 0 || i === data.length - 1
  );
  const barWidth = INNER_W / data.length;

  return (
    <svg width="100%" viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
      <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
        {yTicks.map((tick) => {
          const y = INNER_H - (tick / maxVal) * INNER_H;
          return <line key={tick} x1={0} y1={y} x2={INNER_W} y2={y} stroke="#e2e8f0" strokeWidth="1" />;
        })}
        {data.map((val, i) => {
          const barH = (val / maxVal) * INNER_H;
          return (
            <rect key={i}
              x={i * barWidth + 0.5} y={INNER_H - barH}
              width={Math.max(barWidth - 1, 1)} height={barH}
              fill="#6fa8dc" stroke="#4a86c0" strokeWidth="0.5"
            />
          );
        })}
        <line x1={0} y1={0} x2={0} y2={INNER_H} stroke="#64748b" strokeWidth="1.5" />
        <line x1={0} y1={INNER_H} x2={INNER_W} y2={INNER_H} stroke="#64748b" strokeWidth="1.5" />
        {yTicks.map((tick) => {
          const y = INNER_H - (tick / maxVal) * INNER_H;
          return (
            <g key={tick}>
              <line x1={-4} y1={y} x2={0} y2={y} stroke="#64748b" strokeWidth="1" />
              <text x={-8} y={y} textAnchor="end" dominantBaseline="middle" fontSize="10" fill="#64748b">
                {tick.toLocaleString()}
              </text>
            </g>
          );
        })}
        {xTicks.map((i) => {
          const x = i * barWidth + barWidth / 2;
          return (
            <g key={i}>
              <line x1={x} y1={INNER_H} x2={x} y2={INNER_H + 4} stroke="#64748b" strokeWidth="1" />
              <text x={x} y={INNER_H + 14} textAnchor="middle" fontSize="10" fill="#64748b">{i}</text>
            </g>
          );
        })}
        <text transform={`translate(-42, ${INNER_H / 2}) rotate(-90)`}
          textAnchor="middle" fontSize="11" fill="#94a3b8" fontWeight="500">Value</text>
        <text x={INNER_W / 2} y={INNER_H + 40}
          textAnchor="middle" fontSize="11" fill="#94a3b8" fontWeight="500">Index</text>
      </g>
    </svg>
  );
}

// Toggle between visualization and instant sort
function Toggle({ enabled, onChange, disabled }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      disabled={disabled}
      className={`relative w-11 h-6 rounded-full transition-colors disabled:opacity-50 focus:outline-none ${
        enabled ? 'bg-indigo-600' : 'bg-slate-300'
      }`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
        enabled ? 'translate-x-5' : 'translate-x-0'
      }`} />
    </button>
  );
}

// Main App
export default function SortingVisualizer() {
  const [activeMode, setActiveMode] = useState('visualize');

  const [arraySize, setArraySize] = useState(50);
  const [arrayDistribution, setArrayDistribution] = useState(1);
  const [algorithmType, setAlgorithmType] = useState(1);
  const [animationSpeed, setAnimationSpeed] = useState(50);
  const [visualizeEnabled, setVisualizeEnabled] = useState(true);

  const [currentArray, setCurrentArray] = useState([]);
  const [frames, setFrames] = useState([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [stats, setStats] = useState(null);
  const [comparisonResults, setComparisonResults] = useState(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [activeInputSource, setActiveInputSource] = useState('generate');
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef(null);
  const timerRef = useRef(null);

  // Input Handling
  const vizSizeLimit = visualizeEnabled ? 100 : 10000;

  const handleSizeChange = (e) => {
    let val = parseInt(e.target.value, 10);
    if (isNaN(val)) val = 1;
    val = Math.min(Math.max(val, 1), vizSizeLimit);
    setArraySize(val);
  };

  const handleModeSwitch = (mode) => {
    setActiveMode(mode);
    setError('');
    stopAnimation();
    if (mode === 'visualize' && visualizeEnabled && arraySize > 100) setArraySize(100);
  };

  const handleVisualizeToggle = (val) => {
    setVisualizeEnabled(val);
    setFrames([]);
    setStats(null);
    stopAnimation();
    if (val && arraySize > 100) setArraySize(100);
  };

  // Array Generation
  const generateArray = useCallback(async () => {
    stopAnimation();
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ size: arraySize, arrayType: arrayDistribution }),
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setCurrentArray(data.arr);
      setFrames([]);
      setStats(null);
      setComparisonResults(null);
      setCurrentFrameIndex(0);
    } catch {
      setError("Could not generate array. Is Spring Boot running?");
    } finally {
      setIsLoading(false);
    }
  }, [arraySize, arrayDistribution]);

  useEffect(() => {
    generateArray();
  }, [arraySize, arrayDistribution, activeMode]);

  // Animation
  const stopAnimation = () => {
    setIsPlaying(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const resetVisualization = () => {
    stopAnimation();
    if (frames.length > 0) {
      setCurrentArray(frames[0]);
      setCurrentFrameIndex(0);
    }
  };

  useEffect(() => {
    if (isPlaying && currentFrameIndex < frames.length) {
      timerRef.current = setTimeout(() => {
        setCurrentArray(frames[currentFrameIndex]);
        setCurrentFrameIndex((prev) => prev + 1);
      }, animationSpeed);
    } else if (currentFrameIndex >= frames.length && frames.length > 0) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timerRef.current);
  }, [isPlaying, currentFrameIndex, frames, animationSpeed]);

  // Sort Handler
  const handleSort = async () => {
    setIsLoading(true);
    setError('');
    try {
      if (visualizeEnabled) {
        // Animated path
        const response = await fetch(`${API_BASE_URL}/visualize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ arr: currentArray, type: algorithmType }),
        });
        if (!response.ok) throw new Error();
        const data = await response.json();
        setFrames(data.frames);
        setStats({ time: data.finishTimeNs, comparisons: data.stats.comparisons, swaps: data.stats.swaps });
        setCurrentFrameIndex(0);
        setIsPlaying(true);
      } else {
        // Instant sort 
        const response = await fetch(`${API_BASE_URL}/sort`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ arr: currentArray, type: algorithmType }),
        });
        if (!response.ok) throw new Error();
        const data = await response.json();
        setCurrentArray(data.sortedArray);
        setStats({ time: data.elapsedNanos, comparisons: data.stats.comparisons, swaps: data.stats.swaps });
        setFrames([]);
      }
    } catch {
      setError("Server connection failed. Is Spring Boot running?");
    } finally {
      setIsLoading(false);
    }
  };

  // Compare Handler
  const handleCompare = async () => {
    setIsLoading(true);
    setError('');
    try {
      if (activeInputSource === 'file') {
        if (uploadedFiles.length === 0) {
          setError('Please upload at least one file first.');
          setIsLoading(false);
          return;
        }
        const allRows = [];
        for (const file of uploadedFiles) {
          const response = await fetch(`${API_BASE_URL}/compare`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ arr: file.arr, arraySource: file.name }),
          });
          if (!response.ok) throw new Error();
          const data = await response.json();
          allRows.push(...data.rows.map((r) => ({ ...r, arraySource: file.name })));
        }
        setComparisonResults({ rows: allRows });
      } else {
        const response = await fetch(`${API_BASE_URL}/compare`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ arr: currentArray, arrayType: arrayDistribution }),
        });
        if (!response.ok) throw new Error();
        const data = await response.json();
        setComparisonResults(data);
      }
    } catch {
      setError("Server connection failed. Ensure backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  // File Upload Handling
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setFileError('');
    if (files.length === 0) return;
    const results = [];
    let processed = 0;
    const errors = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const arr = evt.target.result
            .split(',')
            .map((s) => parseInt(s.trim(), 10))
            .filter((n) => !isNaN(n));
          if (arr.length === 0) errors.push(`"${file.name}" has no valid integers.`);
          else if (arr.length > 10000) errors.push(`"${file.name}" exceeds 10,000 values.`);
          else results.push({ name: file.name, arr });
        } catch {
          errors.push(`"${file.name}" could not be read.`);
        }
        processed++;
        if (processed === files.length) {
          if (errors.length > 0) setFileError(errors.join(' '));
          setUploadedFiles((prev) => {
            const existing = prev.filter((f) => !results.find((r) => r.name === f.name));
            return [...existing, ...results];
          });
        }
      };
      reader.readAsText(file);
    });
    e.target.value = '';
  };

  const removeUploadedFile = (name) =>
    setUploadedFiles((prev) => prev.filter((f) => f.name !== name));

  // CSV Export Handler
  const handleExportCsv = async () => {
    if (!comparisonResults) return;
    const headers = ['Algorithm Name', 'Array Size', 'Array Source', 'Number of Runs',
                     'Avg Runtime (ns)', 'Min Runtime (ns)', 'Max Runtime (ns)',
                     'Comparisons', 'Interchanges'];
    const rows = comparisonResults.rows.map((row) => [
      row.algorithmName, row.arraySize, row.arraySource, row.numberOfRuns,
      row.averageRuntimeNanos, row.minRuntimeNanos, row.maxRuntimeNanos,
      row.comparisons, row.interchanges,
    ]);
    const csvContent = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    if (window.showSaveFilePicker) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: `sortalyze_comparison_${Date.now()}.csv`,
          types: [{ description: 'CSV file', accept: { 'text/csv': ['.csv'] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
      } catch (err) {
        if (err.name !== 'AbortError') setError('Failed to save file.');
      }
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sortalyze_comparison_${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Helpers
  const algoNames = ['Bubble Sort', 'Heap Sort', 'Insertion Sort', 'Merge Sort', 'Quick Sort', 'Selection Sort'];
  const distNames  = ['Random (Scattered)', 'Sorted (Ascending)', 'Inversely Sorted (Descending)'];

  const sortBtnLabel = () => {
    if (isLoading) return 'Processing…';
    if (!visualizeEnabled) return 'Sort Now';
    if (frames.length > 0 && currentFrameIndex > 0) return 'Resume';
    return 'Start Sorting';
  };

  const sortBtnAction = () => {
    if (visualizeEnabled && frames.length > 0 && currentFrameIndex > 0) {
      setIsPlaying(true);
    } else {
      handleSort();
    }
  };

  // HTML structure
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans">

      {/* Top Nav */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-indigo-600 tracking-tight">Sortalyze</h1>
          <p className="text-slate-400 text-xs mt-0.5">Algorithm Analysis & Visualization</p>
        </div>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
          <button onClick={() => handleModeSwitch('visualize')}
            className={`px-5 py-2 rounded-md text-sm font-semibold transition-all ${activeMode === 'visualize' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}>
            Visualization
          </button>
          <button onClick={() => handleModeSwitch('compare')}
            className={`px-5 py-2 rounded-md text-sm font-semibold transition-all ${activeMode === 'compare' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}>
            Comparison
          </button>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="mx-6 mt-4 bg-red-50 border-l-4 border-red-500 px-4 py-3 rounded-r-md">
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Visualization Mode */}
      {activeMode === 'visualize' && (
        <div className="flex h-[calc(100vh-73px)]">

          {/* LEFT PANEL */}
          <aside className="w-72 shrink-0 bg-white border-r border-slate-200 flex flex-col p-6 gap-5 overflow-y-auto shadow-sm">

            {/* Array Size */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Array Size
                <span className="ml-1 text-slate-300 font-normal normal-case">
                  (max {vizSizeLimit.toLocaleString()})
                </span>
              </label>
              <input type="number" value={arraySize} onChange={handleSizeChange}
                min={1} max={vizSizeLimit} disabled={isPlaying || isLoading}
                className="border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ring-indigo-400 disabled:opacity-50"
              />
            </div>

            {/* Distribution */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Distribution</label>
              <select value={arrayDistribution}
                onChange={(e) => setArrayDistribution(Number(e.target.value))}
                disabled={isPlaying || isLoading}
                className="border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ring-indigo-400 disabled:opacity-50">
                <option value={1}>Random</option>
                <option value={2}>Sorted (Ascending)</option>
                <option value={3}>Inversely Sorted</option>
              </select>
            </div>

            {/* Algorithm */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Algorithm</label>
              <select value={algorithmType}
                onChange={(e) => setAlgorithmType(Number(e.target.value))}
                disabled={isPlaying || isLoading}
                className="border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ring-indigo-400 disabled:opacity-50">
                {algoNames.map((name, i) => (
                  <option key={i} value={i + 1}>{name}</option>
                ))}
              </select>
            </div>

            {/* Visualization Toggle */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-slate-600">Visualization</p>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  {visualizeEnabled
                    ? 'Animated step-by-step (max 100)'
                    : 'Instant result only (max 10,000)'}
                </p>
              </div>
              <Toggle
                enabled={visualizeEnabled}
                onChange={handleVisualizeToggle}
                disabled={isPlaying || isLoading}
              />
            </div>

            {/* Animation Speed — only when visualization is on */}
            {visualizeEnabled && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Speed
                  <span className="ml-1 text-slate-300 font-normal normal-case">({animationSpeed}ms delay)</span>
                </label>
                <input type="range" min={10} max={300} value={animationSpeed}
                  onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                  className="accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Fast</span><span>Slow</span>
                </div>
              </div>
            )}

            <hr className="border-slate-100" />

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              <button onClick={generateArray} disabled={isPlaying || isLoading}
                className="w-full py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors disabled:opacity-50">
                Generate New Array
              </button>

              {isPlaying ? (
                <button onClick={stopAnimation}
                  className="w-full py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold transition-colors">
                  Pause
                </button>
              ) : (
                <button onClick={sortBtnAction} disabled={isLoading}
                  className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors disabled:opacity-50">
                  {sortBtnLabel()}
                </button>
              )}

              {visualizeEnabled && frames.length > 0 && !isPlaying && currentFrameIndex > 0 && (
                <button onClick={resetVisualization}
                  className="w-full py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-medium transition-colors">
                  Reset
                </button>
              )}
            </div>

            {/* Stats */}
            {stats && (
              <div className="mt-auto">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Results</p>
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Comparisons</span>
                    <span className="text-sm font-mono font-bold text-slate-800">{stats.comparisons.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Interchanges</span>
                    <span className="text-sm font-mono font-bold text-slate-800">{stats.swaps.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Time (ns)</span>
                    <span className="text-sm font-mono font-bold text-slate-800">{stats.time.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </aside>

          {/* Chart (Right Panel) */}
          <main className="flex-1 flex flex-col bg-white p-8 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-700">
                  {algoNames[algorithmType - 1]} — {distNames[arrayDistribution - 1]}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                  Array size: {currentArray.length}
                  {!visualizeEnabled && (
                    <span className="bg-amber-100 text-amber-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      Visualization off
                    </span>
                  )}
                </p>
              </div>
              {visualizeEnabled && frames.length > 0 && (
                <span className="text-xs font-mono bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
                  Step {currentFrameIndex} / {frames.length}
                </span>
              )}
            </div>
            <div className="flex-1 flex items-center justify-center bg-white rounded-xl border border-slate-100">
              <HistogramChart data={currentArray} />
            </div>
          </main>
        </div>
      )}

      {/* Compare Mode */}
      {activeMode === 'compare' && (
        <div className="flex h-[calc(100vh-73px)]">

          {/* LEFT PANEL */}
          <aside className="w-72 shrink-0 bg-white border-r border-slate-200 flex flex-col p-6 gap-5 shadow-sm overflow-y-auto">

            {/* Input Source Toggle */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Input Source</p>
              <div className="flex rounded-lg overflow-hidden border border-slate-200">
                <button
                  onClick={() => { setActiveInputSource('generate'); setFileError(''); }}
                  className={`flex-1 py-2 text-xs font-semibold transition-colors ${activeInputSource === 'generate' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                  Generate
                </button>
                <button
                  onClick={() => setActiveInputSource('file')}
                  className={`flex-1 py-2 text-xs font-semibold transition-colors ${activeInputSource === 'file' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                  From Files
                </button>
              </div>
            </div>

            {/* Generate Controls */}
            {activeInputSource === 'generate' && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Array Size <span className="text-slate-300 font-normal normal-case">(max 10,000)</span>
                  </label>
                  <input type="number" value={arraySize} onChange={handleSizeChange}
                    min={1} max={10000} disabled={isLoading}
                    className="border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ring-indigo-400 disabled:opacity-50"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Distribution</label>
                  <select value={arrayDistribution}
                    onChange={(e) => setArrayDistribution(Number(e.target.value))}
                    disabled={isLoading}
                    className="border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ring-indigo-400 disabled:opacity-50">
                    <option value={1}>Random</option>
                    <option value={2}>Sorted (Ascending)</option>
                    <option value={3}>Inversely Sorted</option>
                  </select>
                </div>
                <button onClick={generateArray} disabled={isLoading}
                  className="w-full py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors disabled:opacity-50">
                  Generate New Array
                </button>
                {currentArray.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Preview</p>
                    <div className="h-20 flex items-end gap-[1px] bg-slate-50 rounded-lg p-2 border border-slate-100">
                      {currentArray.slice(0, 80).map((val, idx) => {
                        const max = Math.max(...currentArray, 1);
                        return (
                          <div key={idx}
                            style={{ height: `${(val / max) * 100}%`, width: `${100 / Math.min(currentArray.length, 80)}%` }}
                            className="bg-indigo-400 rounded-t-sm"
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* File Upload Controls */}
            {activeInputSource === 'file' && (
              <>
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Upload Files</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Each <code className="bg-slate-100 px-1 rounded">.txt</code> file must contain comma-separated integers. Max 10,000 values per file.
                  </p>
                  <input ref={fileInputRef} type="file" accept=".txt" multiple
                    onChange={handleFileUpload} className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2 rounded-lg border-2 border-dashed border-indigo-300 hover:border-indigo-500 text-indigo-500 hover:text-indigo-700 text-sm font-semibold transition-colors bg-indigo-50 hover:bg-indigo-100">
                    + Add Files
                  </button>
                  {fileError && (
                    <p className="text-[11px] text-rose-500 bg-rose-50 border border-rose-100 rounded p-2">{fileError}</p>
                  )}
                </div>
                {uploadedFiles.length > 0 && (
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Queued Files ({uploadedFiles.length})
                    </p>
                    {uploadedFiles.map((f) => (
                      <div key={f.name} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                        <div className="overflow-hidden">
                          <p className="text-xs font-semibold text-slate-700 truncate" title={f.name}>{f.name}</p>
                          <p className="text-[10px] text-slate-400">{f.arr.length.toLocaleString()} values</p>
                        </div>
                        <button onClick={() => removeUploadedFile(f.name)}
                          className="ml-2 text-slate-300 hover:text-rose-500 transition-colors text-lg leading-none shrink-0"
                          title="Remove">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            <hr className="border-slate-100" />

            {/* Run + Export */}
            <div className="flex flex-col gap-2">
              <button onClick={handleCompare} disabled={isLoading}
                className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors disabled:opacity-50">
                {isLoading ? 'Running Benchmarks…' : 'Run Comparison'}
              </button>
              <button onClick={handleExportCsv} disabled={!comparisonResults}
                className="w-full py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-sm font-semibold transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export as CSV
              </button>
            </div>
          </aside>

          {/* Results Table (Right Panel) */}
          <main className="flex-1 bg-white overflow-auto p-8">
            <div className="mb-6">
              <h2 className="text-base font-bold text-slate-700 mb-1">Comparison Results</h2>
              <p className="text-xs text-slate-400">
                {activeInputSource === 'generate'
                  ? `${distNames[arrayDistribution - 1]} · ${currentArray.length} elements · 5 runs each`
                  : `${uploadedFiles.length} file(s) loaded · 5 runs each`}
              </p>
            </div>

            {comparisonResults ? (
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b-2 border-slate-200">
                    {['Algorithm', 'Source', 'Array Size', 'Avg Runtime (ns)', 'Min (ns)', 'Max (ns)', 'Comparisons', 'Interchanges'].map((h) => (
                      <th key={h} className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {comparisonResults.rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-indigo-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-indigo-600">{row.algorithmName}</td>
                      <td className="px-4 py-3 text-xs text-slate-400 max-w-[120px] truncate" title={row.arraySource}>{row.arraySource}</td>
                      <td className="px-4 py-3 font-mono text-slate-500 text-xs">{row.arraySize?.toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono text-slate-700">{row.averageRuntimeNanos.toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono text-slate-400 text-xs">{row.minRuntimeNanos.toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono text-slate-400 text-xs">{row.maxRuntimeNanos.toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono text-slate-700">{row.comparisons.toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono text-slate-700">{row.interchanges.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl">
                <svg className="w-10 h-10 mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-sm font-medium text-slate-500">No comparison data yet</p>
                <p className="text-xs mt-1 text-slate-400">Configure your input and click "Run Comparison"</p>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}