import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, User, Calendar } from 'lucide-react';

interface CalendarProps {
  compact?: boolean;
}

interface Appointment {
  id: string;
  time: string;
  client: string;
  service: string;
  status: 'confirmed' | 'pending' | 'completed';
}

const CalendarView: React.FC<CalendarProps> = ({ compact = false }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const [appointments, setAppointments] = useState<Appointment[]>([
    { id: '1', time: '09:00', client: 'John Smith', service: 'Haircut', status: 'confirmed' },
    { id: '2', time: '10:30', client: 'Sarah Johnson', service: 'Color Treatment', status: 'pending' },
    { id: '3', time: '14:00', client: 'Mike Davis', service: 'Beard Trim', status: 'confirmed' },
    { id: '4', time: '15:30', client: 'Emma Wilson', service: 'Styling', status: 'completed' },
  ]);

  // Mock real-time appointment updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newAppointment: Appointment = {
        id: Date.now().toString(),
        time: `${Math.floor(Math.random() * 12) + 9}:${Math.random() > 0.5 ? '00' : '30'}`,
        client: ['Alex Turner', 'Lisa Brown', 'David Miller', 'Rachel Green'][Math.floor(Math.random() * 4)],
        service: ['Haircut', 'Massage', 'Consultation', 'Treatment'][Math.floor(Math.random() * 4)],
        status: 'pending' as const,
      };

      setAppointments(prev => {
        if (prev.length > 6) {
          return [newAppointment, ...prev.slice(0, 5)];
        }
        return [newAppointment, ...prev];
      });
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }
    return weekDays;
  };

  const navigateCalendar = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
      newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    }
    setCurrentDate(newDate);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Calendar Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <span>Calendar</span>
            </h2>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setView('month')}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  view === 'month' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setView('week')}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  view === 'week' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Week
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateCalendar('prev')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h3 className="text-lg font-medium text-gray-900 min-w-[200px] text-center">
                {view === 'month' 
                  ? `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                  : `Week of ${currentDate.toLocaleDateString()}`
                }
              </h3>
              <button
                onClick={() => navigateCalendar('next')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="p-6">
        {view === 'month' ? (
          <div className="space-y-4">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1">
              {dayNames.map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(currentDate).map((day, index) => (
                <div
                  key={index}
                  className={`min-h-[80px] p-2 border border-gray-100 rounded-lg ${
                    day === null 
                      ? 'bg-gray-50' 
                      : day === new Date().getDate() && 
                        currentDate.getMonth() === new Date().getMonth() &&
                        currentDate.getFullYear() === new Date().getFullYear()
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-white hover:bg-gray-50'
                  } transition-colors cursor-pointer`}
                >
                  {day && (
                    <>
                      <div className="font-medium text-gray-900 mb-1">{day}</div>
                      {appointments.slice(0, 2).map((apt, i) => (
                        <div key={i} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mb-1 truncate">
                          {apt.time} - {apt.client}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Week View */}
            <div className="grid grid-cols-8 gap-1">
              <div className="p-2"></div>
              {getWeekDays().map((day, index) => (
                <div key={index} className="p-2 text-center">
                  <div className="text-sm font-medium text-gray-900">{dayNames[day.getDay()]}</div>
                  <div className={`text-2xl font-bold mt-1 ${
                    day.toDateString() === new Date().toDateString() 
                      ? 'text-blue-600' 
                      : 'text-gray-600'
                  }`}>
                    {day.getDate()}
                  </div>
                </div>
              ))}
            </div>

            {/* Time Slots */}
            <div className="space-y-1">
              {Array.from({ length: 12 }, (_, i) => i + 8).map(hour => (
                <div key={hour} className="grid grid-cols-8 gap-1">
                  <div className="p-2 text-sm text-gray-500 text-right">
                    {hour}:00
                  </div>
                  {getWeekDays().map((day, dayIndex) => (
                    <div key={dayIndex} className="min-h-[40px] border border-gray-100 rounded hover:bg-blue-50 transition-colors cursor-pointer">
                      {appointments
                        .filter(apt => apt.time.startsWith(hour.toString()))
                        .slice(0, 1)
                        .map((apt, i) => (
                          <div key={i} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded m-1 truncate">
                            {apt.client}
                          </div>
                        ))
                      }
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarView;