import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, Clock, AlertCircle, User, Calendar, Trash2, Repeat, Zap, Filter } from 'lucide-react';
import { supabase, Database } from '../lib/supabase';
import TaskForm from './TaskForm';

type Task = Database['public']['Tables']['tasks']['Row'];

interface TasksListProps {
  businessId: string;
  compact?: boolean;
  isSimulating?: boolean;
}

const TasksList: React.FC<TasksListProps> = ({ businessId, compact = false, isSimulating = true }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<string>('all');

  // Real-time data fetching and subscription
  useEffect(() => {
    if (!isSimulating) {
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
  }, [businessId, isSimulating]);

  // Mock simulation data (existing logic)
  useEffect(() => {
    if (isSimulating) {
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
          is_recurring: true,
          recurrence_pattern: { frequency: 'weekly' },
          parent_task_id: null,
          next_due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
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
          is_recurring: true,
          recurrence_pattern: { frequency: 'daily' },
          parent_task_id: null,
          next_due_date: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
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
        {
          id: '5',
          business_id: businessId,
          title: 'Restock Shampoo',
          description: 'Current stock: 8 (threshold: 3) - Auto-generated from low inventory',
          priority: 'high',
          status: 'pending',
          due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          assignee: null,
          category: 'Inventory',
          is_recurring: false,
          recurrence_pattern: {},
          parent_task_id: null,
          next_due_date: null,
          created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
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
        const assignees = ['Sarah Johnson', 'Mike Davis', 'Emma Wilson', 'Alex Turner', 'Lisa Brown'];
        
        const newTask: Task = {
          id: Date.now().toString(),
          business_id: businessId,
          title: taskTitles[Math.floor(Math.random() * taskTitles.length)],
          description: 'Generated task from voice command or smart detection',
          priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
          status: 'pending',
          due_date: new Date(Date.now() + Math.random() * 48 * 60 * 60 * 1000).toISOString(),
          assignee: assignees[Math.floor(Math.random() * assignees.length)],
          category: categories[Math.floor(Math.random() * categories.length)],
          is_recurring: Math.random() > 0.7, // 30% chance of being recurring
          recurrence_pattern: Math.random() > 0.7 ? { frequency: ['daily', 'weekly', 'monthly'][Math.floor(Math.random() * 3)] } : {},
          parent_task_id: null,
          next_due_date: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        setTasks(prev => {
          const updated = [newTask, ...prev];
          return updated.slice(0, compact ? 4 : 15);
        });
      }, 15000);

      return () => clearInterval(interval);
    }
  }, [businessId, compact, isSimulating]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .limit(compact ? 4 : 20);

      if (error) {
        console.error('Error fetching tasks:', error);
        return;
      }

      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const toggleTaskStatus = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Simple toggle: pending/in-progress -> completed, completed -> pending
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';

    if (!isSimulating) {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) {
        console.error('Error updating task:', error);
        return;
      }

      // If completing a recurring task, generate next instance
      if (newStatus === 'completed' && task.is_recurring) {
        const { error: recurError } = await supabase.rpc('generate_next_recurring_task', {
          task_id: taskId
        });

        if (recurError) {
          console.error('Error generating recurring task:', recurError);
        }
      }
    } else {
      // Simulation mode - update local state
      setTasks(prevTasks =>
        prevTasks.map(t => {
          if (t.id === taskId) {
            return { ...t, status: newStatus };
          }
          return t;
        })
      );
    }
  };

  const handleFormSave = () => {
    if (!isSimulating) {
      fetchTasks();
    }
    setEditingTask(null);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleNewTask = () => {
    setEditingTask(null);
    setShowForm(true);
  };

  const deleteTask = async (taskId: string) => {
    if (!isSimulating) {
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

  const generateSmartTasks = async () => {
    if (!isSimulating) {
      const { error } = await supabase.rpc('generate_smart_tasks', {
        business_uuid: businessId
      });

      if (error) {
        console.error('Error generating smart tasks:', error);
      } else {
        fetchTasks(); // Refresh to show new tasks
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const isSmartTask = (task: Task) => {
    return task.description?.includes('Auto-generated') || 
           task.description?.includes('smart detection') ||
           task.title.toLowerCase().includes('restock') ||
           task.title.toLowerCase().includes('follow');
  };

  const filteredTasks = () => {
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
      case 'recurring':
        filtered = tasks.filter(t => t.is_recurring);
        break;
      case 'smart':
        filtered = tasks.filter(t => isSmartTask(t));
        break;
      case 'overdue':
        filtered = tasks.filter(t => isOverdue(t.due_date));
        break;
      default:
        filtered = tasks;
    }
    
    return compact ? filtered.slice(0, 4) : filtered;
  };

  const displayTasks = filteredTasks();

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <CheckSquare className="w-5 h-5 text-blue-500" />
                <span>Tasks & To-Do List</span>
                {!compact && !isSimulating && (
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
              <div className="flex items-center space-x-2">
                <button
                  onClick={generateSmartTasks}
                  className="flex items-center space-x-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  title="Generate smart tasks based on business data"
                >
                  <Zap className="w-4 h-4" />
                  <span>Smart Tasks</span>
                </button>
                <button
                  onClick={handleNewTask}
                  className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Task</span>
                </button>
              </div>
            )}
          </div>

          {/* Filter Options */}
          {!compact && (
            <div className="mt-4 flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">All Tasks</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="recurring">Recurring</option>
                <option value="smart">Smart Generated</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          )}
        </div>

        <div className={`${compact ? 'max-h-[300px]' : 'max-h-[600px]'} overflow-y-auto`}>
          <div className="p-6 space-y-4">
            {displayTasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 rounded-lg border transition-all duration-300 ${
                  task.status === 'completed'
                    ? 'bg-green-50 border-green-200'
                    : isOverdue(task.due_date)
                    ? 'bg-red-50 border-red-200'
                    : isSmartTask(task)
                    ? 'bg-purple-50 border-purple-200'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <button
                      onClick={() => toggleTaskStatus(task.id)}
                      className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        task.status === 'completed'
                          ? 'bg-green-500 border-green-500 text-white'
                          : task.status === 'in-progress'
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {task.status === 'completed' && <CheckSquare className="w-3 h-3" />}
                      {task.status === 'in-progress' && <Clock className="w-3 h-3" />}
                    </button>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className={`font-medium ${
                          task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'
                        }`}>
                          {task.title}
                        </h3>
                        {task.is_recurring && (
                          <Repeat className="w-4 h-4 text-blue-500" title="Recurring task" />
                        )}
                        {isSmartTask(task) && (
                          <Zap className="w-4 h-4 text-purple-500" title="Smart generated task" />
                        )}
                      </div>
                      
                      {!compact && (
                        <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-xs">
                        <span className={`px-2 py-1 rounded-full border font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                        <span className={`px-2 py-1 rounded-full border font-medium ${getStatusColor(task.status)}`}>
                          {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('-', ' ')}
                        </span>
                        <span className={`flex items-center space-x-1 ${
                          isOverdue(task.due_date) ? 'text-red-600' : 'text-gray-500'
                        }`}>
                          {isOverdue(task.due_date) && <AlertCircle className="w-3 h-3" />}
                          <Clock className="w-3 h-3" />
                          <span>{formatDueDate(task.due_date)}</span>
                        </span>
                        {task.assignee && (
                          <span className="flex items-center space-x-1 text-gray-500">
                            <User className="w-3 h-3" />
                            <span>{task.assignee}</span>
                          </span>
                        )}
                      </div>
                      
                      {!compact && (
                        <div className="mt-2 text-xs text-gray-500 flex items-center space-x-2">
                          <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded">
                            {task.category}
                          </span>
                          {task.is_recurring && (
                            <span className="bg-blue-200 text-blue-700 px-2 py-1 rounded flex items-center space-x-1">
                              <Repeat className="w-3 h-3" />
                              <span>{task.recurrence_pattern?.frequency || 'weekly'}</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {!compact && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditTask(task)}
                        className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                        title="Edit task"
                      >
                        <Calendar className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {displayTasks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CheckSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No tasks found</p>
                <p className="text-sm">
                  {filter === 'all' ? 'Add tasks to stay organized' : `No ${filter} tasks`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Form Modal */}
      <TaskForm
        businessId={businessId}
        task={editingTask}
        isOpen={showForm}
        onClose={handleFormClose}
        onSave={handleFormSave}
        isSimulating={isSimulating}
      />
    </>
  );
};

export default TasksList;