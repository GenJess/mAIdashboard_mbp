import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, Clock, AlertCircle, User, Calendar, Trash2 } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: Date;
  assignee?: string;
  category: string;
  createdAt: Date;
  isNew?: boolean;
}

interface TasksListProps {
  compact?: boolean;
}

const TasksList: React.FC<TasksListProps> = ({ compact = false }) => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Clean equipment',
      description: 'Deep clean all styling equipment and tools',
      priority: 'high',
      status: 'pending',
      dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      assignee: 'Sarah Johnson',
      category: 'Maintenance',
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
    },
    {
      id: '2',
      title: 'Restock inventory',
      description: 'Order new shampoo and conditioner supplies',
      priority: 'medium',
      status: 'in-progress',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      assignee: 'Mike Davis',
      category: 'Inventory',
      createdAt: new Date(Date.now() - 60 * 60 * 1000),
    },
    {
      id: '3',
      title: 'Update social media',
      description: 'Post daily content and respond to messages',
      priority: 'low',
      status: 'completed',
      dueDate: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      assignee: 'Emma Wilson',
      category: 'Marketing',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    },
    {
      id: '4',
      title: 'Client follow-up',
      description: 'Call clients from last week for feedback',
      priority: 'medium',
      status: 'pending',
      dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
      assignee: 'Alex Turner',
      category: 'Customer Service',
      createdAt: new Date(Date.now() - 45 * 60 * 1000),
    },
  ]);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);

  // Mock real-time task updates
  useEffect(() => {
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
        title: taskTitles[Math.floor(Math.random() * taskTitles.length)],
        description: 'Generated task from voice command',
        priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
        status: 'pending',
        dueDate: new Date(Date.now() + Math.random() * 48 * 60 * 60 * 1000), // Random time in next 48 hours
        assignee: assignees[Math.floor(Math.random() * assignees.length)],
        category: categories[Math.floor(Math.random() * categories.length)],
        createdAt: new Date(),
        isNew: true,
      };

      setTasks(prev => {
        const updated = [newTask, ...prev];
        return updated.slice(0, compact ? 4 : 10);
      });

      // Remove the "new" flag after animation
      setTimeout(() => {
        setTasks(prev => 
          prev.map(task => task.id === newTask.id ? { ...task, isNew: false } : task)
        );
      }, 3000);
    }, 12000);

    return () => clearInterval(interval);
  }, [compact]);

  const toggleTaskStatus = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === taskId) {
          const newStatus = task.status === 'completed' ? 'pending' : 
                           task.status === 'pending' ? 'in-progress' : 'completed';
          return { ...task, status: newStatus };
        }
        return task;
      })
    );
  };

  const addTask = () => {
    if (newTaskTitle.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        title: newTaskTitle.trim(),
        description: 'Task added via dashboard',
        priority: 'medium',
        status: 'pending',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        category: 'General',
        createdAt: new Date(),
        isNew: true,
      };

      setTasks(prev => [newTask, ...prev]);
      setNewTaskTitle('');
      setShowAddTask(false);

      // Remove the "new" flag after animation
      setTimeout(() => {
        setTasks(prev => 
          prev.map(task => task.id === newTask.id ? { ...task, isNew: false } : task)
        );
      }, 3000);
    }
  };

  const deleteTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
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

  const formatDueDate = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < -24) return `${Math.abs(Math.floor(diffInHours / 24))} days overdue`;
    if (diffInHours < -1) return `${Math.abs(diffInHours)} hours overdue`;
    if (diffInHours < 0) return 'Overdue';
    if (diffInHours < 1) return 'Due soon';
    if (diffInHours < 24) return `Due in ${diffInHours} hours`;
    return `Due in ${Math.floor(diffInHours / 24)} days`;
  };

  const isOverdue = (date: Date) => {
    return date.getTime() < new Date().getTime();
  };

  const displayTasks = compact ? tasks.slice(0, 4) : tasks;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <CheckSquare className="w-5 h-5 text-blue-500" />
              <span>Tasks & To-Do List</span>
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
      </div>

      <div className={`${compact ? 'max-h-[300px]' : 'max-h-[600px]'} overflow-y-auto`}>
        <div className="p-6 space-y-4">
          {displayTasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 rounded-lg border transition-all duration-500 ${
                task.isNew 
                  ? 'bg-blue-50 border-blue-200 scale-105 shadow-md' 
                  : task.status === 'completed'
                  ? 'bg-green-50 border-green-200'
                  : isOverdue(task.dueDate)
                  ? 'bg-red-50 border-red-200'
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
                      {task.isNew && (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full animate-pulse">
                          New
                        </span>
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
                        isOverdue(task.dueDate) ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {isOverdue(task.dueDate) && <AlertCircle className="w-3 h-3" />}
                        <Clock className="w-3 h-3" />
                        <span>{formatDueDate(task.dueDate)}</span>
                      </span>
                      {task.assignee && (
                        <span className="flex items-center space-x-1 text-gray-500">
                          <User className="w-3 h-3" />
                          <span>{task.assignee}</span>
                        </span>
                      )}
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
            <div className="text-center py-8 text-gray-500">
              <CheckSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No tasks yet</p>
              <p className="text-sm">Add tasks to stay organized</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TasksList;