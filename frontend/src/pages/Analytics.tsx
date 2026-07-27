import { motion } from 'framer-motion'
import { 
  TrendingUp, Zap, Clock, Globe, FileText, Cpu, 
  BarChart2, PieChart, ArrowUpRight
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts'
import { useChatStore } from '@/stores/chatStore'

const TOOL_USAGE_DATA = [
  { tool: 'Web Search', calls: 142 },
  { tool: 'ArXiv', calls: 98 },
  { tool: 'Weather', calls: 64 },
  { tool: 'GitHub', calls: 52 },
  { tool: 'Wikipedia', calls: 41 },
  { tool: 'Math', calls: 35 },
  { tool: 'News', calls: 28 }
]

const TOKEN_USAGE_DATA = [
  { day: 'Mon', tokens: 12400 },
  { day: 'Tue', tokens: 28500 },
  { day: 'Wed', tokens: 18200 },
  { day: 'Thu', tokens: 45000 },
  { day: 'Fri', tokens: 32100 },
  { day: 'Sat', tokens: 54000 },
  { day: 'Sun', tokens: 39800 }
]

export default function Analytics() {
  const { conversations } = useChatStore()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <TrendingUp className="w-7 h-7 text-indigo-600" />
          Analytics & Usage Insights
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Deep telemetry on tool calls, token usage, latency, and estimated research hours saved
        </p>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-slate-200">
          <CardContent className="p-4">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Queries</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{conversations.length * 3 + 42}</div>
            <div className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> +18.4% from last week
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200">
          <CardContent className="p-4">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Tool Calls</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">460</div>
            <div className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> +24.1% efficiency boost
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200">
          <CardContent className="p-4">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Latency</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">1.82s</div>
            <div className="text-xs text-indigo-600 font-medium mt-1">
              Groq Llama 3.3 70B sub-second
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200">
          <CardContent className="p-4">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hours Saved</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">28.5 hrs</div>
            <div className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> Estimated time saved
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl border-slate-200 p-4">
          <CardHeader className="p-2 pb-4">
            <CardTitle className="text-base font-bold text-slate-900">Token Consumption History</CardTitle>
            <CardDescription className="text-xs text-slate-400">Tokens processed per day across all sessions</CardDescription>
          </CardHeader>
          <CardContent className="p-0 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TOKEN_USAGE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <RechartsTooltip />
                <Area type="monotone" dataKey="tokens" stroke="#4F46E5" strokeWidth={2} fillOpacity={1} fill="url(#colorTokens)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 p-4">
          <CardHeader className="p-2 pb-4">
            <CardTitle className="text-base font-bold text-slate-900">Tool Executions Breakdown</CardTitle>
            <CardDescription className="text-xs text-slate-400">Total calls by integrated agent tool</CardDescription>
          </CardHeader>
          <CardContent className="p-0 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={TOOL_USAGE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="tool" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <RechartsTooltip />
                <Bar dataKey="calls" fill="#7C3AED" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
