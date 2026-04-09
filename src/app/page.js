"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  isBefore,
  startOfDay,
  isWithinInterval,
  isWeekend
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Target,
  Moon,
  Sun,
  Trees as Tree,
  Plus,
  Trash2,
  History,
  MessageSquareText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// --- Utils ---
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

function generateMonthDates(month) {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
}

const HOLIDAYS = [
  { date: "2026-01-01", name: "New Year's Day" },
  { date: "2026-02-14", name: "Valentine's Day" },
  { date: "2026-03-17", name: "St. Patrick's Day" },
  { date: "2026-12-25", name: "Christmas Day" }
];

function getHoliday(date) {
  return HOLIDAYS.find(h => isSameDay(new Date(h.date), date));
}

// --- Sub-Components ---

function CalendarHeader({
  currentMonth,
  onNext,
  onPrev,
  onToday,
  isDark,
  minimal
}) {
  return (
    <div className="flex items-center justify-between w-full font-sans transition-all">
      {!minimal && (
        <div className="flex flex-col">
          <h2 className={cn(
            "text-4xl font-black tracking-tighter leading-none mb-1",
            isDark ? "text-white" : "text-slate-900"
          )}>
            {format(currentMonth, "MMMM")}
          </h2>
          <p className={cn(
            "text-xs font-bold uppercase tracking-[0.2em] leading-none opacity-60",
            isDark ? "text-blue-400" : "text-blue-600"
          )}>
            {format(currentMonth, "yyyy")}
          </p>
        </div>
      )}

      <div className={cn("flex items-center gap-3", minimal && "w-full justify-between")}>
        <div className="flex items-center gap-2">
          <button
            onClick={onPrev}
            className={cn(
              "p-2.5 rounded-xl border transition-all duration-300 active:scale-95 shadow-sm hover:shadow-lg",
              isDark
                ? "bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
                : "bg-white/80 border-slate-200 text-slate-400 hover:bg-white hover:text-blue-600"
            )}
            aria-label="Previous Month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={onNext}
            className={cn(
              "p-2.5 rounded-xl border transition-all duration-300 active:scale-95 shadow-sm hover:shadow-lg",
              isDark
                ? "bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
                : "bg-white/80 border-slate-200 text-slate-400 hover:bg-white hover:text-blue-600"
            )}
            aria-label="Next Month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={onToday}
          className={cn(
            "px-3 sm:px-4 py-2.5 rounded-xl text-[10px] uppercase font-black tracking-[0.2em] transition-all duration-500 active:scale-95 shadow-sm",
            isDark
              ? "bg-emerald-600/10 border border-emerald-600/30 text-emerald-400 hover:bg-emerald-600/20"
              : "bg-emerald-50 border border-emerald-100 text-emerald-600 hover:bg-emerald-100"
          )}
          title="Reset to Today"
        >
          {minimal ? <Target className="w-5 h-5" /> : "Today"}
        </button>
      </div>
    </div>
  );
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function CalendarGrid({
  currentMonth,
  selectedRange,
  onDayClick,
  isDark
}) {
  const days = generateMonthDates(currentMonth);

  const isStart = (date) => selectedRange.start && isSameDay(date, selectedRange.start);
  const isEnd = (date) => selectedRange.end && isSameDay(date, selectedRange.end);

  const isInRange = (date) => {
    if (selectedRange.start && selectedRange.end) {
      const start = selectedRange.start < selectedRange.end ? selectedRange.start : selectedRange.end;
      const end = selectedRange.start < selectedRange.end ? selectedRange.end : selectedRange.start;
      return isWithinInterval(date, { start, end }) && !isSameDay(date, start) && !isSameDay(date, end);
    }
    return false;
  };

  return (
    <div className="grid grid-cols-7 gap-y-2 sm:gap-y-4 gap-x-1 sm:gap-x-3 select-none font-sans px-1">
      {DAY_NAMES.map((day, i) => (
        <div
          key={day}
          className={cn(
            "text-center font-black text-[8px] sm:text-[10px] tracking-[0.2em] pb-4 transition-colors uppercase opacity-30",
            isDark ? "text-emerald-400" : "text-emerald-950",
            (i >= 5) && "text-emerald-600 font-black opacity-100"
          )}
        >
          {day}
        </div>
      ))}

      {days.map((date, idx) => {
        const outsideMonth = !isSameMonth(date, currentMonth);
        const start = isStart(date);
        const end = isEnd(date);
        const selected = start || end;
        const inRange = isInRange(date);
        const today = isToday(date);
        const weekend = isWeekend(date);
        const holiday = getHoliday(date);

        return (
          <motion.div
            key={date.toISOString()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: idx * 0.003 }}
            onClick={() => onDayClick(date)}
            className={cn(
              "relative h-10 sm:h-14 aspect-square flex items-center justify-center cursor-pointer group rounded-[1.2rem]",
              outsideMonth ? "opacity-20 pointer-events-none" : "opacity-100"
            )}
          >
            {inRange && (
              <div className={cn(
                "absolute inset-1.5 z-0 rounded-[1.2rem] transition-colors",
                isDark ? "bg-emerald-500/10" : "bg-emerald-50"
              )} />
            )}

            {today && !selected && !outsideMonth && (
              <div className={cn(
                "absolute inset-1.5 z-0 rounded-[1.2rem] border-2 transition-all",
                isDark
                  ? "border-emerald-500/30 bg-emerald-500/5 shadow-emerald-500/5"
                  : "border-emerald-500/20 bg-emerald-50/10 shadow-emerald-900/5"
              )} />
            )}

            <AnimatePresence mode="popLayout">
              {start && (
                <motion.div
                  layoutId="start-highlight"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-1.5 z-0 bg-emerald-600 rounded-[1.2rem] shadow-xl shadow-emerald-500/20 ring-4 ring-emerald-600/5"
                />
              )}
            </AnimatePresence>

            <AnimatePresence mode="popLayout">
              {end && !start && (
                <motion.div
                  layoutId="end-highlight"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-1.5 z-0 bg-emerald-600 rounded-[1.2rem] shadow-xl shadow-emerald-500/20 ring-4 ring-emerald-600/5"
                />
              )}
            </AnimatePresence>

            <span className={cn(
              "relative z-10 text-[14px] sm:text-[18px] transition-colors duration-300 font-bold",
              selected ? "text-white font-black" :
                outsideMonth
                  ? (isDark ? "text-slate-800" : "text-slate-100") :
                  (weekend) ? (isDark ? "text-emerald-400" : "text-emerald-600 font-black") :
                    (isDark ? "text-slate-100" : "text-slate-900 font-black"),
              today && !selected && (isDark ? "text-emerald-400" : "text-emerald-700")
            )}>
              {format(date, "d")}
            </span>

            {holiday && !selected && !outsideMonth && (
              <div className="absolute top-2 right-2 w-1 h-1 rounded-full bg-emerald-500/30" />
            )}

            {!selected && !outsideMonth && !inRange && (
              <div className={cn(
                "absolute inset-1 rounded-[1.2rem] transition-all scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100",
                isDark ? "bg-slate-800/80" : "bg-emerald-50/50"
              )} />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

function NotesPanel({
  selectedRange,
  notes,
  onAddNote,
  onDeleteNote,
  onUpdateNote,
  isDark
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState("");

  const currentNotes = useMemo(() => {
    if (!selectedRange.start) return [];
    const startKey = format(selectedRange.start, "yyyy-MM-dd");
    const endKey = selectedRange.end ? format(selectedRange.end, "yyyy-MM-dd") : null;

    return notes.filter((note) => {
      if (endKey) {
        const [low, high] = [startKey, endKey].sort();
        return note.date >= low && note.date <= high;
      }
      return note.date === startKey;
    });
  }, [notes, selectedRange]);

  const handleAdd = () => {
    if (newNoteContent.trim()) {
      const targetDate = selectedRange.start || new Date();
      onAddNote(newNoteContent, targetDate);
      setNewNoteContent("");
      setIsAdding(false);
    }
  };

  return (
    <div className={cn(
      "h-full flex flex-col transition-colors duration-500",
      isDark ? "text-slate-100" : "text-slate-900"
    )}>
      <div className="p-8 sm:p-10 border-b border-emerald-500/10 flex items-center justify-between">
        <div className="flex flex-col">
          <h3 className="text-2xl font-black tracking-tighter flex items-center gap-2 uppercase">
            <History size={20} className="text-emerald-500" />
            Records
          </h3>
          {selectedRange.start && (
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600/60 mt-1">
              {format(selectedRange.start, "MMM d")}
              {selectedRange.end && ` - ${format(selectedRange.end, "MMM d")}`}
            </p>
          )}
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="p-3 rounded-2xl transition-all shadow-xl active:scale-90 bg-emerald-600 text-white"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 sm:p-10 space-y-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedRange.start ? format(selectedRange.start, "yyyy-MM-dd") : "none"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {isAdding && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-800 px-10 py-8 rounded-[2rem] border-2 border-emerald-500/30 shadow-[0_15px_40px_-15px_rgba(16,185,129,0.15)] mb-8 ring-4 ring-emerald-500/5"
              >
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquareText size={16} className="text-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600/60">New Discovery</span>
                </div>

                <textarea
                  autoFocus
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="What did you see today?"
                  rows={4}
                  className="w-full bg-transparent border-none outline-none focus:ring-0 focus:outline-none p-0 text-lg font-semibold text-slate-800 dark:text-slate-200 placeholder:text-slate-400/50 resize-none leading-relaxed"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) handleAdd();
                  }}
                />

                <div className="flex justify-between items-center mt-8 pt-6 border-t border-emerald-500/10">
                  <div className="hidden sm:block"></div>
                  <div className="flex gap-4 w-full sm:w-auto">
                    <button
                      onClick={() => setIsAdding(false)}
                      className="flex-1 sm:flex-none px-6 py-3 text-[11px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAdd}
                      className="flex-1 sm:flex-none px-8 py-3 text-[11px] font-black uppercase tracking-wider bg-emerald-600 text-white rounded-xl shadow-[0_10px_25px_-5px_rgba(16,185,129,0.4)] hover:bg-emerald-700 hover:-translate-y-0.5 transition-all active:scale-95"
                    >
                      Save Notes
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {currentNotes.map((note) => (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative bg-white dark:bg-slate-900 p-5 rounded-[1.5rem] border border-emerald-500/10 shadow-sm hover:shadow-[0_10px_30px_-10px_rgba(16,185,129,0.1)] transition-all hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-30">Log Entry</span>
                  </div>
                  <button
                    onClick={() => onDeleteNote(note.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-red-500 transition-all hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <textarea
                  value={note.content}
                  onChange={(e) => onUpdateNote(note.id, e.target.value)}
                  rows={3}
                  className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 resize-none leading-relaxed"
                />

                <div className="mt-3 pt-3 border-t border-emerald-500/5 flex justify-between items-center opacity-30 text-[9px] font-black uppercase tracking-widest">
                  <span>Logged at {format(new Date(note.createdAt), "HH:mm")}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-emerald-500/50" />)}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// --- Main Page Component ---

export default function Home() {
  const [isDark, setIsDark] = useState(false);
  const [direction, setDirection] = useState(0);
  const [mounted, setMounted] = useState(false);

  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [selectedRange, setSelectedRange] = useState({ start: null, end: null });
  const [notes, setNotes] = useState([]);

  // Hydration fix
  useEffect(() => {
    setMounted(true);
    const savedNotes = localStorage.getItem("calendar_notes");
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (e) {
        console.error("Failed to parse notes", e);
      }
    }
  }, []);

  // Sync with localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("calendar_notes", JSON.stringify(notes));
    }
  }, [notes, mounted]);

  const handleDayClick = useCallback((date) => {
    const today = startOfDay(date);
    if (selectedRange.start && selectedRange.end) {
      setSelectedRange({ start: today, end: null });
    } else if (selectedRange.start && !selectedRange.end) {
      if (isBefore(today, selectedRange.start)) {
        setSelectedRange({ start: today, end: selectedRange.start });
      } else if (isSameDay(today, selectedRange.start)) {
        setSelectedRange({ start: null, end: null });
      } else {
        setSelectedRange({ ...selectedRange, end: today });
      }
    } else {
      setSelectedRange({ start: today, end: null });
    }
  }, [selectedRange]);

  const nextMonth = () => {
    setDirection(1);
    setCurrentMonth(prev => addMonths(prev, 1));
    setSelectedRange({ start: null, end: null });
  };

  const prevMonth = () => {
    setDirection(-1);
    setCurrentMonth(prev => subMonths(prev, 1));
    setSelectedRange({ start: null, end: null });
  };

  const goToToday = () => {
    const today = startOfDay(new Date());
    setCurrentMonth(startOfMonth(today));
    setSelectedRange({ start: today, end: null });
  };

  const addNote = (content, date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    const newNote = {
      id: Math.random().toString(36).substr(2, 9),
      date: dateKey,
      content,
      createdAt: Date.now()
    };
    setNotes(prev => [newNote, ...prev]);
  };

  const removeNote = (id) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const updateNote = (id, content) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, content } : n));
  };

  if (!mounted) return null;

  const monthName = format(currentMonth, "MMMM");
  const year = format(currentMonth, "yyyy");

  return (
    <main className={cn(
      "min-h-screen transition-all duration-1000 flex items-start sm:items-center justify-center pt-20 pb-10 sm:p-16 px-4 font-sans overflow-y-auto",
      isDark ? "bg-[#020617]" : "bg-[#f1f5f9]"
    )}>
      {/* Immersive Nature Backdrop */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/nature.png"
          alt="Nature Backdrop"
          fill
          className="object-cover opacity-20 blur-[80px]"
          priority
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-[900px] flex flex-col items-center mt-8 sm:mt-0"
      >
        {/* Premium Chrome Metal Binder */}
        <div className="absolute -top-4 sm:-top-5 z-30 flex justify-center w-full pointer-events-none">
          <div className="flex gap-4 sm:gap-8 bg-white/20 backdrop-blur-xl px-10 py-1.5 rounded-full border border-white/30 shadow-2xl pointer-events-auto">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="relative group">
                <div className={cn(
                  "w-1 sm:w-1.5 h-6 sm:h-8 rounded-full border-x shadow-md transition-all duration-700",
                  isDark
                    ? "bg-gradient-to-b from-slate-400 to-slate-600 border-slate-500 shadow-black/20"
                    : "bg-gradient-to-b from-slate-200 to-slate-400 border-slate-300 shadow-slate-900/10"
                )} />
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-slate-400/30 blur-[1px]" />
              </div>
            ))}
          </div>
        </div>

        {/* The Wall Calendar Body */}
        <div className={cn(
          "w-full bg-white shadow-[0_60px_100px_-20px_rgba(0,0,0,0.35)] rounded-[2.5rem] overflow-hidden transition-all duration-700 border border-transparent",
          isDark ? "bg-[#0f172a] border-emerald-900/20" : "bg-white"
        )}>

          {/* Top Hero Section */}
          <div className="relative w-full h-[220px] sm:h-[300px] lg:h-[380px] overflow-hidden">
            <Image
              src="/nature.png"
              alt="Nature Hills"
              fill
              className="object-cover transition-transform duration-[2000ms] hover:scale-105"
              priority
            />

            <div className="absolute inset-0 z-10 pointer-events-none">
              <svg viewBox="0 0 1000 200" preserveAspectRatio="none" className="absolute bottom-0 w-full h-[100px] sm:h-[140px] lg:h-[160px] fill-emerald-600 drop-shadow-2xl opacity-90">
                <path d="M0,200 L1000,200 L1000,60 C800,100 700,20 500,100 C300,180 150,50 0,120 Z" />
              </svg>
              <svg viewBox="0 0 1000 200" preserveAspectRatio="none" className={cn(
                "absolute bottom-[-2px] w-full h-[80px] sm:h-[110px] lg:h-[130px] transition-colors duration-700",
                isDark ? "fill-[#0f172a]" : "fill-white"
              )}>
                <path d="M0,200 L1000,200 L1000,150 C800,180 700,80 500,160 C300,240 150,130 0,180 Z" />
              </svg>
            </div>

            <div className="absolute bottom-6 sm:bottom-12 lg:bottom-16 right-6 sm:right-12 lg:right-20 text-white text-right leading-none z-20 drop-shadow-2xl select-none">
              <motion.p
                key={year}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-lg sm:text-xl lg:text-3xl font-bold opacity-80 mb-1"
              >
                {year}
              </motion.p>
              <motion.h2
                key={monthName}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl sm:text-4xl lg:text-6xl font-black uppercase tracking-tighter"
              >
                {monthName}
              </motion.h2>
            </div>

            <div className="hidden sm:block absolute top-8 left-8 p-3 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 text-white z-20">
              <Tree size={24} />
            </div>
          </div>

          {/* Controls Bar */}
          <div className="px-8 py-5 sm:px-14 flex items-center justify-between border-b border-emerald-500/5 relative z-30">
            <div className="flex-1">
              <CalendarHeader
                currentMonth={currentMonth}
                onNext={nextMonth}
                onPrev={prevMonth}
                onToday={goToToday}
                isDark={isDark}
                minimal
              />
            </div>

            <div className="flex items-center gap-6 ml-8">
              <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-800" />
              <button
                onClick={() => setIsDark(!isDark)}
                className={cn(
                  "p-3 rounded-2xl transition-all shadow-lg active:scale-90 hover:scale-110",
                  isDark ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                )}
                title="Toggle Theme"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>

          {/* Core Content */}
          <div className="flex flex-col lg:flex-row min-h-[500px]">
            <div className="w-full lg:w-[400px] border-b lg:border-r lg:border-b-0 border-emerald-500/10 order-2 lg:order-1">
              <NotesPanel
                selectedRange={selectedRange}
                notes={notes}
                onAddNote={addNote}
                onDeleteNote={removeNote}
                onUpdateNote={updateNote}
                isDark={isDark}
              />
            </div>

            <div className="flex-1 p-6 sm:p-8 lg:p-8 order-1 lg:order-2">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={currentMonth.toISOString()}
                  initial={{ opacity: 0, y: direction * 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: direction * -50 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <CalendarGrid
                    currentMonth={currentMonth}
                    selectedRange={selectedRange}
                    onDayClick={handleDayClick}
                    isDark={isDark}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className={cn(
          "mt-8 text-center text-[10px] uppercase font-black tracking-[0.4em] opacity-30",
          isDark ? "text-emerald-500" : "text-emerald-900"
        )}>
          Legacy Collection • nature edition
        </div>
      </motion.div>
    </main>
  );
}
