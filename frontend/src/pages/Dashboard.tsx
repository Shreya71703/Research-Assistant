import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, FileText, Globe, Clock, ChevronRight, 
  Search, CloudSun, GraduationCap, Calculator,
  Activity, ArrowUpRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';
import { useChatStore } from '@/stores/chatStore';
import { getGreeting, formatRelativeTime } from '@/lib/utils';
import { checkHealth } from '@/lib/api';

const chartData = [
  { name: 'Mon', sessions: 2 },
  { name: 'Tue', sessions: 5 },
  { name: 'Wed', sessions: 3 },
  { name: 'Thu', sessions: 7 },
  { name: 'Fri', sessions: 4 },
  { name: 'Sat', sessions: 8 },
  { name: 'Sun', sessions: 6 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 }
  }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { conversations } = useChatStore();
  const [activeTab, setActiveTab] = useState('Week');
  
  useEffect(() => {
    checkHealth().catch(() => {});
  }, []);

  const recentConversations = conversations.slice(0, 5);

  return (
    <motion.div 
      className="p-8 max-w-7xl mx-auto space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="flex flex-col md:flex-row md:items-center justify-between gap-4" variants={itemVariants}>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{getGreeting()}, Researcher</h1>
          <p className="text-slate-500 mt-1">Here's what's happening with your research today</p>
        </div>
        <Button 
          size="lg" 
          className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          onClick={() => navigate('/research')}
        >
          <Zap className="mr-2 h-5 w-5" />
          New Research
        </Button>
      </motion.div>

      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" variants={itemVariants}>
        {[
          { title: 'Research Sessions', value: conversations.length, icon: Zap, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: '+12%' },
          { title: 'Documents Analyzed', value: '24', icon: FileText, color: 'text-violet-600', bg: 'bg-violet-50', trend: '+8%' },
          { title: 'Sources Found', value: '156', icon: Globe, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+23%' },
          { title: 'Hours Saved', value: '18.5', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', trend: '+15%' },
        ].map((stat, i) => (
          <Card key={i} className="rounded-xl border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none">
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  {stat.trend}
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div className="lg:col-span-2 space-y-8" variants={itemVariants}>
          <Card className="rounded-xl shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <CardTitle className="text-xl">Continue Research</CardTitle>
                <CardDescription>Your recent active sessions</CardDescription>
              </div>
              <Button variant="ghost" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50" onClick={() => navigate('/history')}>
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {recentConversations.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {recentConversations.map((conv) => (
                    <div 
                      key={conv.id} 
                      className="p-4 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between group"
                      onClick={() => navigate(`/research/${conv.id}`)}
                    >
                      <div className="flex-1 min-w-0 pr-4">
                        <h4 className="text-sm font-semibold text-slate-900 truncate">{conv.title || 'Untitled Research'}</h4>
                        <p className="text-sm text-slate-500 truncate mt-1">
                          {conv.messages[conv.messages.length - 1]?.content.substring(0, 80) || 'Started new research session...'}
                        </p>
                      </div>
                      <div className="flex flex-col items-end shrink-0 gap-2">
                        <span className="text-xs text-slate-400">{formatRelativeTime(conv.updatedAt)}</span>
                        <Badge variant="outline" className="bg-white text-xs font-normal shadow-sm group-hover:bg-slate-50">Active</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center flex flex-col items-center justify-center">
                  <div className="h-16 w-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                    <Search className="h-8 w-8 text-indigo-300" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900">No recent research</h3>
                  <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">Start your first research session to see it here.</p>
                  <Button className="mt-6 bg-indigo-600 hover:bg-indigo-700" onClick={() => navigate('/research')}>
                    Start Research
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <CardTitle className="text-xl">Research Activity</CardTitle>
                <CardDescription>Sessions over time</CardDescription>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                {['Week', 'Month', 'Year'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                      activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-6 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="sessions" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorSessions)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div className="space-y-8" variants={itemVariants}>
          <Card className="rounded-xl shadow-sm border-slate-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Search, label: 'Search web', bg: 'bg-indigo-50', color: 'text-indigo-600', hover: 'hover:bg-indigo-100', border: 'border-indigo-100' },
                  { icon: CloudSun, label: 'Weather', bg: 'bg-sky-50', color: 'text-sky-600', hover: 'hover:bg-sky-100', border: 'border-sky-100' },
                  { icon: GraduationCap, label: 'Papers', bg: 'bg-violet-50', color: 'text-violet-600', hover: 'hover:bg-violet-100', border: 'border-violet-100' },
                  { icon: Calculator, label: 'Calculate', bg: 'bg-emerald-50', color: 'text-emerald-600', hover: 'hover:bg-emerald-100', border: 'border-emerald-100' },
                ].map((action, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/research')}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border ${action.border} ${action.bg} ${action.hover} transition-colors gap-3`}
                  >
                    <div className={`p-2 bg-white rounded-full shadow-sm ${action.color}`}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-medium text-slate-700">{action.label}</span>
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm border-slate-200">
            <CardHeader className="pb-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Platform Status</CardTitle>
                <Activity className="h-5 w-5 text-slate-400" />
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {[
                { label: 'API Services', status: 'operational' },
                { label: 'LLM Engine', status: 'operational' },
                { label: 'Search Index', status: 'operational' },
                { label: 'Agent Tools', status: 'operational' }
              ].map((service, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">{service.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-medium text-slate-500 capitalize">{service.status}</span>
                  </div>
                </div>
              ))}
              
              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Model</span>
                  <span className="font-medium text-slate-700">Groq Llama 3.3 70B</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Agent</span>
                  <span className="font-medium text-slate-700">LangGraph Agent v1.0</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
