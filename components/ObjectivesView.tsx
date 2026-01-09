import React from 'react';
import { AppState, Objective } from '../types';
import { Plus, Trash2 } from 'lucide-react';
import { generateId } from '../services/dataService';

interface ObjectivesViewProps {
  state: AppState;
  updateState: (newState: Partial<AppState>) => void;
}

const ObjectivesView: React.FC<ObjectivesViewProps> = ({ state, updateState }) => {
  const currentMonth = state.settings.currentMonth;

  const handleUpdateProgress = (objId: string, val: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) return;

    const newObjs = state.objectives.map(o => {
      if (o.id === objId) {
        const mData = { ...o.monthlyData };
        if (!mData[currentMonth]) mData[currentMonth] = { progress: 0, note: '' };
        mData[currentMonth].progress = num;
        return { ...o, monthlyData: mData };
      }
      return o;
    });
    updateState({ objectives: newObjs });
  };

  const handleUpdateNote = (objId: string, note: string) => {
    const newObjs = state.objectives.map(o => {
      if (o.id === objId) {
        const mData = { ...o.monthlyData };
        if (!mData[currentMonth]) mData[currentMonth] = { progress: 0, note: '' };
        mData[currentMonth].note = note;
        return { ...o, monthlyData: mData };
      }
      return o;
    });
    updateState({ objectives: newObjs });
  };

  const addObjective = () => {
    const desc = prompt("Objective Description:");
    if (!desc) return;
    const newObj: Objective = {
      id: `obj_${generateId()}`,
      description: desc,
      target: 1,
      status: 'In Progress',
      monthlyData: {}
    };
    updateState({ objectives: [...state.objectives, newObj] });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Objectives</h2>
        <button onClick={addObjective} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus size={16} className="mr-2" /> Add Goal
        </button>
      </div>

      <div className="grid gap-4">
        {state.objectives.map(obj => {
          const currentData = obj.monthlyData[currentMonth] || { progress: 0, note: '' };
          const totalProgress = (Object.values(obj.monthlyData) as { progress: number }[]).reduce((sum, d) => sum + d.progress, 0);
          
          return (
            <div key={obj.id} className="bg-white dark:bg-darkSurface p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                   <h3 className="font-semibold text-lg">{obj.description}</h3>
                   <span className={`px-2 py-1 rounded text-xs font-medium ${obj.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                     {obj.status}
                   </span>
                </div>
                
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Total Progress: {totalProgress.toFixed(2)} / {obj.target}</span>
                    <span>{(totalProgress / obj.target * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-blue-500 h-3 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (totalProgress / obj.target) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="text-xs text-gray-400">
                  Deadline: {obj.deadline || 'No deadline'}
                </div>
              </div>

              {/* Monthly Input Section */}
              <div className="w-full md:w-1/3 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                <h4 className="text-sm font-semibold mb-3 text-gray-500 uppercase tracking-wide">Update for {currentMonth}</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs mb-1">Monthly Increment</label>
                    <input 
                      type="number" 
                      step="0.01"
                      className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkSurface focus:ring-2 focus:ring-blue-500 outline-none"
                      value={currentData.progress || ''}
                      onChange={(e) => handleUpdateProgress(obj.id, e.target.value)}
                      placeholder="e.g., 0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Notes</label>
                    <textarea 
                      className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkSurface focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      rows={2}
                      value={currentData.note || ''}
                      onChange={(e) => handleUpdateNote(obj.id, e.target.value)}
                      placeholder="What did you achieve?"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ObjectivesView;