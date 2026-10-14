import React, { useEffect, useMemo, useState } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { FiCalendar, FiX } from "react-icons/fi";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const isISODate = (value) =>
  typeof value === "string" && ISO_DATE_RE.test(value);

const parseISODate = (value) => {
  if (!isISODate(value)) return null;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const toISO = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const formatShortDate = (date) =>
  date.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export const formatRangeLabel = (startISO, endISO) => {
  const start = parseISODate(startISO);
  const end = parseISODate(endISO);
  if (start && end) {
    return `${formatShortDate(start)} - ${formatShortDate(end)}`;
  }
  if (start) {
    return `From ${formatShortDate(start)}`;
  }
  if (end) {
    return `Until ${formatShortDate(end)}`;
  }
  return "Custom Date";
};

const getMonthMatrix = (viewDate) => {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const startWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const cells = [];
  for (let i = startWeekday - 1; i >= 0; i--) {
    cells.push({
      day: daysInPrevMonth - i,
      current: false,
      date: new Date(year, month - 1, daysInPrevMonth - i),
    });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, current: true, date: new Date(year, month, d) });
  }
  let next = 1;
  while (cells.length < 42) {
    cells.push({
      day: next,
      current: false,
      date: new Date(year, month + 1, next),
    });
    next++;
  }
  return cells;
};

