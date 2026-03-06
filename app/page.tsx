'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, animate } from 'framer-motion';
import { Scroll, Sword, Shield, Trophy, Crown, Sparkles, Map, Medal, Lock, Package, Coffee, Monitor, Book, PenTool, Headphones, Globe, Archive, Award, CheckCircle2, MinusCircle, X, Music, VolumeX, ChevronLeft, Building, Flag } from 'lucide-react';

const API_URL = "https://script.google.com/macros/s/AKfycbyJnWiKtEHN4YkNHl92J7a4d3WooYitfNM5ZK8b3a_UR0iRnaDFjIoJXgma6tFM_93W/exec";

const formatCohort = (rawCohort: any) => {
  const match = (rawCohort || "Unknown").match(/C#(\d+)/);
  return match ? `Cohort ${match[1]}` : rawCohort || "Unknown";
};

const equipmentList = [
  { level: 1, name: "Apprentice's Ledger", icon: <Book className="w-10 h-10" />, desc: "A sturdy notebook.", fullDesc: "Every great journey begins with a single page.", why: "An organized mind requires an organized desk.", superpower: "Perfect Recall" },
  { level: 2, name: "Quill of Drafting", icon: <PenTool className="w-10 h-10" />, desc: "Swift, precise notes.", fullDesc: "Forged from the finest digital ink.", why: "Communication is key in the digital realm.", superpower: "Articulate Persuasion" },
  { level: 3, name: "Elixir of Focus", icon: <Coffee className="w-10 h-10" />, desc: "Keeps stamina high.", fullDesc: "A warm, dark brew that smells faintly of deadlines.", why: "Provides the burst of energy needed to push through.", superpower: "Unyielding Stamina" },
  { level: 4, name: "Arcane Terminal", icon: <Monitor className="w-10 h-10" />, desc: "Cast your code.", fullDesc: "A sleek, glowing monolith connected to the ALX mainframe.", why: "This is your primary weapon and command center.", superpower: "Multitasking Mastery" },
  { level: 5, name: "Helm of Concentration", icon: <Headphones className="w-10 h-10" />, desc: "Blocks distractions.", fullDesc: "Noise-canceling earmuffs enchanted with lo-fi beats.", why: "Isolate yourself from the chaos to enter flow state.", superpower: "Deep Work Zone" },
  { level: 6, name: "Orb of Networking", icon: <Globe className="w-10 h-10" />, desc: "Connects worldwide.", fullDesc: "A crystalline sphere pulsing with peer data.", why: "Your network is your net worth.", superpower: "Global Reach" },
  { level: 7, name: "Archivist's Cabinet", icon: <Archive className="w-10 h-10" />, desc: "Secure storage.", fullDesc: "A bottomless digital drawer with advanced sorting.", why: "A secure vault to store your greatest works.", superpower: "Flawless Organization" },
  { level: 8, name: "Sigil of Assistance", icon: <Award className="w-10 h-10" />, desc: "True VA mark.", fullDesc: "A golden badge worn by dedicated supporters.", why: "The ultimate symbol of professional trust.", superpower: "Trusted Authority" },
  { level: 12, name: "Grandmaster Diadem", icon: <Crown className="w-10 h-10" />, desc: "Ultimate achievement.", fullDesc: "A radiant crown woven from completed milestones.", why: "Proves you have mastered the Foundations.", superpower: "Mastery of Foundations" }
];

export default function AdventurersTavern() {
  const [currentView, setCurrentView] = useState('home');
  const [email, setEmail] = useState('');
  
  const [playerData, setPlayerData] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');
  const [displayedXP, setDisplayedXP] = useState(0);
  const [selectedGear, setSelectedGear] = useState<any>(null);
  const [guildFilter, setGuildFilter] = useState('All');
  
  // Audio state - OFF by default now!
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<any>(null);
  const sfxRef = useRef<any>(null); // New SFX Reference

  useEffect(() => {
    fetch(API_URL).then(res => res.json()).then(data => {
      if (data.success) {
        setLeaderboard(data.leaderboard.map((hero: any) => {
          const rawString = String(hero.cohort || "").toUpperCase();
          let prog = "PF"; if (rawString.includes("AICE")) prog = "AiCE"; else if (rawString.includes("VA")) prog = "VA";
          return { ...hero, program: prog, cohort: formatCohort(hero.cohort), country: String(hero.country || "").trim() };
        }));
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const fetchHero = async (e: any) => {
    e.preventDefault();
    if (!email) return;
    setSearchLoading(true); setError(''); setDisplayedXP(0);
    try {
      const res = await fetch(`${API_URL}?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.success && data.player) {
        setPlayerData(data.player);
        setCurrentView('dashboard');
      } else setError("No hero found in the archives.");
    } catch { setError("The magic connection failed."); }
    setSearchLoading(false);
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); } 
      else { audioRef.current.play(); setIsPlaying(true); }
    }
  };

  const getRPGStats = (player: any) => {
    if (!player) return null;
    const programCode = String(player["Location Program Cohort"] || "").toUpperCase();
    let maxLevel = 12; let programName = "Professional Foundations"; let programKey = "PF";
    if (programCode.includes("AICE")) { maxLevel = 6; programName = "AiCE"; programKey = "AiCE"; }
    else if (programCode.includes("VA")) { maxLevel = 8; programName = "Virtual Assistant"; programKey = "VA"; }

    const playerCohort = formatCohort(player["Original Cohort Name"] || "");
    const currentMilestones = parseInt(player["Total_Milestones_Submitted"]) || 0;
    const dueMilestones = parseInt(player["Total_due_Milestones"]) || 0;
    const currentTests = parseInt(player["Total_Tests_Submitted"]) || 0;
    const dueTests = parseInt(player["Total_due_Tests"]) || 0;
    
    const maxScore = 100 + (dueTests * 10) + (dueMilestones * 25) + 50; 
    const currentScore = parseInt(player["Master Score"]) || 0;
    const pfBonus = parseInt(player["PeerFinder Bonus"]) || 0;
    const xpPercentage = Math.min(100, Math.max(0, (currentScore / maxScore) * 100));

    return { maxLevel, programName, programKey, playerCohort, currentMilestones, dueMilestones, currentTests, dueTests, currentScore, maxScore, xpPercentage, pfBonus };
  };

  const stats = getRPGStats(playerData);

  const programRank = stats ? leaderboard.filter(h => h.program === stats.programKey && h.score > stats.currentScore).length + 1 : 0;
  const cohortRank = stats ? leaderboard.filter(h => h.program === stats.programKey && h.cohort === stats.playerCohort && h.score > stats.currentScore).length + 1 : 0;

  useEffect(() => {
    if (currentView === 'dashboard' && stats) {
      const controls = animate(0, stats.currentScore, {
        duration: 1.5, ease: "easeOut", onUpdate: (val) => setDisplayedXP(Math.round(val)),
      });
      return () => controls.stop();
    }
  }, [currentView, stats?.currentScore]);

  const GuildPage = ({ programKey, title, themeColor, themeBorder }: any) => {
    const programData = leaderboard.filter((h: any) => h.program === programKey);
    const cohorts = [...new Set(programData.map((h: any) => h.cohort))].filter(c => c !== "Unknown").sort();
    const filteredData = programData.filter((h: any) => guildFilter === 'All' || h.cohort === guildFilter).sort((a: any, b: any) => b.score - a.score);
    
    const topThree = filteredData.slice(0, 3);
    const scrollList = filteredData.slice(3, 10);

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-5xl mx-auto pt-8">
        <button onClick={() => setCurrentView('home')} className={`mb-8 flex items-center gap-2 ${themeColor} hover:text-white transition-colors font-bold uppercase tracking-widest`}>
          <ChevronLeft className="w-5 h-5" /> Return to Hub
        </button>

        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <h2 className={`text-5xl font-serif font-bold ${themeColor} drop-shadow-[0_0_15px_currentColor]`}>{title} Rankings</h2>
          
          <div className="mt-6 md:mt-0 flex flex-col items-end">
            <label className="text-[10px] text-[#27DEF2] font-bold uppercase tracking-widest mb-1">View By Cohort</label>
            <select className={`bg-[#002B56] border ${themeBorder} text-white text-lg rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-[#05F283] cursor-pointer shadow-lg w-full md:w-auto`} value={guildFilter} onChange={(e) => setGuildFilter(e.target.value)}>
              <option value="All">All Cohorts</option>
              {cohorts.map(c => <option key={String(c)} value={String(c)}>{String(c)}</option>)}
            </select>
          </div>
        </div>

        {filteredData.length === 0 ? (
          <p className="text-center text-[#27DEF2] text-xl font-serif">The archives are empty for this cohort.</p>
        ) : (
          <>
            <div className="flex justify-center items-end gap-2 md:gap-6 h-80 mb-16 px-4">
              {topThree[1] && (
                <motion.div initial={{ height: 0 }} animate={{ height: '100%' }} className="flex flex-col items-center justify-end w-32 md:w-48">
                  <div className="flex flex-col items-center mb-4 z-10">
                    <Medal className="w-10 h-10 text-slate-300 drop-shadow-[0_0_10px_rgba(203,213,225,0.8)] mb-2" />
                    <img src={`https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${topThree[1].name}&backgroundColor=transparent`} className="w-16 h-16 rounded-full bg-[#002B56] border-2 border-slate-400" alt="2nd" />
                    <p className="text-center font-bold text-white mt-2 truncate w-full">{topThree[1].name}</p>
                    <div className="flex items-center gap-1.5 my-1 bg-[#001f3f]/80 px-2 py-0.5 rounded-full border border-slate-500/30">
                      <img src={topThree[1].flag} alt={topThree[1].country} title={topThree[1].country} className="w-3.5 h-auto rounded-sm shadow-sm" />
                      <span className="text-[9px] text-slate-300 uppercase tracking-wider truncate max-w-[60px]">{topThree[1].country === "Rest of Africa" ? "ROA" : topThree[1].country}</span>
                    </div>
                    <p className="text-[#FBD437] font-mono text-sm">{topThree[1].score} XP</p>
                  </div>
                  <div className="w-full h-40 bg-gradient-to-t from-[#002B56] to-slate-500/40 rounded-t-lg border-t-4 border-slate-400 shadow-[0_0_30px_rgba(148,163,184,0.2)] flex justify-center pt-4">
                    <span className="text-4xl font-serif font-bold text-slate-300/50">2</span>
                  </div>
                </motion.div>
              )}

              {topThree[0] && (
                <motion.div initial={{ height: 0 }} animate={{ height: '100%' }} className="flex flex-col items-center justify-end w-36 md:w-56 z-20">
                  <div className="flex flex-col items-center mb-4">
                    <Crown className="w-14 h-14 text-[#FBD437] drop-shadow-[0_0_20px_rgba(251,212,55,1)] mb-2" />
                    <img src={`https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${topThree[0].name}&backgroundColor=transparent`} className="w-20 h-20 rounded-full bg-[#002B56] border-4 border-[#FBD437] shadow-[0_0_20px_rgba(251,212,55,0.5)]" alt="1st" />
                    <p className="text-center font-bold text-[#FBD437] text-lg mt-2 truncate w-full">{topThree[0].name}</p>
                    <div className="flex items-center gap-1.5 my-1 bg-[#001f3f]/80 px-2.5 py-0.5 rounded-full border border-[#FBD437]/40">
                      <img src={topThree[0].flag} alt={topThree[0].country} title={topThree[0].country} className="w-4 h-auto rounded-sm shadow-sm" />
                      <span className="text-[10px] text-[#FBD437] uppercase tracking-wider truncate max-w-[70px]">{topThree[0].country === "Rest of Africa" ? "ROA" : topThree[0].country}</span>
                    </div>
                    <p className="text-[#05F283] font-mono font-bold">{topThree[0].score} XP</p>
                  </div>
                  <div className="w-full h-56 bg-gradient-to-t from-[#002B56] to-[#FBD437]/40 rounded-t-lg border-t-4 border-[#FBD437] shadow-[0_0_50px_rgba(251,212,55,0.3)] flex justify-center pt-4">
                    <span className="text-6xl font-serif font-bold text-[#FBD437]/40">1</span>
                  </div>
                </motion.div>
              )}

              {topThree[2] && (
                <motion.div initial={{ height: 0 }} animate={{ height: '100%' }} className="flex flex-col items-center justify-end w-32 md:w-48">
                  <div className="flex flex-col items-center mb-4 z-10">
                    <Medal className="w-10 h-10 text-[#FF5347] drop-shadow-[0_0_10px_rgba(255,83,71,0.8)] mb-2" />
                    <img src={`https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${topThree[2].name}&backgroundColor=transparent`} className="w-16 h-16 rounded-full bg-[#002B56] border-2 border-[#FF5347]" alt="3rd" />
                    <p className="text-center font-bold text-white mt-2 truncate w-full">{topThree[2].name}</p>
                    <div className="flex items-center gap-1.5 my-1 bg-[#001f3f]/80 px-2 py-0.5 rounded-full border border-[#FF5347]/40">
                      <img src={topThree[2].flag} alt={topThree[2].country} title={topThree[2].country} className="w-3.5 h-auto rounded-sm shadow-sm" />
                      <span className="text-[9px] text-[#FF5347] uppercase tracking-wider truncate max-w-[60px]">{topThree[2].country === "Rest of Africa" ? "ROA" : topThree[2].country}</span>
                    </div>
                    <p className="text-[#FBD437] font-mono text-sm">{topThree[2].score} XP</p>
                  </div>
                  <div className="w-full h-32 bg-gradient-to-t from-[#002B56] to-[#FF5347]/30 rounded-t-lg border-t-4 border-[#FF5347] shadow-[0_0_30px_rgba(255,83,71,0.2)] flex justify-center pt-4">
                    <span className="text-4xl font-serif font-bold text-[#FF5347]/50">3</span>
                  </div>
                </motion.div>
              )}
            </div>

            {scrollList.length > 0 && (
              <div className="max-w-2xl mx-auto relative">
                <div className="bg-[#002B56] text-white rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-8 pt-10 pb-10 min-h-[300px] relative overflow-hidden font-sans border-t-4 border-[#05F283]">
                  <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #27DEF2 0%, transparent 70%)' }}></div>
                  <h3 className="text-2xl font-bold text-center mb-6 border-b-2 border-[#27DEF2]/30 pb-4 tracking-widest uppercase text-[#27DEF2]">The Honored Elite</h3>
                  <div className="space-y-4 relative z-10">
                    {scrollList.map((hero: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between border-b border-[#028ECA]/30 pb-2 hover:bg-[#028ECA]/20 transition-colors p-3 rounded-lg">
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-xl text-[#05F283] w-6">{idx + 4}.</span>
                          <img src={hero.flag} className="w-6 shadow-sm rounded-sm" alt="flag" title={hero.country} />
                          <span className="font-bold text-lg">{hero.name}</span>
                        </div>
                        <span className="font-mono font-bold text-[#FBD437]">{hero.score} XP</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[#00152b] text-white font-sans selection:bg-[#05F283] selection:text-[#002B56] pb-16 relative overflow-x-hidden">
      
      <img src="/alx_white.png" alt="ALX Background" className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] opacity-[0.03] pointer-events-none z-0 object-contain" />
      <div className="fixed inset-0 opacity-20 pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(circle at center, #028ECA 0%, transparent 60%)' }} />
      
      {/* Audio Tags - No AutoPlay on theme.mp3 */}
      <audio ref={audioRef} src="/theme.mp3" loop />
      <audio ref={sfxRef} src="/unlock.mp3" />

      {/* Music Toggle UI */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {!isPlaying && (
           <motion.span initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="text-xs bg-[#002B56] border border-[#028ECA] text-[#27DEF2] px-3 py-2 rounded-full shadow-lg">
             Turn on sound 🎶
           </motion.span>
        )}
        <button onClick={toggleMusic} className="bg-[#002B56] border border-[#05F283]/50 p-4 rounded-full shadow-[0_0_20px_rgba(5,242,131,0.3)] text-[#05F283] hover:text-white hover:scale-110 transition-all">
          {isPlaying ? <Music className="w-6 h-6 animate-pulse" /> : <VolumeX className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {selectedGear && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedGear(null)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0 }} onClick={(e: any) => e.stopPropagation()} className={`relative max-w-lg w-full rounded-2xl p-8 border ${selectedGear.isUnlocked ? 'bg-[#002B56] border-[#05F283] shadow-[0_0_50px_rgba(5,242,131,0.3)]' : 'bg-[#001f3f] border-[#FF5347]'}`}>
              <button onClick={() => setSelectedGear(null)} className="absolute top-4 right-4 text-[#27DEF2] hover:text-white"><X className="w-6 h-6" /></button>
              <div className="flex flex-col items-center text-center">
                <div className={`mb-6 p-5 rounded-full ${selectedGear.isUnlocked ? 'bg-[#05F283]/20 text-[#05F283] drop-shadow-[0_0_20px_rgba(5,242,131,0.8)]' : 'bg-slate-800 text-[#FF5347]'}`}>{selectedGear.icon}</div>
                <h3 className={`text-3xl font-serif font-bold mb-2 ${selectedGear.isUnlocked ? 'text-[#27DEF2]' : 'text-slate-400'}`}>{selectedGear.name}</h3>
                {selectedGear.isUnlocked ? (
                  <div className="space-y-4 mt-4 text-left">
                    <div className="bg-[#00152b] p-4 rounded-lg border border-[#028ECA]/50">
                      <p className="text-white italic text-sm mb-3">"{selectedGear.fullDesc}"</p>
                      <p className="text-slate-300 text-sm"><span className="text-[#05F283] font-bold">Role:</span> {selectedGear.why}</p>
                    </div>
                    <div className="bg-[#05F283]/10 border border-[#05F283]/50 p-4 rounded-lg flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-[#FBD437] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[#FBD437] font-bold text-sm uppercase tracking-wider mb-1">Equipped Superpower</p>
                        <p className="text-[#27DEF2] text-sm">{selectedGear.superpower}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 flex flex-col items-center">
                    <Lock className="w-12 h-12 text-[#FF5347] mb-4" />
                    <p className="text-slate-300 mb-2">This artifact is sealed.</p>
                    <p className="text-[#002B56] font-bold bg-[#FF5347] px-4 py-2 rounded-full shadow-lg">Reach Level {selectedGear.level} to unlock!</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10 max-w-[90rem] mx-auto p-6 pt-12">
        {currentView === 'home' && (
          <header className="text-center mb-16">
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
              <img src="/alx_white.png" alt="ALX Logo" className="h-10 mx-auto mb-6 opacity-90 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
              <Crown className="w-20 h-20 mx-auto text-[#FBD437] mb-6 drop-shadow-[0_0_25px_rgba(251,212,55,0.8)]" />
              <h1 className="text-6xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#05F283] via-[#27DEF2] to-[#05F283] uppercase tracking-widest drop-shadow-lg">The ALX Cyber-Sanctum</h1>
              <p className="mt-5 text-[#27DEF2] tracking-widest uppercase text-base">Your epic learning quest awaits</p>
            </motion.div>
          </header>
        )}

        <AnimatePresence mode="wait">
          {currentView === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-24">
              <div className="max-w-xl mx-auto relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#05F283] to-[#028ECA] rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
                <div className="relative bg-[#002B56] border border-[#028ECA]/50 p-10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                  <h2 className="text-2xl font-serif text-center mb-6 flex items-center justify-center gap-3 text-white"><Scroll className="w-6 h-6 text-[#05F283]" /> Initialize Connection</h2>
                  <form onSubmit={fetchHero} className="space-y-5">
                    <input type="email" required placeholder="Enter your email address..." className="w-full bg-[#00152b] border border-[#028ECA] rounded-lg p-4 text-lg text-white placeholder-[#27DEF2]/50 focus:outline-none focus:border-[#05F283] focus:ring-1 focus:ring-[#05F283] transition-colors shadow-inner" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <button type="submit" disabled={searchLoading} className="w-full bg-gradient-to-r from-[#05F283] to-[#41C9B9] hover:from-[#41C9B9] hover:to-[#028ECA] text-[#002B56] font-bold uppercase tracking-widest text-lg py-4 rounded-lg transition-all shadow-[0_0_15px_rgba(5,242,131,0.4)] flex justify-center items-center">
                      {searchLoading ? <Sparkles className="w-6 h-6 animate-spin" /> : "Initialize Mainframe"}
                    </button>
                    {error && <p className="text-[#FF5347] text-sm text-center animate-pulse mt-2">{error}</p>}
                  </form>
                </div>
              </div>

              <div>
                <h3 className="text-3xl font-serif text-center mb-12 flex items-center justify-center gap-3 text-white tracking-wider">
                  <Trophy className="w-8 h-8 text-[#FBD437]" /> Explore the Guild Rankings
                </h3>
                {loading ? <div className="text-center text-[#27DEF2] animate-pulse font-serif text-2xl">Syncing with ALX Mainframe...</div> : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
                    <button onClick={() => { setGuildFilter('All'); setCurrentView('aice'); }} className="relative group p-8 rounded-2xl bg-gradient-to-b from-[#002B56] to-[#028ECA]/40 border border-[#27DEF2]/50 transition-all duration-300 hover:-translate-y-4 shadow-[0_10px_30px_rgba(39,222,242,0.2)] hover:shadow-[0_20px_50px_rgba(39,222,242,0.5)] flex flex-col items-center">
                      <div className="w-20 h-20 bg-[#27DEF2]/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[inset_0_0_20px_rgba(39,222,242,0.5)]"><Sword className="w-10 h-10 text-[#27DEF2]" /></div>
                      <h3 className="text-2xl font-serif font-bold text-white uppercase tracking-widest mb-2">AiCE</h3>
                      <p className="text-[#27DEF2] text-sm">Enter the Hall of Engineers</p>
                    </button>
                    <button onClick={() => { setGuildFilter('All'); setCurrentView('va'); }} className="relative group p-8 rounded-2xl bg-gradient-to-b from-[#002B56] to-[#5648B7]/40 border border-[#5648B7]/50 transition-all duration-300 hover:-translate-y-4 shadow-[0_10px_30px_rgba(86,72,183,0.2)] hover:shadow-[0_20px_50px_rgba(86,72,183,0.5)] flex flex-col items-center">
                      <div className="w-20 h-20 bg-[#5648B7]/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[inset_0_0_20px_rgba(86,72,183,0.5)]"><Package className="w-10 h-10 text-[#5648B7]" /></div>
                      <h3 className="text-2xl font-serif font-bold text-white uppercase tracking-widest text-center mb-2">Virtual Assistant</h3>
                      <p className="text-[#5648B7] text-sm">Enter the Hall of Logistics</p>
                    </button>
                    <button onClick={() => { setGuildFilter('All'); setCurrentView('pf'); }} className="relative group p-8 rounded-2xl bg-gradient-to-b from-[#002B56] to-[#41C9B9]/40 border border-[#05F283]/50 transition-all duration-300 hover:-translate-y-4 shadow-[0_10px_30px_rgba(5,242,131,0.2)] hover:shadow-[0_20px_50px_rgba(5,242,131,0.5)] flex flex-col items-center">
                      <div className="w-20 h-20 bg-[#05F283]/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[inset_0_0_20px_rgba(5,242,131,0.5)]"><Shield className="w-10 h-10 text-[#05F283]" /></div>
                      <h3 className="text-2xl font-serif font-bold text-white uppercase tracking-widest text-center mb-2">Professional Foundations</h3>
                      <p className="text-[#41C9B9] text-sm text-center">Enter the Hall of Leaders</p>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {currentView === 'aice' && <GuildPage key="aice" programKey="AiCE" title="AiCE" themeColor="text-[#27DEF2]" themeBorder="border-[#27DEF2]/50" />}
          {currentView === 'va' && <GuildPage key="va" programKey="VA" title="Virtual Assistant" themeColor="text-[#5648B7]" themeBorder="border-[#5648B7]/50" />}
          {currentView === 'pf' && <GuildPage key="pf" programKey="PF" title="Professional Foundations" themeColor="text-[#05F283]" themeBorder="border-[#05F283]/50" />}

          {currentView === 'dashboard' && (
             <motion.div key="dashboard" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-6xl mx-auto space-y-8">
              <button onClick={() => setCurrentView('home')} className="text-[#27DEF2] hover:text-[#05F283] transition-colors flex items-center text-sm uppercase tracking-widest mb-4">
                ← Terminate Connection (Return)
              </button>
              
              <div className="grid md:grid-cols-4 gap-8">
                {/* ID Card with Updated Ranking Grid */}
                <div className="md:col-span-1 bg-[#002B56] border border-[#028ECA]/50 rounded-2xl p-6 relative overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.6)] flex flex-col items-center text-center">
                  <div className="absolute top-0 right-0 w-full h-32 bg-gradient-to-b from-[#028ECA]/20 to-transparent"></div>
                  <div className="w-32 h-32 rounded-full bg-[#00152b] border-4 border-[#05F283] shadow-[0_0_20px_rgba(5,242,131,0.3)] mb-4 relative z-10 overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=${playerData["First name"]}${playerData["Last name"]}&backgroundColor=transparent`} alt="Hero Avatar" className="w-full h-full object-cover" />
                  </div>
                  <h2 className="text-2xl font-serif text-white mb-1 z-10">{playerData["First name"]} {playerData["Last name"]}</h2>
                  <p className="text-xs text-[#27DEF2] z-10 uppercase tracking-widest">{stats?.programName} Operative</p>
                  
                  <div className="w-full grid grid-cols-2 gap-4 border-t border-[#028ECA]/30 pt-6 mt-6">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Global Ranking</p>
                      <p className="text-xl font-serif text-[#FBD437]">#{playerData.Rank}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">{stats?.programKey} Ranking</p>
                      <p className="text-xl font-serif text-[#27DEF2]">#{programRank}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Cohort Ranking</p>
                      <p className="text-xl font-serif text-[#41C9B9]">#{cohortRank}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Status</p>
                      <p className="text-[14px] font-serif text-[#05F283] font-bold uppercase mt-1">{playerData["Level"] || "Lvl 0"}</p>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-3 space-y-6">
                  {/* XP Bar */}
                  <div className="bg-[#002B56] border border-[#028ECA]/50 rounded-2xl p-8 shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
                    <div className="flex justify-between items-end mb-6">
                      <div>
                        <p className="text-sm text-[#27DEF2] uppercase tracking-wider mb-1">Total Experience</p>
                        <p className="text-5xl font-mono text-[#FBD437] drop-shadow-[0_0_10px_rgba(251,212,55,0.3)]">{displayedXP} <span className="text-lg text-[#FBD437]/60">XP</span></p>
                      </div>
                      <div className="text-right"><p className="text-sm text-[#41C9B9] bg-[#00152b] px-3 py-1 rounded-full border border-[#41C9B9]/50">Max Cap: Level {stats?.maxLevel}</p></div>
                    </div>
                    <div className="h-6 bg-[#00152b] rounded-full overflow-hidden border border-[#028ECA]/50 relative shadow-inner">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${stats?.xpPercentage}%` }} transition={{ duration: 1.5, ease: "easeOut" }} className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#028ECA] via-[#27DEF2] to-[#05F283] relative">
                        <div className="absolute right-0 top-0 h-full w-4 bg-white opacity-90 blur-[4px] shadow-[0_0_15px_5px_rgba(5,242,131,0.9)]"></div>
                      </motion.div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Quests */}
                    <div className="bg-[#002B56] border border-[#028ECA]/30 rounded-xl p-6 shadow-lg">
                      <h3 className="font-serif text-xl text-white border-b border-[#028ECA]/30 pb-3 mb-4 flex items-center gap-2"><Sword className="w-5 h-5 text-[#27DEF2]"/> Quest Log</h3>
                      <ul className="space-y-3 text-sm">
                        <li className="flex items-start gap-3">
                          {stats && stats.currentTests >= stats.dueTests ? <CheckCircle2 className="w-5 h-5 text-[#05F283] shrink-0"/> : <MinusCircle className="w-5 h-5 text-[#FF5347] shrink-0"/>}
                          <div><span className={stats && stats.currentTests >= stats.dueTests ? "text-white" : "text-slate-400"}>Quests (Tests/Quiz)</span><span className="block text-xs text-slate-400 mt-0.5">{stats?.currentTests} / {stats?.dueTests} Completed • <span className="text-[#FBD437]">+10 XP each</span></span></div>
                        </li>
                        <li className="flex items-start gap-3 pt-2">
                          {stats && stats.currentMilestones >= stats.dueMilestones ? <CheckCircle2 className="w-5 h-5 text-[#05F283] shrink-0"/> : <MinusCircle className="w-5 h-5 text-[#FF5347] shrink-0"/>}
                          <div><span className={stats && stats.currentMilestones >= stats.dueMilestones ? "text-white" : "text-slate-400"}>Boss Fights (Milestones)</span><span className="block text-xs text-slate-400 mt-0.5">{stats?.currentMilestones} / {stats?.dueMilestones} Defeated • <span className="text-[#FBD437]">+25 XP each</span></span></div>
                        </li>
                      </ul>
                    </div>

                    {/* Alliances */}
                    <div className="bg-[#002B56] border border-[#028ECA]/30 rounded-xl p-6 shadow-lg">
                      <h3 className="font-serif text-xl text-white border-b border-[#028ECA]/30 pb-3 mb-4 flex items-center gap-2"><Map className="w-5 h-5 text-[#05F283]"/> Guild Alliances</h3>
                      <ul className="space-y-3 text-sm">
                        <li className="flex items-start gap-3">
                          {stats && stats.pfBonus >= 20 ? <CheckCircle2 className="w-5 h-5 text-[#05F283] shrink-0"/> : <MinusCircle className="w-5 h-5 text-slate-600 shrink-0"/>}
                          <div><span className={stats && stats.pfBonus >= 20 ? "text-white" : "text-slate-400"}>Registered in PeerFinder</span><span className="block text-xs text-slate-400 mt-0.5">Joined the Guild • <span className="text-[#FBD437]">+20 XP</span></span></div>
                        </li>
                        <li className="flex items-start gap-3 pt-2">
                          {stats && stats.pfBonus >= 30 ? <CheckCircle2 className="w-5 h-5 text-[#05F283] shrink-0"/> : <MinusCircle className="w-5 h-5 text-slate-600 shrink-0"/>}
                          <div><span className={stats && stats.pfBonus >= 30 ? "text-white" : "text-slate-400"}>Formed a Party</span><span className="block text-xs text-slate-400 mt-0.5">Matched with peers • <span className="text-[#FBD437]">+10 XP</span></span></div>
                        </li>
                        <li className="flex items-start gap-3 pt-2">
                          {stats && stats.pfBonus >= 50 ? <CheckCircle2 className="w-5 h-5 text-[#05F283] shrink-0"/> : <MinusCircle className="w-5 h-5 text-slate-600 shrink-0"/>}
                          <div><span className={stats && stats.pfBonus >= 50 ? "text-white" : "text-slate-400"}>Guild Mentor</span><span className="block text-xs text-slate-400 mt-0.5">Volunteered to offer support • <span className="text-[#FBD437]">+20 Extra XP</span></span></div>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* THE NEW GRAND JOURNEY MAP */}
                  <div className="bg-[#002B56] border border-[#028ECA]/40 rounded-2xl p-8 relative overflow-hidden shadow-lg mt-6">
                    <h3 className="text-xl font-serif text-[#27DEF2] mb-10 flex items-center gap-2">
                      <Map className="w-5 h-5 text-[#05F283]" /> Your Career Journey
                    </h3>
                    
                    <div className="relative h-12 flex items-center mx-4 md:mx-8">
                      {/* Background Track */}
                      <div className="absolute left-0 right-0 h-2 bg-[#00152b] rounded-full border border-[#028ECA]/30"></div>
                      
                      {/* Fill Track */}
                      <motion.div initial={{ width: 0 }} animate={{ width: `${stats?.xpPercentage}%` }} transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }} className="absolute left-0 h-2 bg-gradient-to-r from-[#028ECA] via-[#27DEF2] to-[#05F283] rounded-full shadow-[0_0_10px_rgba(5,242,131,0.5)]"></motion.div>
                      
                      {/* Start Point */}
                      <div className="absolute left-0 flex flex-col items-center -ml-4 z-10">
                        <div className="bg-[#002B56] p-2 rounded-full border-2 border-[#028ECA] shadow-md">
                          <Flag className="w-4 h-4 text-[#27DEF2]" />
                        </div>
                        <span className="text-[10px] text-slate-400 mt-2 uppercase tracking-wider font-bold">Start</span>
                      </div>

                      {/* Current Position (The Avatar Tracker) */}
                      <motion.div initial={{ left: 0 }} animate={{ left: `${stats?.xpPercentage}%` }} transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }} className="absolute flex flex-col items-center -ml-4 z-20">
                        <div className="bg-[#05F283] p-1.5 rounded-full shadow-[0_0_20px_rgba(5,242,131,0.9)] border-2 border-[#00152b]">
                           <div className="w-3 h-3 bg-[#002B56] rounded-full"></div>
                        </div>
                        <span className="text-[10px] text-[#05F283] mt-2 uppercase tracking-wider font-bold bg-[#00152b] px-2 py-0.5 rounded-full border border-[#05F283]/30 whitespace-nowrap">You Are Here</span>
                      </motion.div>

                      {/* End Destination (ALX HQ) */}
                      <div className="absolute right-0 flex flex-col items-center -mr-4 z-10">
                        <div className="bg-[#002B56] p-2 rounded-full border-2 border-[#FBD437] shadow-[0_0_25px_rgba(251,212,55,0.7)]">
                          <Building className="w-5 h-5 text-[#FBD437]" />
                        </div>
                        <span className="text-[10px] text-[#FBD437] mt-2 uppercase tracking-wider font-bold whitespace-nowrap">The Destination</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Virtual Sanctum Grid */}
              <div className="mt-12 bg-[#002B56]/80 border border-[#028ECA]/50 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#05F283] to-transparent"></div>
                <h3 className="text-4xl font-serif text-[#05F283] mb-2 flex items-center justify-center gap-3 drop-shadow-md"><Package className="w-8 h-8" /> Your Virtual Sanctum</h3>
                <p className="text-center text-slate-300 mb-10 italic max-w-2xl mx-auto leading-relaxed">"{playerData["First name"]}, the ALX community has something big waiting for you in this journey. This is more than legacy points. And trust me when I say it is <span className="text-[#FBD437] font-bold uppercase tracking-wider">Big</span>. All you have to do is unlock all items to get it!"</p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  {stats && equipmentList.filter(item => item.level <= stats.maxLevel).map((item, idx) => {
                    const isUnlocked = stats.currentMilestones >= item.level;
                    return (
                      <motion.div 
                        key={idx} 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: idx * 0.1 }} 
                        onClick={() => {
                          setSelectedGear({ ...item, isUnlocked });
                          // NEW: Trigger the 1-second unlock sound effect!
                          if (isUnlocked && sfxRef.current) {
                            sfxRef.current.currentTime = 0;
                            sfxRef.current.play().catch((e:any) => console.log("Audio ignored by browser:", e));
                          }
                        }} 
                        className={`relative p-6 rounded-xl flex flex-col items-center text-center cursor-pointer transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-[0_0_25px_rgba(5,242,131,0.5)] ${isUnlocked ? 'bg-gradient-to-b from-[#002B56] to-[#001f3f] border border-[#05F283]/50 shadow-[0_15px_30px_-5px_rgba(5,242,131,0.3),inset_0_2px_10px_rgba(255,255,255,0.1)]' : 'bg-[#00152b] border border-[#028ECA]/30 opacity-70 shadow-[inset_0_10px_20px_rgba(0,0,0,0.5)]'}`}
                      >
                        <div className={`mb-4 p-4 rounded-full transition-all duration-500 ${isUnlocked ? 'bg-[#05F283]/20 text-[#05F283] drop-shadow-[0_0_15px_rgba(5,242,131,0.8)]' : 'bg-[#002B56] text-slate-600'}`}>{item.icon}</div>
                        <h4 className={`font-serif text-base font-bold mb-2 ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>{item.name}</h4>
                        {isUnlocked ? <p className="text-xs text-[#27DEF2]">{item.desc}</p> : <div className="flex flex-col items-center mt-2 bg-[#001f3f] px-3 py-1.5 rounded-md border border-[#FF5347]/50"><Lock className="w-3 h-3 text-[#FF5347] mb-1" /><p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Lvl {item.level} Required</p></div>}
                      </motion.div>
                    );
                  })}
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
