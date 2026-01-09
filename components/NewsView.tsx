import React, { useState } from 'react';
import { AppState, NewsItem } from '../types';
import { Plus, Tag } from 'lucide-react';
import { generateId } from '../services/dataService';

interface NewsViewProps {
  state: AppState;
  updateState: (newState: Partial<AppState>) => void;
}

const NewsView: React.FC<NewsViewProps> = ({ state, updateState }) => {
  const [newLogText, setNewLogText] = useState('');
  const [newLogTags, setNewLogTags] = useState('');

  const handleAdd = () => {
    if (!newLogText) return;
    const newItem: NewsItem = {
      id: `news_${generateId()}`,
      date: new Date().toISOString().split('T')[0],
      text: newLogText,
      tags: newLogTags.split(',').map(t => t.trim()).filter(t => t)
    };
    updateState({ news: [newItem, ...state.news] });
    setNewLogText('');
    setNewLogTags('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white dark:bg-darkSurface p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h2 className="text-lg font-bold mb-4">Add Log Entry</h2>
        <div className="flex flex-col gap-4">
          <textarea
            className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="What happened today?"
            rows={3}
            value={newLogText}
            onChange={e => setNewLogText(e.target.value)}
          />
          <div className="flex gap-4">
             <input 
                type="text" 
                className="flex-1 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tags (comma separated)..."
                value={newLogTags}
                onChange={e => setNewLogTags(e.target.value)}
             />
             <button 
               onClick={handleAdd}
               className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition flex items-center"
             >
               <Plus size={18} className="mr-2" /> Post
             </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {state.news.map(item => (
          <div key={item.id} className="bg-white dark:bg-darkSurface p-5 rounded-xl border-l-4 border-blue-500 shadow-sm flex gap-4">
             <div className="flex flex-col items-center justify-center min-w-[80px] text-center border-r border-gray-100 dark:border-gray-700 pr-4">
                <span className="text-xs text-gray-500 uppercase">{new Date(item.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                <span className="text-2xl font-bold text-gray-800 dark:text-gray-200">{new Date(item.date).getDate()}</span>
                <span className="text-xs text-gray-400">{new Date(item.date).getFullYear()}</span>
             </div>
             <div className="flex-1">
               <p className="text-gray-800 dark:text-gray-200 text-lg mb-2">{item.text}</p>
               <div className="flex flex-wrap gap-2">
                 {item.tags.map(tag => (
                   <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                     <Tag size={10} className="mr-1" /> {tag}
                   </span>
                 ))}
               </div>
             </div>
          </div>
        ))}
        {state.news.length === 0 && (
          <div className="text-center text-gray-400 py-10">No news entries yet.</div>
        )}
      </div>
    </div>
  );
};

export default NewsView;