const CustomDatePicker = ({ startDate, endDate, onChange, onClear, onApply }) => {
  const parsedStart = parseISODate(startDate);
  const initial = parsedStart || new Date();
  const [viewDate, setViewDate] = useState(
    new Date(initial.getFullYear(), initial.getMonth(), 1),
  );

  useEffect(() => {
    const d = parseISODate(startDate);
    if (d) {
      setViewDate(new Date(d.getFullYear(), d.getMonth(), 1));
    }
  }, [startDate]);

  const cells = useMemo(() => getMonthMatrix(viewDate), [viewDate]);
  const monthLabel = viewDate.toLocaleDateString("en-PH", {
    month: "long",
    year: "numeric",
  });
  const today = new Date();
  const todayISO = toISO(today);
  const fromDate = parseISODate(startDate);
  const toDate = parseISODate(endDate);

  const dayCount = (() => {
    const s = parseISODate(startDate);
    if (!s) return 0;
    const e = parseISODate(endDate) || s;
    if (e < s) return 0;
    return Math.round((e.getTime() - s.getTime()) / 86400000) + 1;
  })();

  const applyPreset = (preset) => {
    const t = new Date();
    const iso = toISO(t);
    if (preset === "today") {
      onChange(iso, "");
      setViewDate(new Date(t.getFullYear(), t.getMonth(), 1));
    } else if (preset === "yesterday") {
      const y = new Date(t);
      y.setDate(t.getDate() - 1);
      const yISO = toISO(y);
      onChange(yISO, "");
      setViewDate(new Date(y.getFullYear(), y.getMonth(), 1));
    } else if (preset === "week") {
      const s = new Date(t);
      s.setDate(t.getDate() - 6);
      onChange(toISO(s), iso);
      setViewDate(new Date(s.getFullYear(), s.getMonth(), 1));
    } else if (preset === "month") {
      const first = new Date(t.getFullYear(), t.getMonth(), 1);
      onChange(toISO(first), iso);
      setViewDate(new Date(t.getFullYear(), t.getMonth(), 1));
    }
  };

  const handleDayClick = (cellDate) => {
    const iso = toISO(cellDate);
    if (!startDate || (startDate && endDate)) {
      onChange(iso, "");
    } else if (iso < startDate) {
      onChange(iso, "");
    } else {
      onChange(startDate, iso);
    }
  };

  const changeMonth = (delta) =>
    setViewDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1),
    );

  return (
    <div className="p-5 sm:p-6">
      <div className="flex flex-col md:flex-row md:gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <span className="font-bold text-[15px] tracking-tight text-gray-800">
              {monthLabel}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                className="w-9 h-9 flex items-center justify-center rounded-[10px] border border-gray-100 bg-[#F6F6F6] text-gray-500 hover:bg-[#f0fdf4] hover:text-[#14532d] transition"
                aria-label="Previous month"
              >
                <IoIosArrowBack size={15} />
              </button>
              <button
                type="button"
                onClick={() => changeMonth(1)}
                className="w-9 h-9 flex items-center justify-center rounded-[10px] border border-gray-100 bg-[#F6F6F6] text-gray-500 hover:bg-[#f0fdf4] hover:text-[#14532d] transition"
                aria-label="Next month"
              >
                <IoIosArrowForward size={15} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 mb-1.5">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="text-center text-[11px] font-bold uppercase tracking-wider text-gray-400 py-1.5"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-1">
            {cells.map(({ day, current, date }, idx) => {
              const iso = toISO(date);
              const isStart = iso === startDate;
              const isEnd = iso === endDate;
              const inRange =
                startDate && endDate && iso > startDate && iso < endDate;
              const isToday = iso === todayISO;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleDayClick(date)}
                  className={`h-10 w-10 mx-auto flex items-center justify-center text-[13px] rounded-[10px] transition ${
                    !current ? "text-gray-300" : "text-gray-700"
                  } ${inRange ? "bg-[#f0fdf4] text-[#14532d] font-medium" : ""} ${
                    isStart || isEnd
                      ? "bg-[#14532d] text-white font-bold shadow-md shadow-[#14532d]/20 hover:bg-[#14532d]"
                      : "hover:bg-[#F6F6F6]"
                  } ${
                    isToday && !isStart && !isEnd
                      ? "font-bold text-[#14532d] ring-1 ring-[#14532d]"
                      : ""
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        <div className="md:w-64 shrink-0 md:border-l md:border-gray-100 md:pl-6 mt-5 md:mt-0 pt-5 md:pt-0 border-t md:border-t-0 border-gray-100 flex flex-col gap-4">
          <div className="bg-[#f0fdf4] border border-[#DCFCE7] rounded-[10px] px-4 py-3">
            <p className="text-[11px] font-semibold text-[#14532d] uppercase tracking-[1.5px]">
              Selected range
            </p>
            <p className="text-sm font-bold text-gray-800 mt-1 truncate">
              {startDate
                ? formatRangeLabel(startDate, endDate)
                : "No dates selected"}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {dayCount > 0
                ? `${dayCount} day${dayCount > 1 ? "s" : ""} selected`
                : "Pick a start date on the calendar"}
            </p>
          </div>

          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-[1.5px] mb-2">
              Quick select
            </p>
            <div className="grid grid-cols-4 md:grid-cols-2 gap-2">
              {[
                { key: "today", label: "Today" },
                { key: "yesterday", label: "Yesterday" },
                { key: "week", label: "Last 7 days" },
                { key: "month", label: "This month" },
              ].map((preset) => (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => applyPreset(preset.key)}
                  className="min-h-10 px-2 py-2 rounded-[10px] bg-[#F6F6F6] hover:bg-[#f0fdf4] hover:text-[#14532d] text-xs font-semibold text-gray-600 transition truncate"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="min-w-0">
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-[1.5px] mb-1.5">
                From
              </label>
              <div className="flex items-center justify-between gap-2 border border-gray-100 bg-[#F6F6F6] px-3 py-3 rounded-[10px]">
                <span className="text-xs font-medium text-gray-700 truncate">
                  {fromDate ? formatShortDate(fromDate) : "mm/dd/yyyy"}
                </span>
                <FiCalendar className="text-gray-400 shrink-0" size={14} />
              </div>
            </div>
            <div className="min-w-0">
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-[1.5px] mb-1.5">
                To
              </label>
              <div className="flex items-center justify-between gap-2 border border-gray-100 bg-[#F6F6F6] px-3 py-3 rounded-[10px]">
                <span className="text-xs font-medium text-gray-700 truncate">
                  {toDate ? formatShortDate(toDate) : "mm/dd/yyyy"}
                </span>
                <FiCalendar className="text-gray-400 shrink-0" size={14} />
              </div>
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-2 pt-1">
            <button
              type="button"
              onClick={onApply}
              className="w-full min-h-12 bg-[#14532d] hover:opacity-90 active:scale-[0.99] text-white text-sm font-bold py-3 rounded-[5px] transition shadow-sm"
            >
              Apply Date Range
            </button>
            <button
              type="button"
              onClick={onClear}
              className="w-full min-h-9 text-xs font-semibold text-gray-400 hover:text-[#DC2626] transition"
            >
              Clear selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CustomDateModal = ({
  startDate,
  endDate,
  onChange,
  onClear,
  onApply,
  onClose,
  title = "Select Custom Date Range",
  subtitle,
}) => {
  const fallbackSubtitle =
    subtitle ||
    (startDate ? formatRangeLabel(startDate, endDate) : "Pick start and end dates");
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-sm md:max-w-2xl rounded-[10px] shadow-2xl overflow-hidden animate-[fadeIn_0.15s_ease-out]"
      >
        <div className="flex items-center gap-3 px-5 sm:px-6 py-4 bg-[#14532d]">
          <div className="w-10 h-10 shrink-0 rounded-full bg-white/15 text-white flex items-center justify-center">
            <FiCalendar size={17} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold tracking-[0.2em] text-[#bbf7d0] uppercase">
              Date Range
            </p>
            <h3 className="font-bold text-white text-[15px] tracking-tight truncate">
              {title}
            </h3>
            <p className="text-xs text-[#dcfce7] truncate mt-0.5">
              {fallbackSubtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 text-white/80 hover:text-white hover:bg-white/10 rounded-[10px] p-2 transition"
            aria-label="Close"
          >
            <FiX size={18} />
          </button>
        </div>

        <CustomDatePicker
          startDate={startDate}
          endDate={endDate}
          onChange={onChange}
          onClear={onClear}
          onApply={onApply}
        />
      </div>
    </div>
  );
};

export default CustomDatePicker;
