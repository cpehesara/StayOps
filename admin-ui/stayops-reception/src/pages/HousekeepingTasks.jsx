import React, { useState, useEffect } from 'react';
import { Briefcase, CheckCircle, Clock, AlertCircle, Calendar } from 'lucide-react';
import {
  getPendingHousekeepingTasks,
  getUrgentHousekeepingTasks,
  getTasksByDate,
  completeHousekeepingTask
} from '../api/automation';

const HousekeepingTasks = () => {
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [viewType, setViewType] = useState('pending');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [completingTaskId, setCompletingTaskId] = useState(null);

  useEffect(() => {
    loadTasks();
  }, [viewType, selectedDate]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      let data;
      
      switch(viewType) {
        case 'urgent':
          data = await getUrgentHousekeepingTasks();
          break;
        case 'date':
          data = await getTasksByDate(selectedDate);
          break;
        default:
          data = await getPendingHousekeepingTasks();
      }
      
      setTasks(data);
    } catch (error) {
      console.error('Error loading housekeeping tasks:', error);
      alert('Failed to load housekeeping tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId) => {
    if (!window.confirm('Mark this task as completed?')) return;
    
    try {
      setCompletingTaskId(taskId);
      await completeHousekeepingTask(taskId, 'Current User');
      alert('Task completed successfully');
      loadTasks();
    } catch (error) {
      console.error('Error completing task:', error);
      alert('Failed to complete task');
    } finally {
      setCompletingTaskId(null);
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority?.toUpperCase()) {
      case 'URGENT':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTaskTypeIcon = (type) => {
    switch(type?.toUpperCase()) {
      case 'CHECKOUT_CLEANING':
        return '🧹';
      case 'TURNDOWN_SERVICE':
        return '🛏️';
      case 'DEEP_CLEANING':
        return '🧽';
      case 'MAINTENANCE':
        return '🔧';
      case 'INSPECTION':
        return '🔍';
      default:
        return '📋';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-8 py-12">
        
        {/* Header */}
        <div className="mb-16 border-b border-black pb-6">
          <h1 className="text-5xl font-light tracking-tight text-black mb-2">
            Housekeeping Tasks
          </h1>
          <p className="text-sm text-gray-500">
            Automated task assignment and tracking
          </p>
        </div>

        {/* View Filters */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-2">
            <button
              onClick={() => setViewType('pending')}
              className={`px-6 py-3 text-sm border transition-colors flex items-center gap-2 ${
                viewType === 'pending'
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-black border-gray-200 hover:border-black'
              }`}
            >
              <Clock size={16} />
              Pending
            </button>
            <button
              onClick={() => setViewType('urgent')}
              className={`px-6 py-3 text-sm border transition-colors flex items-center gap-2 ${
                viewType === 'urgent'
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-black border-gray-200 hover:border-black'
              }`}
            >
              <AlertCircle size={16} />
              Urgent
            </button>
            <button
              onClick={() => setViewType('date')}
              className={`px-6 py-3 text-sm border transition-colors flex items-center gap-2 ${
                viewType === 'date'
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-black border-gray-200 hover:border-black'
              }`}
            >
              <Calendar size={16} />
              By Date
            </button>
          </div>

          {viewType === 'date' && (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-200 text-sm focus:outline-none focus:border-black"
            />
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-12">
          <div className="border border-gray-200 p-6">
            <div className="text-2xl font-light mb-1">
              {tasks.filter(t => t.status === 'PENDING').length}
            </div>
            <div className="text-sm text-gray-500">Pending Tasks</div>
          </div>
          <div className="border border-gray-200 p-6">
            <div className="text-2xl font-light mb-1">
              {tasks.filter(t => t.priority === 'URGENT').length}
            </div>
            <div className="text-sm text-gray-500">Urgent</div>
          </div>
          <div className="border border-gray-200 p-6">
            <div className="text-2xl font-light mb-1">
              {tasks.filter(t => t.status === 'COMPLETED').length}
            </div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
          <div className="border border-gray-200 p-6">
            <div className="text-2xl font-light mb-1">
              {tasks.filter(t => t.assignedStaffId).length}
            </div>
            <div className="text-sm text-gray-500">Assigned</div>
          </div>
        </div>

        {/* Tasks List */}
        <div>
          {loading && tasks.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              Loading housekeeping tasks...
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-gray-300">
              <Briefcase size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-sm text-gray-500">No tasks found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map(task => (
                <div 
                  key={task.id} 
                  className={`border p-6 ${
                    task.status === 'COMPLETED' 
                      ? 'border-gray-200 bg-gray-50' 
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{getTaskTypeIcon(task.taskType)}</span>
                        <div>
                          <h3 className="font-medium">
                            Room {task.roomNumber || task.roomId}
                          </h3>
                          <div className="text-sm text-gray-500">
                            {task.taskType?.replace(/_/g, ' ')}
                          </div>
                        </div>
                        <span className={`px-3 py-1 text-xs border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        {task.status === 'COMPLETED' && (
                          <span className="px-3 py-1 text-xs bg-green-100 text-green-800">
                            Completed
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <div className="text-sm text-gray-700 mb-3">
                          {task.description}
                        </div>
                      )}

                      <div className="grid grid-cols-4 gap-4 text-sm">
                        {task.scheduledTime && (
                          <div>
                            <span className="text-gray-500">Scheduled:</span>
                            <div className="font-medium">
                              {new Date(task.scheduledTime).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </div>
                        )}
                        {task.assignedStaffId && (
                          <div>
                            <span className="text-gray-500">Assigned To:</span>
                            <div className="font-medium">Staff #{task.assignedStaffId}</div>
                          </div>
                        )}
                        {task.estimatedDuration && (
                          <div>
                            <span className="text-gray-500">Duration:</span>
                            <div className="font-medium">{task.estimatedDuration} min</div>
                          </div>
                        )}
                        {task.createdAt && (
                          <div>
                            <span className="text-gray-500">Created:</span>
                            <div className="font-medium">
                              {new Date(task.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        )}
                      </div>

                      {task.status === 'COMPLETED' && task.completedBy && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200">
                          <div className="text-xs text-green-800">
                            Completed by {task.completedBy} on {new Date(task.completedAt).toLocaleString()}
                          </div>
                        </div>
                      )}

                      {task.notes && (
                        <div className="mt-3 p-3 bg-gray-50 border border-gray-200">
                          <div className="text-xs font-medium mb-1">Notes:</div>
                          <div className="text-xs text-gray-700">{task.notes}</div>
                        </div>
                      )}
                    </div>

                    {task.status !== 'COMPLETED' && (
                      <button
                        onClick={() => handleCompleteTask(task.id)}
                        disabled={completingTaskId === task.id}
                        className="ml-4 px-6 py-3 bg-black text-white text-sm hover:bg-gray-900 transition-colors disabled:bg-gray-300 flex items-center gap-2"
                      >
                        <CheckCircle size={18} />
                        {completingTaskId === task.id ? 'Completing...' : 'Complete'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Task Distribution Chart (Placeholder) */}
        {tasks.length > 0 && (
          <div className="mt-12 border border-gray-200 p-6">
            <h3 className="font-medium mb-6">Task Distribution</h3>
            <div className="grid grid-cols-5 gap-4">
              {['CHECKOUT_CLEANING', 'TURNDOWN_SERVICE', 'DEEP_CLEANING', 'MAINTENANCE', 'INSPECTION'].map(type => {
                const count = tasks.filter(t => t.taskType === type).length;
                const percentage = tasks.length > 0 ? (count / tasks.length * 100).toFixed(0) : 0;
                
                return (
                  <div key={type} className="text-center">
                    <div className="text-2xl mb-2">{getTaskTypeIcon(type)}</div>
                    <div className="font-medium text-lg">{count}</div>
                    <div className="text-xs text-gray-500 mb-2">
                      {type.replace(/_/g, ' ')}
                    </div>
                    <div className="w-full bg-gray-200 h-2">
                      <div 
                        className="bg-black h-2" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{percentage}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HousekeepingTasks;