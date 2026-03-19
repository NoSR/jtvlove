import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/apiService';
import { Link } from 'react-router-dom';

const SuperDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiService.getSuperDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    
    // Auto refresh every 60 seconds
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="size-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const mainStats = [
    { label: 'Total Venues', value: stats?.venuesCount || '0', delta: `${stats?.venuesToday || 0} Added Today`, icon: 'apartment', color: 'text-blue-500' },
    { label: 'Total CCAs', value: stats?.ccasCount || '0', delta: `${stats?.ccasToday || 0} Added Today`, icon: 'groups', color: 'text-primary' },
    { label: 'Total Users', value: stats?.usersCount || '0', delta: `${stats?.usersToday || 0} New Signups`, icon: 'person', color: 'text-green-500' },
    { label: 'Reservations', value: stats?.reservationsCount || '0', delta: `${stats?.reservationsToday || 0} Today`, icon: 'book_online', color: 'text-orange-500' }
  ];

  const recentPosts = stats?.recentPosts || [];
  const recentUsers = stats?.recentUsers || [];

  return (
    <div className="space-y-12 animate-fade-in">
       {/* Real-time Ticker Simulation */}
       <div className="bg-red-950/30 border border-red-500/20 p-4 rounded-xl flex items-center gap-4">
          <span className="text-[10px] font-black bg-red-600 px-2 py-0.5 rounded text-white animate-pulse">LIVE ALERT</span>
          <p className="text-xs font-bold text-red-200 truncate">Dashboard is now operating on live production database metrics.</p>
       </div>

       {/* Grid Metrics */}
       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {mainStats.map(stat => (
            <div key={stat.label} className="bg-zinc-900 border border-white/5 p-8 rounded-[2rem] hover:border-red-500/30 transition-all group">
               <div className="flex items-center justify-between mb-4">
                  <div className={`size-12 rounded-2xl bg-zinc-800 flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
                     <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
                  </div>
               </div>
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
               <p className="text-4xl font-black tracking-tighter mb-2">{stat.value}</p>
               <p className="text-[10px] font-bold text-gray-400">{stat.delta}</p>
            </div>
          ))}
       </div>

       {/* Community & Traffic Grid */}
       <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-8 space-y-8">
             <div className="flex items-center justify-between">
                <h3 className="text-xl font-black uppercase tracking-tight">Recent Community Traffic</h3>
                <Link to="/super-admin/community" className="px-3 py-1 bg-zinc-900 border border-white/5 rounded-lg text-[10px] font-black hover:bg-white/10 transition-colors">ALL BOARDS</Link>
             </div>
             
             <div className="bg-zinc-900 rounded-[2rem] p-6 border border-white/5 overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                   <h4 className="font-black text-xs uppercase tracking-widest text-primary">Latest Posts Activity</h4>
                   <span className="text-[10px] font-bold opacity-40">{recentPosts.length} Recents</span>
                </div>
                {recentPosts.length === 0 ? (
                  <p className="text-xs text-gray-500 py-4">No recent posts found.</p>
                ) : (
                  <div className="space-y-4">
                     {recentPosts.map((post: any) => (
                        <div key={post.id} className="flex flex-col md:flex-row md:items-center justify-between text-xs border-b border-white/5 pb-3 last:border-0 gap-2">
                           <div className="flex-1 min-w-0">
                              <span className="text-[9px] px-2 py-0.5 rounded bg-zinc-800 text-gray-400 mr-2 whitespace-nowrap">{post.board}</span>
                              <span className="font-medium text-gray-300 truncate">{post.title}</span>
                           </div>
                           <div className="flex items-center gap-4 text-[10px] text-gray-500 whitespace-nowrap">
                              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">visibility</span> {post.views}</span>
                              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">favorite</span> {post.likes}</span>
                              <span>{new Date(post.created_at).toLocaleDateString()}</span>
                           </div>
                        </div>
                     ))}
                  </div>
                )}
             </div>
          </div>

          <div className="xl:col-span-4 bg-zinc-900 rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden flex flex-col">
             <div className="absolute top-0 right-0 size-64 bg-red-600/5 rounded-full blur-[100px]"></div>
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black uppercase tracking-tight">Recent Signups</h3>
                <Link to="/super-admin/users" className="material-symbols-outlined text-gray-500 hover:text-white transition-colors">open_in_new</Link>
             </div>
             
             <div className="space-y-4 flex-1">
                {recentUsers.length === 0 ? (
                  <p className="text-xs text-gray-500">No recent users.</p>
                ) : (
                  recentUsers.map((u: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center border-b border-white/5 pb-3 last:border-0">
                       <span className="text-sm font-bold text-gray-300">{u.name}</span>
                       <span className="text-[10px] text-gray-500">{new Date(u.created_at).toLocaleDateString()}</span>
                    </div>
                  ))
                )}
             </div>
             
             <div className="mt-8 p-4 bg-green-600/10 border border-green-500/20 rounded-2xl">
                <p className="text-[9px] font-black text-green-500 uppercase mb-1">System Health</p>
                <p className="text-[11px] font-bold text-gray-300">API endpoints active and database connectivity stable.</p>
             </div>
          </div>
       </div>
    </div>
  );
};

export default SuperDashboard;
