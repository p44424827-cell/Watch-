/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock,
  Play,
  Clipboard,
  Star,
  VolumeX,
  Search,
  Info,
  Users,
  BarChart3,
  Database,
  Lock,
  Unlock,
  ShieldCheck,
  ChevronRight,
  Save,
  Trash2,
  Trash,
  ChevronLeft,
  Settings,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type ViewOption = 6 | 10 | 15 | 21;

const getEmbedUrl = (url: string) => {
  if (!url) return '';
  
  // YouTube regex for multiple formats: standard, short-links, shorts, mobile
  const youtubeRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/|m.youtube.com\/watch\?v=)([^#\&\?]*).*/;
  const match = url.match(youtubeRegExp);

  if (match && match[2].length === 11) {
    const videoId = match[2];
    const origin = window.location.origin;
    // Return embedded URL with necessary flags for autoplay and looping
    // Adding origin parameter helps fix embedding restrictions in certain environments
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&playlist=${videoId}&loop=1&origin=${encodeURIComponent(origin)}`;
  }
  
  return url;
};

export default function App() {
  const [url, setUrl] = useState('');
  const [activeUrl, setActiveUrl] = useState('');
  const [viewCount, setViewCount] = useState<ViewOption>(6);
  const [isStarted, setIsStarted] = useState(false);
  const [showLoadingAd, setShowLoadingAd] = useState(false);
  const [adTimer, setAdTimer] = useState(5);
  const [sessionSeconds, setSessionSeconds] = useState(0);

  // Admin and Settings State
  const [currentView, setCurrentView] = useState<'app' | 'admin'>('app');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [secretCounter, setSecretCounter] = useState(0);
  const [appSettings, setAppSettings] = useState(() => {
    const saved = localStorage.getItem('browserProSettings');
    return saved ? JSON.parse(saved) : {
      adTimerDuration: 5,
      showAnnouncementBar: true,
      showHomeBannerAd: true,
      allowUnlimitedViews: false,
      appLanguage: 'English',
      adSenseClientId: 'ca-pub-XXXXXXXXXXXX',
      adUnitId: '1234567890'
    };
  });

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    // Only save when explicitly requested via button instead of every keystroke for better UX
  }, []);

  const handleSaveSettings = () => {
    setSaveStatus('saving');
    localStorage.setItem('browserProSettings', JSON.stringify(appSettings));
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 600);
  };

  // Mock User Data
  const [mockUsers, setMockUsers] = useState([
    { id: '1', email: 'user1@example.com', views: 42, status: 'Active', joined: '2026-04-10' },
    { id: '2', email: 'p44424827@gmail.com', views: 120, status: 'Active', joined: '2026-04-15' },
    { id: '3', email: 'test_dev@ais.com', views: 5, status: 'Blocked', joined: '2026-04-18' },
    { id: '4', email: 'guest_99@provider.net', views: 18, status: 'Active', joined: '2026-04-19' },
  ]);

  const viewOptions: ViewOption[] = [6, 10, 15, 21];

  const handleStart = () => {
    if (!url) return;
    setShowLoadingAd(true);
    setAdTimer(appSettings.adTimerDuration);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPin === '1234') { // Mock PIN
      setIsAdminAuthenticated(true);
    } else {
      alert('Invalid Admin PIN');
      setAdminPin('');
    }
  };

  const toggleAdmin = () => {
    if (currentView === 'app') {
      setCurrentView('admin');
    } else {
      setCurrentView('app');
    }
  };

  const handleSecretClick = () => {
    setSecretCounter(prev => {
      const next = prev + 1;
      if (next >= 5) {
        setCurrentView('admin');
        return 0;
      }
      return next;
    });
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showLoadingAd && adTimer > 0) {
      interval = setInterval(() => {
        setAdTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showLoadingAd, adTimer]);

  const confirmStart = () => {
    let formattedUrl = url;
    if (!/^https?:\/\//i.test(url)) {
      formattedUrl = 'https://' + url;
    }
    // Transform YouTube links to embed format immediately
    const embedUrl = getEmbedUrl(formattedUrl);
    setActiveUrl(embedUrl);
    setShowLoadingAd(false);
    setIsStarted(true);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isStarted) {
      timer = setInterval(() => {
        setSessionSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setSessionSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isStarted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStop = () => {
    setIsStarted(false);
    setActiveUrl('');
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch (err) {
      console.error('Failed to read clipboard', err);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#fce4ec] overflow-hidden font-sans">
      <main className="flex-1 overflow-y-auto relative">
        <AnimatePresence mode="wait">
          {currentView === 'admin' ? (
            <motion.div 
              key="admin"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full flex flex-col bg-slate-50 overflow-hidden font-sans"
            >
              <div className="bg-indigo-700 text-white p-4 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6" />
                  <h1 className="font-black italic tracking-tight text-xl uppercase">Admin Panel</h1>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={handleSaveSettings}
                    disabled={saveStatus !== 'idle'}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black uppercase italic transition-all ${
                      saveStatus === 'saved' ? 'bg-green-500 text-white' : 
                      saveStatus === 'saving' ? 'bg-indigo-300 text-white cursor-wait' : 
                      'bg-white text-indigo-700 hover:bg-slate-100'
                    } shadow-md active:scale-95`}
                  >
                    {saveStatus === 'saved' ? <ShieldCheck className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    {saveStatus === 'saved' ? 'Config Saved ✓' : saveStatus === 'saving' ? 'Saving...' : 'Save Config'}
                  </button>
                  <button 
                    onClick={() => setCurrentView('app')}
                    className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold"
                  >
                    <ChevronLeft className="w-4 h-4" /> Exit
                  </button>
                </div>
              </div>

              {!isAdminAuthenticated ? (
                <div className="flex-1 flex items-center justify-center p-6 bg-[#fce4ec]">
                  <motion.form 
                    onSubmit={handleAdminLogin}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm border-t-8 border-indigo-600 space-y-6"
                  >
                    <div className="text-center">
                      <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-indigo-600" />
                      </div>
                      <h2 className="text-2xl font-black text-slate-800 uppercase italic">Restricted Access</h2>
                      <p className="text-sm text-slate-400 font-medium italic">Enter Admin Security PIN</p>
                    </div>

                    <input 
                      type="password" 
                      placeholder="Enter 4-digit PIN..." 
                      value={adminPin}
                      onChange={(e) => setAdminPin(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-center text-2xl font-black tracking-[1em] focus:border-indigo-500 focus:outline-none transition-colors"
                      maxLength={4}
                    />

                    <button 
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-100 transition-all uppercase tracking-widest text-sm"
                    >
                      Authenticate Access
                    </button>
                  </motion.form>
                </div>
              ) : (
                <div className="flex-1 flex overflow-hidden">
                  {/* Admin Sidebar */}
                  <div className="w-64 bg-white border-r flex flex-col shrink-0">
                    <div className="p-6 space-y-1">
                      <button className="w-full flex items-center gap-3 p-3 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-sm">
                        <Settings className="w-4 h-4" /> App Settings
                      </button>
                      <button className="w-full flex items-center gap-3 p-3 text-slate-400 hover:bg-slate-50 rounded-xl font-bold text-sm transition-colors">
                        <Users className="w-4 h-4" /> User Data
                      </button>
                      <button className="w-full flex items-center gap-3 p-3 text-slate-400 hover:bg-slate-50 rounded-xl font-bold text-sm transition-colors">
                        <BarChart3 className="w-4 h-4" /> Analytics
                      </button>
                    </div>
                    <div className="mt-auto p-6 border-t bg-slate-50/50">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Logged in as</div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px] font-black">AD</div>
                        <div className="text-xs font-black text-slate-800">Admin_p444...</div>
                      </div>
                    </div>
                  </div>

                  {/* Admin Content */}
                  <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
                    <div className="max-w-4xl mx-auto space-y-8">
                      <header>
                        <h2 className="text-3xl font-black text-slate-800 uppercase italic tracking-tight">Application Settings</h2>
                        <p className="text-slate-500 font-medium italic">Configure global parameters for WatchX</p>
                      </header>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Setting Card: Ad Timer */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                              <Clock className="w-5 h-5 text-indigo-600" />
                            </div>
                            <span className="font-black text-slate-800 text-sm uppercase italic">Ad Interstitial Duration</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <input 
                              type="range" 
                              min="3" 
                              max="30" 
                              value={appSettings.adTimerDuration}
                              onChange={(e) => setAppSettings(prev => ({...prev, adTimerDuration: parseInt(e.target.value)}))}
                              className="flex-1 accent-indigo-600"
                            />
                            <span className="bg-indigo-600 text-white px-3 py-1 rounded-lg font-black text-xs">{appSettings.adTimerDuration}s</span>
                          </div>
                        </div>

                        {/* Setting Card: Announcement Bar */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 rounded-lg">
                              <Search className="w-5 h-5 text-red-600" />
                            </div>
                            <span className="font-black text-slate-800 text-sm uppercase italic">Announcement Bar</span>
                          </div>
                          <button 
                            onClick={() => setAppSettings(prev => ({...prev, showAnnouncementBar: !prev.showAnnouncementBar}))}
                            className={`w-12 h-6 rounded-full transition-colors relative border-2 ${appSettings.showAnnouncementBar ? 'bg-indigo-600 border-indigo-600' : 'bg-slate-200 border-slate-200'}`}
                          >
                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${appSettings.showAnnouncementBar ? 'right-0.5' : 'left-0.5'}`}></div>
                          </button>
                        </div>

                        {/* Setting Card: Home Banner Ad */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                              <Star className="w-5 h-5 text-yellow-600" />
                            </div>
                            <span className="font-black text-slate-800 text-sm uppercase italic">Home Banner Ad</span>
                          </div>
                          <button 
                            onClick={() => setAppSettings(prev => ({...prev, showHomeBannerAd: !prev.showHomeBannerAd}))}
                            className={`w-12 h-6 rounded-full transition-colors relative border-2 ${appSettings.showHomeBannerAd ? 'bg-indigo-600 border-indigo-600' : 'bg-slate-200 border-slate-200'}`}
                          >
                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${appSettings.showHomeBannerAd ? 'right-0.5' : 'left-0.5'}`}></div>
                          </button>
                        </div>

                        {/* Setting Card: App Language */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <Database className="w-5 h-5 text-green-600" />
                            </div>
                            <span className="font-black text-slate-800 text-sm uppercase italic">Default Language</span>
                          </div>
                          <select 
                            value={appSettings.appLanguage}
                            onChange={(e) => setAppSettings(prev => ({...prev, appLanguage: e.target.value}))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500"
                          >
                            <option>English</option>
                            <option>Hindi</option>
                            <option>Spanish</option>
                            <option>French</option>
                          </select>
                        </div>

                        {/* Setting Card: AdSense Snippet */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4 md:col-span-2">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 rounded-lg">
                              <Zap className="w-5 h-5 text-orange-600" />
                            </div>
                            <span className="font-black text-slate-800 text-sm uppercase italic">Real Ad Network Configuration (AdSense)</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">AdSense Publisher ID</label>
                                <input 
                                  type="text" 
                                  placeholder="ca-pub-XXXXXXXXXXXX" 
                                  value={appSettings.adSenseClientId}
                                  onChange={(e) => setAppSettings(prev => ({...prev, adSenseClientId: e.target.value}))}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500"
                                />
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Ad Unit ID Slot</label>
                                <input 
                                  type="text" 
                                  placeholder="1234567890" 
                                  value={appSettings.adUnitId}
                                  onChange={(e) => setAppSettings(prev => ({...prev, adUnitId: e.target.value}))}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500"
                                />
                             </div>
                          </div>
                          <div className="p-3 bg-indigo-50 rounded-xl text-[10px] font-medium text-indigo-600 italic">
                             * Enter your real AdSense credentials to replace simulated ads with revenue-generating units.
                          </div>
                        </div>
                      </div>

                      {/* User Data Table Section */}
                      <section className="space-y-4">
                        <h3 className="text-xl font-black text-slate-800 uppercase italic">User Data Management</h3>
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="bg-slate-50 border-b">
                                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">User Email</th>
                                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Views</th>
                                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Joined</th>
                                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {mockUsers.map(user => (
                                <tr key={user.id} className="border-b last:border-0">
                                  <td className="p-4">
                                    <div className="text-sm font-bold text-slate-800">{user.email}</div>
                                  </td>
                                  <td className="p-4 text-sm font-medium text-slate-600">{user.views}</td>
                                  <td className="p-4 text-sm text-slate-400">{user.joined}</td>
                                  <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                      {user.status}
                                    </span>
                                  </td>
                                  <td className="p-4 flex gap-2">
                                    <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors">
                                      <Info className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={() => setMockUsers(prev => prev.filter(u => u.id !== user.id))}
                                      className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                                    >
                                      <Trash className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </section>

                      <div className="flex justify-end gap-3 pb-8">
                         <button className="px-6 py-3 bg-white border-2 border-slate-200 rounded-2xl font-black text-sm uppercase italic text-slate-400 hover:border-slate-300 transition-colors">Discard Changes</button>
                         <button className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase italic flex items-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors">
                            <Save className="w-4 h-4" /> Save Config
                         </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ) : !isStarted ? (
            <motion.div 
              key="setup"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center min-h-full py-2 px-2 space-y-4"
            >
              {/* Announcement Bar matching "Announced bar" request */}
              {appSettings.showAnnouncementBar && (
                <div className="w-full bg-white py-2 border-b shadow-sm overflow-hidden whitespace-nowrap relative flex items-center">
                  <button 
                    onClick={handleSecretClick}
                    className="bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-r-lg z-10 shadow-md active:bg-red-700 transition-colors"
                  >
                    ANNOUNCEMENT
                  </button>
                  <div className="flex animate-[marquee_15s_linear_infinite] gap-12 items-center">
                    <span className="text-sm font-black text-indigo-700 uppercase tracking-widest flex items-center gap-2 shrink-0">
                      <Star className="w-4 h-4 fill-indigo-600 stroke-indigo-600" />
                      Multi Watchtime And Views WatchX - Boost your reach now!
                      <Star className="w-4 h-4 fill-indigo-600 stroke-indigo-600" />
                    </span>
                    <span className="text-sm font-black text-indigo-700 uppercase tracking-widest flex items-center gap-2 shrink-0">
                      <Star className="w-4 h-4 fill-indigo-600 stroke-indigo-600" />
                      Multi Watchtime And Views WatchX - Boost your reach now!
                      <Star className="w-4 h-4 fill-indigo-600 stroke-indigo-600" />
                    </span>
                  </div>
                </div>
              )}

              {/* Red Logo Banner TRANSFORMED into AD INTEGRATION */}
              {appSettings.showHomeBannerAd && (
                <div className="w-full max-w-lg bg-red-600 rounded-lg border-2 border-blue-500 overflow-hidden flex shadow-md aspect-[2.8/1] relative group cursor-pointer active:scale-95 transition-transform">
                  {/* Ad badge details */}
                  <div className="absolute top-1 left-2 z-10 flex gap-1 items-center">
                    <div className="bg-blue-500 text-white text-[8px] font-black px-1.5 rounded-sm flex items-center gap-0.5 shadow-sm">
                        <Play className="w-2 h-2 fill-current stroke-none" /> AD
                    </div>
                    <div className="bg-black/20 backdrop-blur-sm text-white text-[7px] px-1 rounded-sm font-bold uppercase tracking-widest">Sponsored Content</div>
                  </div>

                  <div className="absolute top-1 right-2 z-10">
                    <div className="text-white/40 group-hover:text-white transition-colors">
                        <Info className="w-3 h-3" />
                    </div>
                  </div>

                  {/* Icon section */}
                  <div className="w-2/5 bg-red-600 flex items-center justify-center border-r-2 border-blue-500 p-2 relative">
                    <div className="relative w-full aspect-square bg-white rounded-lg flex items-center justify-center p-2 shadow-inner group-hover:bg-indigo-50 transition-colors">
                      <div className="relative w-full h-full flex items-center justify-center">
                        {/* Play icon as a triangle */}
                        <div className="w-0 h-0 border-t-[20px] border-t-transparent border-l-[35px] border-l-red-600 border-b-[20px] border-b-transparent ml-2 animate-pulse"></div>
                        {/* Overlay clock icon */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full border-4 border-slate-900 bg-white flex items-center justify-center shadow-lg">
                              <Clock className="w-10 h-10 text-red-600 stroke-[3px]" />
                            </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Text section */}
                  <div className="w-3/5 bg-red-600 flex flex-col items-center justify-center p-3 relative">
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <h1 className="text-white text-2xl font-black text-center leading-tight uppercase italic tracking-tighter relative z-10 drop-shadow-lg">
                      Multi<br />Watchtime And Views<br />WatchX
                    </h1>
                    <div className="mt-2 bg-yellow-400 text-black text-[9px] font-black px-3 py-1 rounded-full shadow-md transform group-hover:scale-110 transition-transform relative z-10 uppercase italic">
                      Boost Views Now ✓
                    </div>
                  </div>
                  
                  {/* Shine effect */}
                  <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
                    <div className="w-1/2 h-full bg-white/20 -skew-x-45 -translate-x-full animate-[shine_3s_infinite] absolute top-0"></div>
                  </div>
                </div>
              )}

              {/* Input Area matching image */}
              <div className="w-full max-w-lg relative px-2">
                <div className="relative flex items-center">
                  <input 
                    type="text" 
                    placeholder="Enter video link here..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="input-field pr-14 italic text-slate-400 font-medium"
                  />
                  <button 
                    onClick={handlePaste}
                    className="absolute right-4 text-slate-800 hover:scale-110 transition-transform bg-white"
                  >
                    <Clipboard className="w-9 h-9 stroke-[2.5px]" />
                  </button>
                </div>
              </div>

              {/* Action Buttons Row matching image */}
              <div className="flex w-full max-w-lg justify-between px-2 gap-3">
                <button className="action-btn-black flex-1 py-3 text-base">Rate App</button>
                <button className="action-btn-black flex-1 py-3 text-base">More App</button>
                <button onClick={handleStart} className="action-btn-yellow flex-1 py-3 text-base">Preview</button>
              </div>

              {/* View Selection Grid matching image */}
              <div className="grid grid-cols-2 gap-x-10 gap-y-4 w-full max-w-lg px-6">
                {[6, 10, 15, 21].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setViewCount(opt as ViewOption);
                      if (url) handleStart();
                    }}
                    className="view-btn h-16 text-2xl"
                  >
                    {opt} VIEWS
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="viewing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full w-full flex flex-col bg-[#fce4ec]"
            >
              {/* Controls bar */}
              <div className="w-full bg-[#1a1a1a] py-1 px-4 flex items-center justify-between z-20 shrink-0">
                 <button onClick={handleStop} className="text-white hover:text-red-500 transition-colors">
                    <X className="w-8 h-8" />
                 </button>
                 <div className="text-white text-base font-black flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-400" /> {formatTime(sessionSeconds)}
                 </div>
              </div>

              {/* Ad Banner on Top matching image 2 */}
              <div className="w-full px-2 py-3 flex justify-center sticky top-0 z-10 bg-[#fce4ec]">
                 <div className="w-full max-w-2xl h-28 bg-[#0a0a0a] rounded overflow-hidden relative shadow-xl border border-white/10">
                    <div className="absolute inset-0 flex items-center px-4">
                       <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-red-500 rounded flex items-center justify-center shrink-0">
                          <Search className="w-10 h-10 text-white" />
                       </div>
                       <div className="ml-4 flex-1">
                          <div className="text-yellow-400 font-bold text-xs uppercase tracking-wider">Welcome Offer: Get ₹500</div>
                          <div className="flex items-center gap-2 mt-1">
                             <div className="w-6 h-6 bg-orange-600 rounded flex items-center justify-center">
                                <Play className="w-3 h-3 fill-white stroke-none" />
                             </div>
                             <div className="text-white font-black text-sm uppercase">Delta. Exchange | INDIA</div>
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                             <div className="flex items-center gap-1 text-[8px] text-green-400 font-bold bg-green-900/40 px-1.5 py-0.5 rounded border border-green-500/30">✓ KYC Completed</div>
                             <div className="flex items-center gap-1 text-[8px] text-green-400 font-bold bg-green-900/40 px-1.5 py-0.5 rounded border border-green-500/30">✓ Pay ₹1000 Fees*</div>
                          </div>
                       </div>
                       <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded text-[10px] font-black uppercase tracking-tighter">Start Trading Now</button>
                    </div>
                    <div className="absolute top-1 right-1 flex gap-1">
                       <div className="bg-[#4194c5] text-white text-[7px] px-1 rounded-sm flex items-center gap-0.5 font-bold">
                          <Play className="w-2 h-2 fill-current stroke-none" /> Ad
                       </div>
                       <X className="w-3 h-3 text-white/50 bg-black/40 rounded-full cursor-pointer" />
                    </div>
                    <div className="absolute bottom-1 right-2 text-[6px] text-white/30 italic">*within 7 days of KYC comm</div>
                 </div>
              </div>

              {/* Grid of videos scrolling vertically */}
              <div className="flex-1 overflow-y-auto px-4 pb-10">
                <div 
                  className="grid gap-x-6 gap-y-10 w-full max-w-4xl mx-auto"
                  style={{
                    gridTemplateColumns: `repeat(${viewCount <= 6 ? 2 : viewCount <= 12 ? 3 : 4}, 1fr)`,
                  }}
                >
                  {Array.from({ length: viewCount }).map((_, idx) => (
                    <div key={idx} className="bg-black aspect-[9/16] rounded-lg overflow-hidden relative group border-2 border-white/20 shadow-2xl">
                      <iframe 
                        src={activeUrl} 
                        className="w-full h-full border-none pointer-events-none"
                        title={`View ${idx + 1}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                      
                      {/* Sound Toggle Overlays from Image */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:bg-black/20 transition-colors">
                         <div className="bg-white/80 p-5 rounded-lg shadow-2xl border border-white/40">
                            <VolumeX className="w-16 h-16 text-black stroke-[2.5px]" />
                         </div>
                      </div>

                      {/* Mock YouTube UI elements */}
                      <div className="absolute bottom-4 left-4 z-10 font-bold text-white text-xs drop-shadow-md">
                         YouTube #Shorts
                      </div>
                      
                      {/* View Badge */}
                      <div className="absolute top-2 left-2 z-10">
                        <div className="bg-black/60 backdrop-blur-sm text-[8px] text-white font-bold px-1.5 py-0.5 rounded border border-white/10 uppercase tracking-widest">View {idx + 1}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ad indicator on bottom */}
              <div className="w-full bg-white/10 h-1 backdrop-blur-sm"></div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Navigation bar mockup */}
      <div className="h-1 bg-black/10 w-32 self-center rounded-full mb-1"></div>

      {/* FULL SCREEN INTERSTITIAL AD */}
      <AnimatePresence>
        {showLoadingAd && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#fce4ec] flex flex-col items-center justify-center p-4 md:p-6 text-center"
          >
            <div className="max-w-xl w-full max-h-[95vh] overflow-y-auto space-y-4 md:space-y-8 bg-white p-6 md:p-8 rounded-3xl border-4 border-indigo-600 shadow-2xl relative scrollbar-hide">
               {/* AD Background decoration */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
               <div className="absolute bottom-0 left-0 w-24 h-24 bg-red-600/5 rounded-full -ml-12 -mb-12 pointer-events-none"></div>

               <div className="space-y-2 md:space-y-4 relative z-10">
                  <div className="bg-indigo-600 text-white w-14 h-14 md:w-20 md:h-20 rounded-2xl flex items-center justify-center mx-auto shadow-lg rotate-3">
                     <Play className="w-6 h-6 md:w-10 md:h-10 fill-current" />
                  </div>
                  <h2 className="text-xl md:text-3xl font-black text-slate-800 uppercase italic leading-tight">Loading Your Pro Session</h2>
                  <p className="text-[10px] md:text-sm text-slate-500 font-medium italic">Please wait while we prepare your high-bandwidth multi-view environment...</p>
               </div>

               {/* INTERSTITIAL AD UNIT */}
               <div className="w-full h-32 md:h-48 bg-slate-900 rounded-2xl overflow-hidden relative border-2 border-slate-200">
                  <img 
                    src="https://picsum.photos/seed/adview/600/400" 
                    alt="Premium Ad" 
                    className="w-full h-full object-cover opacity-80"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-3 md:p-4 bg-gradient-to-t from-black to-transparent">
                     <div className="text-yellow-400 font-black italic uppercase text-sm md:text-lg">PRO UPGRADE AVAILABLE</div>
                     <div className="text-white text-[8px] md:text-xs font-bold opacity-80">Remove all ads and get 50+ views simultaneously</div>
                  </div>
                  <div className="absolute top-2 left-2 flex gap-1">
                     <div className="bg-indigo-600 text-white text-[7px] md:text-[8px] px-1.5 py-0.5 rounded font-black uppercase">AD Integration</div>
                  </div>
               </div>

               <div className="space-y-4 pt-2 md:pt-4 relative z-10">
                  {adTimer > 0 ? (
                    <div className="flex flex-col items-center gap-4 md:gap-6">
                       <div className="relative w-16 h-16 md:w-24 md:h-24 flex items-center justify-center">
                          <svg className="w-full h-full -rotate-90">
                             <circle
                                cx="50%"
                                cy="50%"
                                r="40%"
                                className="stroke-slate-100 fill-none"
                                strokeWidth="6"
                             />
                             <motion.circle
                                cx="50%"
                                cy="50%"
                                r="40%"
                                className="stroke-indigo-600 fill-none"
                                strokeWidth="6"
                                strokeLinecap="round"
                                initial={{ pathLength: 1 }}
                                animate={{ 
                                  pathLength: adTimer / (appSettings.adTimerDuration || 5)
                                }}
                                transition={{ duration: 1, ease: "linear" }}
                             />
                          </svg>
                          <div className="absolute flex flex-col items-center">
                             <span className="text-xl md:text-3xl font-black text-indigo-700 leading-none">{adTimer}</span>
                             <span className="text-[6px] md:text-[8px] font-black uppercase text-slate-400">Sec</span>
                          </div>
                       </div>
                       
                       <div className="bg-slate-50 px-4 md:px-6 py-1.5 md:py-2 rounded-full border border-slate-100 shadow-inner">
                          <span className="text-[10px] md:text-xs font-black uppercase italic text-slate-500 tracking-tighter flex items-center gap-2">
                             <Clock className="w-3 h-3 text-indigo-500" />
                             Skip Ad in <span className="text-indigo-600 font-black">{adTimer}s</span>
                          </span>
                       </div>
                    </div>
                  ) : (
                    <motion.button 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={confirmStart}
                      className="w-full py-4 md:py-6 bg-gradient-to-r from-green-500 to-indigo-600 text-white rounded-2xl md:rounded-3xl font-black text-lg md:text-2xl shadow-xl shadow-green-200 border-b-4 md:border-b-8 border-indigo-800 flex items-center justify-center gap-2 md:gap-4 group"
                    >
                      SKIP AD NOW 
                      <ChevronRight className="w-6 h-6 md:w-8 md:h-8 group-hover:translate-x-2 transition-transform" />
                    </motion.button>
                  )}
               </div>

               <div className="text-[8px] md:text-[9px] font-black text-slate-300 uppercase tracking-tighter">Your content is ready to stream at high priority</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
