import { useState, useMemo, useCallback } from 'react';
import { format, toZonedTime } from 'date-fns-tz';
import { startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, addDays, subDays } from 'date-fns';
import { schedule } from '../data/schedule';
import type { Episode } from '../data/schedule';
import './Calendar.css';

const TIMEZONE = 'America/New_York';
const CALENDAR_GRID_CELLS = 42; // 6 rows × 7 days
const SUBSCRIBE_URL = 'https://raw.githubusercontent.com/dwumfour-io/inside-the-nba/main/public/inside-the-nba.ics';

interface CalendarDay {
  date: Date;
  episodes: Episode[];
  isCurrentMonth: boolean;
}

export const Calendar: React.FC = () => {
  // Default to current month (Feb 2026)
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const getEpisodesForDate = useCallback((date: Date): Episode[] => {
    const dateString = format(date, 'yyyy-MM-dd');
    return schedule.filter((ep) => ep.date === dateString);
  }, []);

  // Lazy load: Only generate days for current visible month
  const calendarDays = useMemo((): CalendarDay[] => {
    const days: CalendarDay[] = [];
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDay = getDay(monthStart);
    
    // Add days from previous month to fill the first week
    for (let i = startDay - 1; i >= 0; i--) {
      const date = subDays(monthStart, i + 1);
      days.push({
        date,
        episodes: getEpisodesForDate(date),
        isCurrentMonth: false,
      });
    }
    
    // Add all days of current month
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    daysInMonth.forEach((date) => {
      days.push({
        date,
        episodes: getEpisodesForDate(date),
        isCurrentMonth: true,
      });
    });
    
    // Add days from next month to complete the grid
    const remainingDays = CALENDAR_GRID_CELLS - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = addDays(monthEnd, i);
      days.push({
        date,
        episodes: getEpisodesForDate(date),
        isCurrentMonth: false,
      });
    }
    
    return days;
  }, [currentDate, getEpisodesForDate]);

  const handlePrevMonth = useCallback(() => {
    setCurrentDate((prev) => subMonths(prev, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentDate((prev) => addMonths(prev, 1));
  }, []);

  const handleToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  // Generate Google Calendar URL for a single episode
  const addToGoogleCalendar = useCallback((episode: Episode) => {
    const startDate = episode.date.replace(/-/g, '');
    // 6 PM ET = 18:00, 7 PM ET = 19:00
    const startTime = '180000';
    const endTime = '190000';
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: episode.title,
      dates: `${startDate}T${startTime}/${startDate}T${endTime}`,
      ctz: TIMEZONE,
      details: episode.description || `Inside the NBA on ${episode.network}`,
      location: episode.network,
    });
    
    window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank');
  }, []);

  // Generate Apple Calendar ICS for a single episode
  const addToAppleCalendar = useCallback((episode: Episode) => {
    const dateStr = episode.date.replace(/-/g, '');
    let ical = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Inside the NBA//Calendar//EN\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\nX-WR-TIMEZONE:America/New_York\r\n';
    ical += 'BEGIN:VEVENT\r\n';
    ical += `UID:${episode.id}@insidethemba.com\r\n`;
    ical += `DTSTART;TZID=America/New_York:${dateStr}T180000\r\n`;
    ical += `DTEND;TZID=America/New_York:${dateStr}T190000\r\n`;
    ical += `SUMMARY:${episode.title}\r\n`;
    ical += `DESCRIPTION:${episode.description || 'Inside the NBA on ' + episode.network}\r\n`;
    ical += `LOCATION:${episode.network}\r\n`;
    ical += 'END:VEVENT\r\n';
    ical += 'END:VCALENDAR';
    
    const blob = new Blob([ical], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inside-the-nba-${episode.date}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const generateFullCalendarICS = useCallback(() => {
    let ical = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Inside the NBA//Calendar//EN\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\nX-WR-TIMEZONE:America/New_York\r\n';
    
    schedule.forEach((episode) => {
      const dateStr = episode.date.replace(/-/g, '');
      ical += 'BEGIN:VEVENT\r\n';
      ical += `UID:${episode.id}@insidethemba.com\r\n`;
      ical += `DTSTART;TZID=America/New_York:${dateStr}T180000\r\n`;
      ical += `DTEND;TZID=America/New_York:${dateStr}T190000\r\n`;
      ical += `SUMMARY:${episode.title}\r\n`;
      ical += `DESCRIPTION:${episode.description || 'Inside the NBA on ' + episode.network}\r\n`;
      ical += `LOCATION:${episode.network}\r\n`;
      ical += 'END:VEVENT\r\n';
    });
    
    ical += 'END:VCALENDAR';
    return ical;
  }, []);

  const downloadFullCalendar = useCallback(() => {
    const ical = generateFullCalendarICS();
    const blob = new Blob([ical], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'inside-the-nba-2025-26.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [generateFullCalendarICS]);

  // Format current time in ET for display
  const currentTimeET = useMemo(() => {
    const now = new Date();
    const zonedTime = toZonedTime(now, TIMEZONE);
    return format(zonedTime, 'h:mm a zzz', { timeZone: TIMEZONE });
  }, []);

  const [showToast, setShowToast] = useState(false);
  
  const copySubscribeUrl = useCallback(() => {
    navigator.clipboard.writeText(SUBSCRIBE_URL);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }, []);

  const monthYear = format(currentDate, 'MMMM yyyy');
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="calendar-container">
      {showToast && (
        <div className="toast">✅ Calendar URL copied! Paste in your calendar app to subscribe.</div>
      )}
      <div className="calendar-header">
        <div className="header-top">
          <span className="nba-logo">🏀</span>
          <h1>Inside the NBA Schedule</h1>
          <span className="nba-logo">🏀</span>
        </div>
        <p className="season-info">2025-26 Season • ESPN • All times ET ({currentTimeET})</p>
        <div className="header-buttons">
          <button onClick={copySubscribeUrl} className="subscribe-button">
            🔗 Subscribe to Calendar
          </button>
          <button onClick={downloadFullCalendar} className="download-button">
            📅 Download (.ics)
          </button>
        </div>
        <p className="subscribe-info">Subscribe = auto-updates & easy unsubscribe</p>
      </div>

      <div className="calendar-controls">
        <button onClick={handlePrevMonth} className="nav-button">
          ← Previous
        </button>
        <h2 className="month-year">{monthYear}</h2>
        <button onClick={handleNextMonth} className="nav-button">
          Next →
        </button>
        <button onClick={handleToday} className="today-button">
          Today
        </button>
      </div>

      <div className="calendar-grid">
        <div className="calendar-weekdays">
          {dayNames.map((day) => (
            <div key={day} className="weekday">
              {day}
            </div>
          ))}
        </div>

        <div className="calendar-days">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${
                selectedDate && isSameDay(day.date, selectedDate) ? 'selected' : ''
              } ${day.episodes.length > 0 ? 'has-episodes' : ''}`}
              onClick={() => setSelectedDate(day.date)}
            >
              <div className="day-number">{day.date.getDate()}</div>
              {day.episodes.length > 0 && (
                <div className="episodes-indicator">
                  <span className="episode-count">Inside the NBA 6PM</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {selectedDate && (
        <div className="episode-details">
          <h3>
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h3>
          {getEpisodesForDate(selectedDate).length > 0 ? (
            <div className="episodes-list">
              {getEpisodesForDate(selectedDate).map((episode) => (
                <div key={episode.id} className="episode-card">
                  <div className="episode-title">{episode.title}</div>
                  <div className="episode-info">
                    <span className="time">⏰ {episode.time}</span>
                    <span className="network">📺 {episode.network}</span>
                  </div>
                  {episode.description && (
                    <p className="episode-description">{episode.description}</p>
                  )}
                  <div className="reminder-buttons">
                    <button 
                      onClick={(e) => { e.stopPropagation(); addToGoogleCalendar(episode); }}
                      className="reminder-btn google"
                    >
                      📅 Add to Google Calendar
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); addToAppleCalendar(episode); }}
                      className="reminder-btn apple"
                    >
                      🍎 Add to Apple Calendar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-episodes">No episodes scheduled for this date.</p>
          )}
        </div>
      )}
    </div>
  );
};
