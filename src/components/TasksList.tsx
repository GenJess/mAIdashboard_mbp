import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, Clock, AlertCircle, User, Calendar, Trash2, Filter, ArrowUpDown, ChevronDown, X, Check } from 'lucide-react';
import { supabase, Database } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

type Task = Database['public']['Tables']['tasks']['Row'];

interface TasksListProps {
  businessId: string;
  compact?: boolean;
  isSimulating?: boolean;
}

const TasksList: React.FC<TasksListProps> = ({ businessId, compact = false, isSimulating }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at_desc');
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [displayLimit, setDisplayLimit] = useState(compact ? 4 : 10);

  // Mock employees for assignment
  const mockEmployees = [
    'Unassigned',
    'Employee 1',
    'Employee 2', 
    'Employee 3',
    'Sarah Johnson',
    'Mike Davis',
    'Emma Wilson',
    'Alex Turner'
  ];

  // Determine if we should use real data (user is authenticated and not simulating)
  const useRealData = !isSimulating && user;

  // Real-time data fetching and subscription
  useEffect(() => {
    if (useRealData) {
      fetchTasks();
      
      // Set up real-time subscription
      const channel = supabase
        .channel('tasks_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tasks',
            filter: `business_id=eq.${businessId}`,
          },
          (payload) => {
            console.log('Task change received:', payload);
            fetchTasks(); // Refetch data on any change
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [businessId, useRealData]);

  // Mock simulation data (existing logic)
  useEffect(() => {
    if (!useRealData) {
      // Initialize with mock data
      const mockTasks: Task[] = [
        {
          id: '1',
          business_id: businessId,
          title: 'Clean equipment',
          description: 'Deep clean all styling equipment and tools',
          priority: 'high',
          status: 'pending',
          due_date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          assignee: 'Sarah Johnson',
          category: 'Maintenance',
          is_recurring: false,
          recurrence_pattern: {},
          parent_task_id: null,
          next_due_date: null,
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          business_id: businessId,
          title: 'Restock inventory',
          description: 'Order new shampoo and conditioner supplies',
          priority: 'medium',
          status: 'in-progress',
          due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          assignee: 'Mike Davis',
          category: 'Inventory',
          is_recurring: false,
          recurrence_pattern: {},
          parent_task_id: null,
          next_due_date: null,
          created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          business_id: businessId,
          title: 'Update social media',
          description: 'Post daily content and respond to messages',
          priority: 'low',
          status: 'completed',
          due_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          assignee: 'Emma Wilson',
          category: 'Marketing',
          is_recurring: false,
          recurrence_pattern: {},
          parent_task_id: null,
          next_due_date: null,
          created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '4',
          business_id: businessId,
          title: 'Client follow-up',
          description: 'Call clients from last week for feedback',
          priority: 'medium',
          status: 'pending',
          due_date: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
          assignee: 'Alex Turner',
          category: 'Customer Service',
          is_recurring: false,
          recurrence_pattern: {},
          parent_task_id: null,
          next_due_date: null,
          created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        },
      ];
      setTasks(mockTasks);

      // Mock real-time task updates
      const interval = setInterval(() => {
        const taskTitles = [
          'Schedule staff meeting',
          'Review customer feedback',
          'Update price list',
          'Order new products',
          'Prepare monthly report',
          'Contact suppliers',
          'Train new employee',
          'Fix equipment issue',
        ];
        
        const categories = ['Operations', 'HR', 'Finance', 'Marketing', 'Maintenance'];
        const assignees = ['Sarah Johnson', 'Mike Davis', 'Emma Wilson', 'Alex Turner', 'Employee 1'];
        
        const newTask: Task = {
          id: Date.now().toString(),
          business_id: businessId,
          title: taskTitles[Math.floor(Math.random() * taskTitles.length)],
          description: 'Generated task from voice command',
          priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
          status: 'pending',
          due_date: new Date(Date.now() + Math.random() * 48 * 60 * 60 * 1000).toISOString(),
          assignee: assignees[Math.floor(Math.random() * assignees.length)],
          category: categories[Math.floor(Math.random() * categories.length)],
          is_recurring: false,
          recurrence_pattern: {},
          parent_task_id: null,
          next_due_date: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        setTasks(prev => {
          const updated = [newTask, ...prev];
          return updated.slice(0, 20); // Keep only latest 20 tasks
        });
      }, 12000);

      return () => clearInterval(interval);
    }
  }, [businessId, compact, useRealData]);

  const fetchTasks = async () => {
    if (!useRealData) return;
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tasks:', error);
        return;
      }

      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    if (useRealData) {
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId);

      if (error) {
        console.error('Error updating task:', error);
        return;
      }
    } else {
      // Simulation mode - update local state
      setTasks(prevTasks =>
        prevTasks.map(task => {
          if (task.id === taskId) {
            return { ...task, ...updates };
          }
          return task;
        })
      );
    }
  };

  const toggleTaskStatus = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Simple toggle: completed <-> pending
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    await updateTask(taskId, { status: newStatus });
  };

  const addTask = async () => {
    if (newTaskTitle.trim()) {
      const newTaskData = {
        business_id: businessId,
        title: newTaskTitle.trim(),
        description: 'Task added via dashboard',
        priority: 'medium' as const,
        status: 'pending' as const,
        due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        category: 'General',
      };

      if (useRealData) {
        try {
          const { data, error } = await supabase
            .from('tasks')
            .insert(newTaskData)
            .select()
            .single();

          if (error) {
            console.error('Error creating task:', error);
            return;
          }

          // Task will be added via real-time subscription
        } catch (error) {
          console.error('Error creating task:', error);
          return;
        }
      } else {
        // Simulation mode - add to local state
        const newTask: Task = {
          id: Date.now().toString(),
          ...newTaskData,
          assignee: null,
          is_recurring: false,
          recurrence_pattern: {},
          parent_task_id: null,
          next_due_date: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        setTasks(prev => [newTask, ...prev]);
      }

      setNewTaskTitle('');
      setShowAddTask(false);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (useRealData) {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        console.error('Error deleting task:', error);
        return;
      }
    } else {
      // Simulation mode - update local state
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    }
  };

  const handleFieldEdit = (taskId: string, field: string, value: any) => {
    const updates: Partial<Task> = {};
    
    if (field === 'due_date' && value) {
      updates.due_date = new Date(value).toISOString();
    } else {
      updates[field as keyof Task] = value === 'Unassigned' ? null : value;
    }
    
    updateTask(taskId, updates);
    setEditingTask(null);
    setEditingField(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200';
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200';
    }
  };

  const formatDueDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < -24) return `${Math.abs(Math.floor(diffInHours / 24))} days overdue`;
    if (diffInHours < -1) return `${Math.abs(diffInHours)} hours overdue`;
    if (diffInHours < 0) return 'Overdue';
    if (diffInHours < 1) return 'Due soon';
    if (diffInHours < 24) return `Due in ${diffInHours} hours`;
    return `Due in ${Math.floor(diffInHours / 24)} days`;
  };

  const isOverdue = (dateString: string | null) => {
    if (!dateString) return false;
    return new Date(dateString).getTime() < new Date().getTime();
  };

  const sortTasks = (tasksToSort: Task[]) => {
    const sorted = [...tasksToSort].sort((a, b) => {
      switch (sortBy) {
        case 'created_at_desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'created_at_asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'due_date_asc':
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        case 'due_date_desc':
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(b.due_date).getTime() - new Date(a.due_date).getTime();
        case 'priority_high_low':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'priority_low_high':
          const priorityOrderReverse = { high: 3, medium: 2, low: 1 };
          return priorityOrderReverse[a.priority] - priorityOrderReverse[b.priority];
        case 'status_pending_first':
          const statusOrder = { pending: 3, 'in-progress': 2, completed: 1 };
          return statusOrder[b.status] - statusOrder[a.status];
        case 'status_completed_first':
          const statusOrderReverse = { pending: 1, 'in-progress': 2, completed: 3 };
          return statusOrderReverse[b.status] - statusOrderReverse[a.status];
        default:
          return 0;
      }
    });

    // Always move completed tasks to bottom regardless of sort
    const pending = sorted.filter(task => task.status !== 'completed');
    const completed = sorted.filter(task => task.status === 'completed');
    
    return [...pending, ...completed];
  };

  const filteredAndSortedTasks = () => {
    let filtered = tasks;
    
    switch (filter) {
      case 'pending':
        filtered = tasks.filter(t => t.status === 'pending');
        break;
      case 'in-progress':
        filtered = tasks.filter(t => t.status === 'in-progress');
        break;
      case 'completed':
        filtered = tasks.filter(t => t.status === 'completed');
        break;
      case 'active':
        filtered = tasks.filter(t => t.status !== 'completed');
        break;
      case 'overdue':
        filtered = tasks.filter(t => isOverdue(t.due_date));
        break;
      case 'upcoming':
        filtered = tasks.filter(t => t.due_date && !isOverdue(t.due_date));
        break;
      default:
        filtered = tasks;
    }
    
    return sortTasks(filtered);
  };

  const allFilteredTasks = filteredAndSortedTasks();
  const displayTasks = allFilteredTasks.slice(0, displayLimit);
  const hasMoreTasks = allFilteredTasks.length > displayLimit;

  const loadMoreTasks = () => {
    setDisplayLimit(prev => prev + 10);
  };

  const sortOptions = [
    { value: 'created_at_desc', label: 'Newest First' },
    { value: 'created_at_asc', label: 'Oldest First' },
    { value: 'due_date_asc', label: 'Due Date (Soonest)' },
    { value: 'due_date_desc', label: 'Due Date (Latest)' },
    { value: 'priority_high_low', label: 'Priority (High to Low)' },
    { value: 'priority_low_high', label: 'Priority (Low to High)' },
    { value: 'status_pending_first', label: 'Status (Pending First)' },
    { value: 'status_completed_first', label: 'Status (Completed First)' },
  ];

  const filterOptions = [
    { value: 'all', label: 'All Tasks' },
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'overdue', label: 'Overdue' },
  ];

  // Dropdown component for inline editing
  const EditDropdown: React.FC<{
    taskId: string;
    field: string;
    currentValue: any;
    options: Array<{ value: any; label: string; color?: string }>;
    onSelect: (value: any) => void;
    onCancel: () => void;
  }> = ({ taskId, field, currentValue, options, onSelect, onCancel }) => (
    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-[150px]">
      <div className="py-1">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors ${
              currentValue === option.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
            }`}
          >
            <span className={option.color ? `inline-block w-2 h-2 rounded-full mr-2 ${option.color}` : ''}>
              {option.color ? '' : ''}
            </span>
            {option.label}
          </button>
        ))}
      </div>
      <div className="border-t border-gray-200 px-3 py-2">
        <button
          onClick={onCancel}
          className="text-xs text-gray-500 hover:text-gray-700 flex items-center space-x-1"
        >
          <X className="w-3 h-3" />
          <span>Cancel</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <CheckSquare className="w-5 h-5 text-blue-500" />
              <span>Task List</span>
              {!compact && useRealData && (
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  Live Data
                </span>
              )}
              {!compact && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>}
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              {compact ? 'Recent tasks' : 'Manage your daily tasks and priorities'}
            </p>
          </div>
          
          {!compact && (
            <button
              onClick={() => setShowAddTask(!showAddTask)}
              className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          )}
        </div>

        {/* Add Task Form */}
        {showAddTask && !compact && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Enter task title..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
              />
              <button
                onClick={addTask}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddTask(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Filter and Sort Options */}
        {!compact && (
          <div className="mt-4 flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                {filterOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <ArrowUpDown className="w-4 h-4 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {displayTasks.map((task) => (
            <div
              key={task.id}
              className={`p-3 rounded-lg border transition-all duration-300 ${
                task.status === 'completed'
                  ? 'bg-green-50 border-green-200 opacity-75'
                  : isOverdue(task.due_date)
                  ? 'bg-red-50 border-red-200'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <button
                    onClick={() => toggleTaskStatus(task.id)}
                    className={`mt-1 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                      task.status === 'completed'
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {task.status === 'completed' && <Check className="w-2.5 h-2.5" />}
                  </button>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className={`font-medium text-sm truncate ${
                        task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'
                      }`}>
                        {task.title}
                      </h3>
                    </div>
                    
                    {!compact && (
                      <p className="text-xs text-gray-600 mb-2">{task.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-2 text-xs flex-wrap">
                      {/* Priority Dropdown */}
                      <div className="relative">
                        <button
                          onClick={() => {
                            setEditingTask(task.id);
                            setEditingField('priority');
                          }}
                          className={`px-2 py-1 rounded-full border font-medium transition-colors flex items-center space-x-1 ${getPriorityColor(task.priority)}`}
                        >
                          <span>{task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span>
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        
                        {editingTask === task.id && editingField === 'priority' && (
                          <EditDropdown
                            taskId={task.id}
                            field="priority"
                            currentValue={task.priority}
                            options={[
                              { value: 'high', label: 'High', color: 'bg-red-500' },
                              { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
                              { value: 'low', label: 'Low', color: 'bg-green-500' }
                            ]}
                            onSelect={(value) => handleFieldEdit(task.id, 'priority', value)}
                            onCancel={() => {
                              setEditingTask(null);
                              setEditingField(null);
                            }}
                          />
                        )}
                      </div>

                      {/* Status Dropdown */}
                      <div className="relative">
                        <button
                          onClick={() => {
                            setEditingTask(task.id);
                            setEditingField('status');
                          }}
                          className={`px-2 py-1 rounded-full border font-medium transition-colors flex items-center space-x-1 ${getStatusColor(task.status)}`}
                        >
                          <span>{task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('-', ' ')}</span>
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        
                        {editingTask === task.id && editingField === 'status' && (
                          <EditDropdown
                            taskId={task.id}
                            field="status"
                            currentValue={task.status}
                            options={[
                              { value: 'pending', label: 'Pending', color: 'bg-gray-500' },
                              { value: 'in-progress', label: 'In Progress', color: 'bg-blue-500' },
                              { value: 'completed', label: 'Completed', color: 'bg-green-500' }
                            ]}
                            onSelect={(value) => handleFieldEdit(task.id, 'status', value)}
                            onCancel={() => {
                              setEditingTask(null);
                              setEditingField(null);
                            }}
                          />
                        )}
                      </div>

                      {/* Due Date */}
                      <div className="relative">
                        <button
                          onClick={() => {
                            setEditingTask(task.id);
                            setEditingField('due_date');
                          }}
                          className={`flex items-center space-x-1 px-2 py-1 rounded border hover:bg-gray-100 transition-colors ${
                            isOverdue(task.due_date) ? 'text-red-600 border-red-200' : 'text-gray-500 border-gray-200'
                          }`}
                        >
                          {isOverdue(task.due_date) && <AlertCircle className="w-3 h-3" />}
                          <Clock className="w-3 h-3" />
                          <span>{formatDueDate(task.due_date)}</span>
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        
                        {editingTask === task.id && editingField === 'due_date' && (
                          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-3">
                            <input
                              type="datetime-local"
                              defaultValue={task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : ''}
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleFieldEdit(task.id, 'due_date', e.target.value);
                                }
                              }}
                              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="mt-2 flex space-x-2">
                              <button
                                onClick={() => {
                                  setEditingTask(null);
                                  setEditingField(null);
                                }}
                                className="text-xs text-gray-500 hover:text-gray-700"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Assignee Dropdown */}
                      <div className="relative">
                        <button
                          onClick={() => {
                            setEditingTask(task.id);
                            setEditingField('assignee');
                          }}
                          className="flex items-center space-x-1 px-2 py-1 rounded border hover:bg-gray-100 transition-colors text-gray-500 border-gray-200"
                        >
                          <User className="w-3 h-3" />
                          <span>{task.assignee || 'Unassigned'}</span>
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        
                        {editingTask === task.id && editingField === 'assignee' && (
                          <EditDropdown
                            taskId={task.id}
                            field="assignee"
                            currentValue={task.assignee || 'Unassigned'}
                            options={mockEmployees.map(emp => ({ value: emp, label: emp }))}
                            onSelect={(value) => handleFieldEdit(task.id, 'assignee', value)}
                            onCancel={() => {
                              setEditingTask(null);
                              setEditingField(null);
                            }}
                          />
                        )}
                      </div>
                    </div>
                    
                    {!compact && (
                      <div className="mt-2 text-xs text-gray-500">
                        <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded">
                          {task.category}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {!compact && (
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {displayTasks.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              <CheckSquare className="w-8 h-8 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No tasks found</p>
              <p className="text-xs">
                {filter === 'all' ? 'Add tasks to stay organized' : `No ${filter} tasks`}
              </p>
            </div>
          )}

          {hasMoreTasks && (
            <button
              onClick={loadMoreTasks}
              className="w-full mt-3 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-sm font-medium transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
              <span>Load More Tasks ({allFilteredTasks.length - displayLimit} remaining)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TasksList;