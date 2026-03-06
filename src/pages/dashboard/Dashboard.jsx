import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Briefcase,
  Users,
  Truck,
  Building2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ShieldAlert,
  Megaphone,
  ClipboardList,
  Landmark,
  Receipt,
  CalendarCheck,
  CalendarX,
  UserCheck,
  UserMinus,
  UserX,
  Hourglass,
  BellRing,
  Cog,
  HardHat,
  Hammer,
  CircleDollarSign,
  ArrowUpRight,
  PackageCheck,
  Send,
  FileCheck,
  Layers,
  TrendingUp,
  CalendarClock,
  Fingerprint,
  TreePalm,
  Timer,
  ArrowRight,
} from "lucide-react";
import { TbCalendarDue } from "react-icons/tb";
import { LuClipboardList } from "react-icons/lu";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import Title from "../../components/Title";
import Button from "../../components/Button";
import Loader from "../../components/Loader";
import ViewWorkOrderDashboard from "./ViewWorkOrderDashboard";
import { useDashboard } from "./hooks/useDashboard";
import { useAuth } from "../../context/AuthContext";
import { formatDistanceToNow, differenceInDays, format } from "date-fns";

// --- Helpers ---
const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const formatCompact = (value) => {
  if (!value) return "0";
  if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toString();
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
};

// --- Reusable UI ---

const GlassCard = ({ children, className = "", hover = true }) => (
  <div
    className={`relative bg-white dark:bg-layout-dark rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-sm ${
      hover ? "hover:shadow-lg hover:-translate-y-0.5" : ""
    } transition-all duration-300 overflow-hidden ${className}`}
  >
    {children}
  </div>
);

const SectionHeader = ({ title, icon: Icon, badge, action }) => (
  <div className="flex items-center justify-between mb-5">
    <div className="flex items-center gap-3">
      {Icon && (
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 flex items-center justify-center border border-gray-100 dark:border-gray-700/50">
          <Icon className="size-4 text-gray-500 dark:text-gray-400" />
        </div>
      )}
      <h3 className="text-sm font-bold dark:text-white text-gray-800 tracking-tight">
        {title}
      </h3>
      {badge}
    </div>
    {action}
  </div>
);

const Badge = ({ children, variant = "default" }) => {
  const styles = {
    default: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    primary: "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
    success: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
    warning: "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
    danger: "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400",
    violet: "bg-violet-50 text-violet-600 dark:bg-violet-950/30 dark:text-violet-400",
    orange: "bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400",
    indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400",
    teal: "bg-teal-50 text-teal-600 dark:bg-teal-950/30 dark:text-teal-400",
  };
  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${styles[variant]}`}>
      {children}
    </span>
  );
};

const MiniDonut = ({ data, colors, centerLabel, size = 130 }) => (
  <div className="relative" style={{ width: size, height: size }}>
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius="58%"
          outerRadius="82%"
          paddingAngle={3}
          cornerRadius={6}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} stroke="none" />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            borderRadius: "12px",
            border: "none",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            fontSize: "12px",
            padding: "8px 12px",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
    {centerLabel && (
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-base font-bold dark:text-white text-gray-800">
          {centerLabel}
        </span>
      </div>
    )}
  </div>
);

const ProgressBar = ({ value, max, color = "#3b82f6", height = "h-2" }) => {
  const pct = max ? Math.min(Math.round((value / max) * 100), 100) : 0;
  return (
    <div className={`${height} rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden`}>
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
};

const EmptyState = ({ icon, message }) => {
  const IconComp = icon;
  return (
    <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-gray-500">
      <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-3">
        <IconComp className="size-6 opacity-40" />
      </div>
      <p className="text-xs font-medium">{message}</p>
    </div>
  );
};

// --- Section Components ---

const WelcomeHeader = ({ user, data }) => {
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const userName = user?.name?.split(" ")[0] || "User";

  const quickStats = [];
  if (data?.overview) {
    quickStats.push(
      { label: "Tenders", val: data.overview.tenders, icon: FileText },
      { label: "Projects", val: data.overview.projects, icon: Briefcase },
      { label: "Employees", val: data.overview.activeEmployees, icon: Users }
    );
  }

  // My work profile quick info
  const myProfile = data?.myWorkProfile;
  const attendanceStatus = myProfile?.todayAttendance?.status;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-darkest-blue via-[#3d5a8a] to-[#2a4470] p-6 text-white">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute -left-10 -bottom-10 w-60 h-60 rounded-full bg-blue-400/20 blur-3xl" />
      </div>
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <p className="text-blue-200/80 text-xs font-medium tracking-wide uppercase">
            {formattedDate}
          </p>
          <h1 className="text-2xl font-bold mt-1 tracking-tight">
            {getGreeting()}, {userName}
          </h1>
          <p className="text-blue-200/60 text-sm mt-1">
            Here's what's happening across your projects today
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          {quickStats.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/10"
            >
              <item.icon className="size-4 text-blue-200" />
              <div>
                <p className="text-lg font-bold leading-none tabular-nums">
                  {item.val}
                </p>
                <p className="text-[10px] text-blue-200/70 mt-0.5">
                  {item.label}
                </p>
              </div>
            </div>
          ))}
          {attendanceStatus && (
            <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/10">
              <Fingerprint className="size-4 text-blue-200" />
              <div>
                <p className="text-sm font-bold leading-none">
                  {attendanceStatus}
                </p>
                <p className="text-[10px] text-blue-200/70 mt-0.5">
                  My Status
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const OverviewSection = ({ data }) => {
  const cards = [
    {
      label: "Total Tenders",
      value: data.tenders,
      icon: FileText,
      gradient: "from-blue-500 to-blue-600",
      text: "text-blue-600 dark:text-blue-400",
      shadow: "shadow-blue-100 dark:shadow-blue-900/10",
    },
    {
      label: "Active Projects",
      value: data.projects,
      icon: Briefcase,
      gradient: "from-emerald-500 to-teal-500",
      text: "text-emerald-600 dark:text-emerald-400",
      shadow: "shadow-emerald-100 dark:shadow-emerald-900/10",
    },
    {
      label: "Active Employees",
      value: data.activeEmployees,
      icon: Users,
      gradient: "from-violet-500 to-purple-600",
      text: "text-violet-600 dark:text-violet-400",
      shadow: "shadow-violet-100 dark:shadow-violet-900/10",
    },
    {
      label: "Vendors",
      value: data.vendors,
      icon: Truck,
      gradient: "from-orange-400 to-orange-500",
      text: "text-orange-600 dark:text-orange-400",
      shadow: "shadow-orange-100 dark:shadow-orange-900/10",
    },
    {
      label: "Clients",
      value: data.clients,
      icon: Building2,
      gradient: "from-cyan-500 to-cyan-600",
      text: "text-cyan-600 dark:text-cyan-400",
      shadow: "shadow-cyan-100 dark:shadow-cyan-900/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((c) => (
        <GlassCard key={c.label} className={`p-5 ${c.shadow}`}>
          <div className="flex items-center justify-between">
            <div
              className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center text-white shadow-lg`}
            >
              <c.icon className="size-5" />
            </div>
            <TrendingUp className={`size-4 ${c.text} opacity-50`} />
          </div>
          <h2 className="text-2xl font-bold dark:text-white text-gray-800 tabular-nums mt-4">
            {c.value}
          </h2>
          <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 mt-1">
            {c.label}
          </p>
        </GlassCard>
      ))}
    </div>
  );
};

const MyWorkProfileSection = ({ data, navigate }) => {
  const { todayAttendance, leaveBalance, recentLeaveApplications } = data;

  const statusColor = {
    Present: "#10b981",
    Absent: "#ef4444",
    "Half Day": "#f97316",
    "On Leave": "#3b82f6",
    "Not Punched": "#94a3b8",
    Late: "#eab308",
  };
  const color = statusColor[todayAttendance?.status] || "#94a3b8";

  const leaveEntries = Object.entries(leaveBalance || {}).filter(
    ([key]) => key !== "compOff"
  );
  const compOffCount = leaveBalance?.compOff?.length || 0;

  return (
    <GlassCard hover={false} className="p-5">
      <SectionHeader
        title="My Work Profile"
        icon={Fingerprint}
        action={
          <button
            onClick={() => navigate("/dashboard/profile")}
            className="text-[11px] font-semibold text-blue-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
          >
            View Profile <ArrowRight className="size-3" />
          </button>
        }
      />
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Today's Status */}
        <div className="flex-1 p-4 rounded-xl bg-gray-50/80 dark:bg-gray-800/30 border border-gray-100/80 dark:border-gray-700/30">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
            Today's Status
          </p>
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
              style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
            >
              <Fingerprint className="size-5" />
            </div>
            <div>
              <p className="text-lg font-bold dark:text-white">
                {todayAttendance?.status || "Unknown"}
              </p>
              <p className="text-[10px] text-gray-400">
                {todayAttendance?.punchIn
                  ? `Punched in at ${todayAttendance.punchIn}`
                  : "No punch recorded yet"}
              </p>
            </div>
          </div>
        </div>

        {/* Leave Balance */}
        <div className="flex-1 p-4 rounded-xl bg-gray-50/80 dark:bg-gray-800/30 border border-gray-100/80 dark:border-gray-700/30">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
            Leave Balance
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            {leaveEntries.map(([type, balance]) => (
              <div key={type} className="text-center">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-1">
                  <span className="text-base font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                    {balance}
                  </span>
                </div>
                <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                  {type}
                </p>
              </div>
            ))}
            {compOffCount > 0 && (
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center mx-auto mb-1">
                  <span className="text-base font-bold text-violet-600 dark:text-violet-400 tabular-nums">
                    {compOffCount}
                  </span>
                </div>
                <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                  Comp Off
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Leave Applications */}
      {recentLeaveApplications?.length > 0 && (
        <div className="mt-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
            Recent Applications
          </p>
          <div className="space-y-1">
            {recentLeaveApplications.slice(0, 3).map((leave, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <TreePalm className="size-3.5 text-emerald-500" />
                  <span className="text-xs font-medium dark:text-white">
                    {leave.leaveType} - {leave.totalDays} day
                    {leave.totalDays > 1 ? "s" : ""}
                  </span>
                </div>
                <Badge
                  variant={
                    leave.status === "Approved"
                      ? "success"
                      : leave.status === "Rejected"
                      ? "danger"
                      : "warning"
                  }
                >
                  {leave.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  );
};

const UpcomingDeadlinesSection = ({ data }) => {
  if (!data?.upcoming?.length) return null;

  return (
    <GlassCard hover={false} className="p-5">
      <SectionHeader
        title="Upcoming Deadlines"
        icon={CalendarClock}
        badge={<Badge variant="danger">{data.count} upcoming</Badge>}
      />
      <div className="space-y-1">
        {data.upcoming.slice(0, 5).map((item) => {
          const endDate = new Date(item.tender_end_date);
          const daysLeft = differenceInDays(endDate, new Date());
          const isUrgent = daysLeft <= 3;
          const isPast = daysLeft < 0;

          return (
            <div
              key={item._id}
              className="flex items-center gap-3 py-3 px-3 -mx-1 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 ${
                  isPast
                    ? "bg-gradient-to-br from-red-500 to-rose-600"
                    : isUrgent
                    ? "bg-gradient-to-br from-amber-400 to-orange-500"
                    : "bg-gradient-to-br from-blue-500 to-blue-600"
                }`}
              >
                <Timer className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold dark:text-white text-gray-800 truncate">
                  {item.tender_name}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {item.tender_project_name} &middot; {item.client_name} &middot;{" "}
                  {formatCompact(item.tender_value)}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] text-gray-400 tabular-nums">
                  {format(endDate, "dd MMM yyyy")}
                </p>
                <span
                  className={`text-[10px] font-bold ${
                    isPast
                      ? "text-red-500"
                      : isUrgent
                      ? "text-amber-500"
                      : "text-blue-500"
                  }`}
                >
                  {isPast
                    ? `${Math.abs(daysLeft)}d overdue`
                    : daysLeft === 0
                    ? "Due today"
                    : `${daysLeft}d left`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
};

const AttendanceSection = ({ data }) => {
  const segments = [
    { name: "Present", value: data.present, color: "#10b981", icon: CalendarCheck },
    { name: "Absent", value: data.absent, color: "#ef4444", icon: CalendarX },
    { name: "Half Day", value: data.halfDay, color: "#f97316", icon: Hourglass },
    { name: "On Leave", value: data.onLeave, color: "#3b82f6", icon: Briefcase },
    { name: "Not Punched", value: data.notYetPunched, color: "#94a3b8", icon: Clock },
  ];
  const colors = segments.map((s) => s.color);
  const pieData = segments.map(({ name, value }) => ({ name, value }));
  const pct = data.totalActive
    ? Math.round((data.present / data.totalActive) * 100)
    : 0;

  return (
    <GlassCard hover={false} className="p-5">
      <SectionHeader
        title="Today's Attendance"
        icon={UserCheck}
        badge={
          data.late > 0 ? (
            <Badge variant="warning">
              <span className="flex items-center gap-1">
                <Clock className="size-2.5" />
                {data.late} late
              </span>
            </Badge>
          ) : null
        }
      />
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <MiniDonut
            data={pieData}
            colors={colors}
            centerLabel={`${pct}%`}
            size={155}
          />
          <p className="text-center text-[10px] text-gray-400 mt-1 tabular-nums">
            {data.present}/{data.totalActive} present
          </p>
        </div>
        <div className="flex-1 space-y-2.5">
          {segments.map((s) => {
            const Icon = s.icon;
            const barPct = data.totalActive
              ? (s.value / data.totalActive) * 100
              : 0;
            return (
              <div key={s.name}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${s.color}12` }}
                    >
                      <Icon className="size-3" style={{ color: s.color }} />
                    </div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {s.name}
                    </span>
                  </div>
                  <span className="text-xs font-bold dark:text-white text-gray-700 tabular-nums">
                    {s.value}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${barPct}%`, backgroundColor: s.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
};

const PendingLeavesSection = ({ data }) => (
  <GlassCard hover={false} className="p-5">
    <SectionHeader
      title="Pending Leaves"
      icon={CalendarX}
      badge={
        data.pendingCount > 0 ? (
          <Badge variant="warning">{data.pendingCount} pending</Badge>
        ) : null
      }
    />
    {!data.requests?.length ? (
      <EmptyState icon={CalendarCheck} message="All caught up! No pending requests" />
    ) : (
      <div className="space-y-1">
        {data.requests.slice(0, 5).map((r, i) => (
          <div
            key={i}
            className="flex items-center gap-3 py-3 px-3 -mx-1 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-sm">
              {r.employeeId?.name?.[0] || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold dark:text-white text-gray-800 truncate">
                {r.employeeId?.name}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-semibold">
                  {r.leaveType}
                </span>
                {r.employeeId?.department}
                <span className="text-gray-300 dark:text-gray-600">|</span>
                {r.totalDays} day{r.totalDays > 1 ? "s" : ""}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] text-gray-400 tabular-nums font-medium">
                {new Date(r.fromDate).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                })}
              </p>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500">
                <Clock className="size-2.5" />
                Pending
              </span>
            </div>
          </div>
        ))}
      </div>
    )}
  </GlassCard>
);

const TenderPipelineSection = ({ data }) => {
  const { counts, recentTenders } = data;
  const pieData = [
    { name: "Pending", value: counts.pending },
    { name: "Approved", value: counts.approved },
    { name: "With Work Order", value: counts.withWorkOrder },
  ];
  const pieColors = ["#f59e0b", "#22c55e", "#3b82f6"];

  return (
    <GlassCard hover={false} className="p-5">
      <SectionHeader
        title="Tender Pipeline"
        icon={FileText}
        badge={<Badge variant="primary">{counts.total} total</Badge>}
      />
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex items-start gap-3">
          <MiniDonut
            data={pieData}
            colors={pieColors}
            centerLabel={counts.total}
            size={145}
          />
          <div className="space-y-3 pt-2">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: pieColors[i] }}
                />
                <div>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    {d.name}
                  </span>
                  <p className="text-sm font-bold dark:text-white tabular-nums leading-tight">
                    {d.value}
                  </p>
                </div>
              </div>
            ))}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-3 space-y-1.5">
              <div className="flex items-center gap-2 text-[11px]">
                <CircleDollarSign className="size-3 text-gray-400" />
                <span className="text-gray-400">Total:</span>
                <span className="font-bold dark:text-white text-gray-700">
                  {formatCurrency(counts.totalValue)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <FileCheck className="size-3 text-gray-400" />
                <span className="text-gray-400">Agreement:</span>
                <span className="font-bold dark:text-white text-gray-700">
                  {formatCurrency(counts.totalAgreementValue)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 border-l-0 lg:border-l border-gray-100 dark:border-gray-800 lg:pl-6">
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
            Recent Tenders
          </p>
          <div className="space-y-1">
            {recentTenders?.slice(0, 4).map((t) => (
              <div
                key={t._id || t.tender_id}
                className="flex items-center justify-between py-2.5 px-3 -mx-1 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <FileText className="size-4 text-blue-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold dark:text-white text-gray-800 truncate">
                      {t.tender_name}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {t.client_name} &middot; {formatCompact(t.tender_value)}
                    </p>
                  </div>
                </div>
                <span
                  className={`shrink-0 ml-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                    t.tender_status === "PENDING"
                      ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                      : "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                  }`}
                >
                  {t.tender_status === "PENDING" ? (
                    <Clock className="size-2.5" />
                  ) : (
                    <CheckCircle2 className="size-2.5" />
                  )}
                  {t.tender_status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

const PipelineSection = ({
  title,
  icon,
  counts,
  recentRaised,
  stages,
  colors,
  badgeVariant = "primary",
}) => {
  const total = stages.reduce((s, st) => s + st.value, 0) || 1;

  return (
    <GlassCard hover={false} className="p-5">
      <SectionHeader
        title={title}
        icon={icon}
        badge={<Badge variant={badgeVariant}>{counts.total} total</Badge>}
      />
      {/* Pipeline bar */}
      <div className="flex rounded-xl overflow-hidden h-4 bg-gray-100 dark:bg-gray-800 mb-4">
        {stages.map((stage, i) =>
          stage.value > 0 ? (
            <div
              key={i}
              className="transition-all duration-700 relative group"
              style={{
                width: `${(stage.value / total) * 100}%`,
                backgroundColor: colors[i],
              }}
              title={`${stage.label}: ${stage.value}`}
            >
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/20 transition-colors" />
            </div>
          ) : null
        )}
      </div>
      {/* Stage cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        {stages.map((stage, i) => {
          const Icon = stage.icon;
          return (
            <div
              key={i}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gray-50/80 dark:bg-gray-800/30 border border-gray-100/80 dark:border-gray-700/30"
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${colors[i]}15` }}
              >
                {Icon ? (
                  <Icon className="size-3.5" style={{ color: colors[i] }} />
                ) : (
                  <div
                    className="size-3 rounded"
                    style={{ backgroundColor: colors[i] }}
                  />
                )}
              </div>
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium leading-tight">
                  {stage.label}
                </p>
                <p className="text-sm font-bold dark:text-white tabular-nums leading-tight">
                  {stage.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      {/* Recent Raised */}
      {recentRaised?.length > 0 && (
        <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">
            Recently Raised
          </p>
          <div className="space-y-1">
            {recentRaised.slice(0, 3).map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between py-2 px-3 -mx-1 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                    <Send className="size-3 text-blue-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold dark:text-white truncate">
                      {item.requestId} - {item.title}
                    </p>
                    <p className="text-[10px] text-gray-400 truncate">
                      {item.tender_project_name || `Project ${item.projectId}`}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-gray-400 tabular-nums shrink-0 ml-2">
                  {new Date(item.requestDate).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  );
};

const PurchaseSection = ({ data }) => {
  const c = data.counts;
  const stages = [
    { label: "Raised", value: c.requestRaised, icon: Send },
    { label: "Quotation Req.", value: c.quotationRequested, icon: FileText },
    { label: "Quotation Rcvd.", value: c.quotationReceived, icon: FileCheck },
    { label: "Vendor Approved", value: c.vendorApproved, icon: PackageCheck },
    { label: "PO Issued", value: c.purchaseOrderIssued, icon: ClipboardList },
    { label: "Completed", value: c.completed, icon: CheckCircle2 },
  ];
  const colors = ["#3b82f6", "#6366f1", "#eab308", "#f97316", "#22c55e", "#94a3b8"];
  return (
    <PipelineSection
      title="Purchase Pipeline"
      icon={ClipboardList}
      counts={c}
      recentRaised={data.recentRaised}

      stages={stages}
      colors={colors}
      badgeVariant="primary"
    />
  );
};

const WorkOrderSection = ({ data }) => {
  const c = data.counts;
  const stages = [
    { label: "Raised", value: c.requestRaised, icon: Send },
    { label: "Quotation Rcvd.", value: c.quotationReceived, icon: FileCheck },
    { label: "Vendor Approved", value: c.vendorApproved, icon: PackageCheck },
    { label: "WO Issued", value: c.workOrderIssued, icon: Hammer },
    { label: "Completed", value: c.completed, icon: CheckCircle2 },
  ];
  const colors = ["#3b82f6", "#eab308", "#f97316", "#22c55e", "#94a3b8"];
  return (
    <PipelineSection
      title="Work Orders"
      icon={Hammer}
      counts={c}
      recentRaised={data.recentRaised}

      stages={stages}
      colors={colors}
      badgeVariant="indigo"
    />
  );
};

const EmdSection = ({ data }) => {
  const groups = [
    {
      label: "EMD",
      icon: Landmark,
      collected: data.totalCollected,
      pending: data.totalPending,
      total: data.totalApprovedAmount,
      color: "#10b981",
    },
    {
      label: "Security Deposit",
      icon: ShieldAlert,
      collected: data.sdCollected,
      pending: data.sdPending,
      total: data.sdTotalAmount,
      color: "#3b82f6",
    },
  ];

  return (
    <GlassCard hover={false} className="p-5">
      <SectionHeader
        title="EMD & Security Deposit"
        icon={Landmark}
        badge={<Badge variant="success">{data.count} tenders</Badge>}
      />
      <div className="space-y-4">
        {groups.map((g) => {
          const pct = g.total ? Math.round((g.collected / g.total) * 100) : 0;
          const Icon = g.icon;
          return (
            <div
              key={g.label}
              className="p-4 rounded-xl bg-gray-50/80 dark:bg-gray-800/30 border border-gray-100/80 dark:border-gray-700/30"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${g.color}12` }}
                  >
                    <Icon className="size-4" style={{ color: g.color }} />
                  </div>
                  <span className="text-xs font-bold dark:text-white text-gray-700">
                    {g.label}
                  </span>
                </div>
                <span
                  className="text-xs font-bold tabular-nums"
                  style={{ color: g.color }}
                >
                  {pct}%
                </span>
              </div>
              <ProgressBar
                value={g.collected}
                max={g.total}
                color={g.color}
                height="h-2.5"
              />
              <div className="flex justify-between mt-2.5 text-[11px]">
                <span className="text-gray-400 font-medium">
                  Collected:{" "}
                  <span className="font-bold dark:text-white text-gray-700">
                    {formatCurrency(g.collected)}
                  </span>
                </span>
                <span className="text-rose-400 font-medium">
                  Pending: {formatCurrency(g.pending)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
};

const PenaltySection = ({ data }) => (
  <GlassCard hover={false} className="p-5">
    <SectionHeader
      title="Penalties"
      icon={AlertTriangle}
      badge={
        <Badge variant="danger">
          {data.tendersWithPenalties} tender
          {data.tendersWithPenalties > 1 ? "s" : ""}
        </Badge>
      }
    />
    <div className="rounded-xl bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950/20 dark:to-red-950/20 border border-rose-200/60 dark:border-rose-900/30 p-5 mb-4">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-rose-200/50 dark:shadow-rose-900/30 shrink-0">
          <AlertTriangle className="size-6" />
        </div>
        <div>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 tabular-nums tracking-tight">
            {formatCurrency(data.totalPenaltyValue)}
          </p>
          <p className="text-xs text-rose-500/70 font-medium mt-0.5">
            Total penalty across all projects
          </p>
        </div>
      </div>
    </div>
    {/* Penalty by project breakdown */}
    {data.byProject?.length > 0 && (
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
          By Project
        </p>
        <div className="space-y-1">
          {data.byProject.slice(0, 5).map((p) => (
            <div
              key={p._id}
              className="flex items-center justify-between py-2 px-3 -mx-1 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold dark:text-white truncate">
                  {p.tenderName}
                </p>
                <p className="text-[10px] text-gray-400 truncate">
                  {p.projectName || p._id}
                </p>
              </div>
              <span className="text-xs font-bold text-rose-500 tabular-nums shrink-0 ml-2">
                {formatCurrency(p.penaltyValue)}
              </span>
            </div>
          ))}
        </div>
      </div>
    )}
  </GlassCard>
);

const BillingSection = ({ data }) => {
  const pieData = [
    { name: "Draft", value: data.draft },
    { name: "Submitted", value: data.submitted },
    { name: "Approved", value: data.approved },
    { name: "Paid", value: data.paid },
  ];
  const colors = ["#94a3b8", "#3b82f6", "#f59e0b", "#22c55e"];
  const icons = [FileText, Send, CheckCircle2, CircleDollarSign];

  return (
    <GlassCard hover={false} className="p-5">
      <SectionHeader
        title="Client Billing"
        icon={Receipt}
        badge={<Badge variant="success">{data.billCount} bills</Badge>}
      />
      <div className="flex items-center gap-4">
        <MiniDonut
          data={pieData}
          colors={colors}
          centerLabel={data.billCount}
        />
        <div className="flex-1">
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            Total Billed
          </p>
          <p className="text-xl font-bold dark:text-white tabular-nums mt-1 tracking-tight">
            {formatCurrency(data.totalBilled)}
          </p>
          <div className="grid grid-cols-2 gap-2.5 mt-4">
            {pieData.map((d, i) => {
              const Icon = icons[i];
              return (
                <div
                  key={d.name}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-gray-50/80 dark:bg-gray-800/30 border border-gray-100/50 dark:border-gray-700/30"
                >
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${colors[i]}12` }}
                  >
                    <Icon className="size-3" style={{ color: colors[i] }} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 leading-tight">
                      {d.name}
                    </p>
                    <p className="text-xs font-bold dark:text-white tabular-nums leading-tight">
                      {d.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* Billing by project */}
      {data.byProject?.length > 0 && (
        <div className="mt-4 border-t border-gray-100 dark:border-gray-800 pt-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
            By Project
          </p>
          <div className="space-y-1">
            {data.byProject.slice(0, 3).map((p) => (
              <div
                key={p.tenderId}
                className="flex items-center justify-between py-2 px-3 -mx-1 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold dark:text-white truncate">
                    {p.tenderName}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {p.billCount} bills &middot; {p.draft} draft
                    {p.paid > 0 ? ` &middot; ${p.paid} paid` : ""}
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-500 tabular-nums shrink-0 ml-2">
                  {formatCompact(p.totalBilled)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  );
};

const EmployeesSection = ({ data }) => {
  const deptData = Object.entries(data.byDepartment)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const statusCards = [
    { label: "Active", value: data.byStatus.Active || 0, icon: UserCheck, color: "#10b981" },
    { label: "Inactive", value: data.byStatus.Inactive || 0, icon: UserMinus, color: "#94a3b8" },
    { label: "Suspended", value: data.byStatus.Suspended || 0, icon: UserX, color: "#ef4444" },
  ];

  return (
    <GlassCard hover={false} className="p-5">
      <SectionHeader
        title="Employees"
        icon={Users}
        badge={<Badge variant="violet">{data.total} total</Badge>}
      />
      <div className="flex flex-wrap gap-3 mb-5">
        {statusCards.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50/80 dark:bg-gray-800/30 border border-gray-100/80 dark:border-gray-700/30"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                style={{
                  background: `linear-gradient(135deg, ${s.color}, ${s.color}dd)`,
                }}
              >
                <Icon className="size-4" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                  {s.label}
                </p>
                <p className="text-lg font-bold dark:text-white tabular-nums leading-tight">
                  {s.value}
                </p>
              </div>
            </div>
          );
        })}
        <div className="flex items-center gap-4 px-4 py-3 rounded-xl bg-gray-50/80 dark:bg-gray-800/30 border border-gray-100/80 dark:border-gray-700/30 ml-auto">
          <div className="flex items-center gap-2 text-xs">
            <HardHat className="size-4 text-orange-500" />
            <span className="text-gray-400">Site</span>
            <span className="font-bold dark:text-white tabular-nums">
              {data.byUserType?.Site || 0}
            </span>
          </div>
          <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" />
          <div className="flex items-center gap-2 text-xs">
            <Briefcase className="size-4 text-blue-500" />
            <span className="text-gray-400">Office</span>
            <span className="font-bold dark:text-white tabular-nums">
              {data.byUserType?.Office || 0}
            </span>
          </div>
        </div>
      </div>
      <div className="rounded-xl bg-gray-50/50 dark:bg-gray-800/20 border border-gray-100/50 dark:border-gray-700/20 p-4">
        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
          By Department
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={deptData}
            layout="vertical"
            margin={{ left: 0, right: 10 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              stroke="#e5e7eb20"
            />
            <XAxis type="number" tick={{ fontSize: 10 }} />
            <YAxis
              dataKey="name"
              type="category"
              width={85}
              tick={{ fontSize: 10, fontWeight: 600 }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                fontSize: "12px",
              }}
            />
            <Bar
              dataKey="value"
              fill="#6366f1"
              radius={[0, 8, 8, 0]}
              barSize={16}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
};

const SiteWorkDoneSection = ({ data }) => {
  const statuses = [
    { label: "Draft", value: data.draft, icon: FileText, color: "#94a3b8" },
    { label: "Submitted", value: data.submitted, icon: Send, color: "#3b82f6" },
    { label: "Approved", value: data.approved, icon: CheckCircle2, color: "#10b981" },
    { label: "Rejected", value: data.rejected, icon: XCircle, color: "#ef4444" },
  ];

  return (
    <GlassCard hover={false} className="p-5">
      <SectionHeader
        title="Site Work Done"
        icon={Layers}
        badge={<Badge variant="teal">{data.total} total</Badge>}
      />
      <div className="grid grid-cols-2 gap-3">
        {statuses.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gray-50/80 dark:bg-gray-800/30 border border-gray-100/80 dark:border-gray-700/30 group hover:shadow-sm transition-all"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform"
                style={{
                  background: `linear-gradient(135deg, ${s.color}, ${s.color}cc)`,
                }}
              >
                <Icon className="size-4" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                  {s.label}
                </p>
                <p className="text-xl font-bold dark:text-white tabular-nums leading-tight">
                  {s.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
};

const MachinerySection = ({ data }) => {
  const statuses = [
    { label: "Active", value: data.byStatus?.Active || 0, icon: CheckCircle2, color: "#10b981" },
    { label: "Idle", value: data.byStatus?.Idle || 0, icon: Clock, color: "#94a3b8" },
    {
      label: "Maintenance",
      value: data.byStatus?.Maintenance || 0,
      icon: Cog,
      color: "#f59e0b",
    },
    { label: "Breakdown", value: data.byStatus?.Breakdown || 0, icon: XCircle, color: "#ef4444" },
  ];

  return (
    <GlassCard hover={false} className="p-5">
      <SectionHeader
        title="Machinery"
        icon={HardHat}
        badge={<Badge variant="orange">{data.total} assets</Badge>}
      />
      <div className="grid grid-cols-2 gap-3">
        {statuses.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gray-50/80 dark:bg-gray-800/30 border border-gray-100/80 dark:border-gray-700/30 group hover:shadow-sm transition-all"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform"
                style={{
                  background: `linear-gradient(135deg, ${s.color}, ${s.color}cc)`,
                }}
              >
                <Icon className="size-4" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                  {s.label}
                </p>
                <p className="text-xl font-bold dark:text-white tabular-nums leading-tight">
                  {s.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      {data.expiringComplianceCount > 0 && (
        <div className="flex items-center gap-3 mt-4 px-4 py-3.5 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border border-orange-200/60 dark:border-orange-900/30">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white shrink-0 shadow-sm">
            <ShieldAlert className="size-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-orange-700 dark:text-orange-400">
              {data.expiringComplianceCount} assets expiring soon
            </p>
            <p className="text-[10px] text-orange-500/70 mt-0.5">
              Compliance documents expire within 30 days
            </p>
          </div>
        </div>
      )}
    </GlassCard>
  );
};

const NotificationsSection = ({ data, navigate }) => {
  const categoryConfig = {
    announcement: { icon: Megaphone, color: "#8b5cf6" },
    approval: { icon: CheckCircle2, color: "#22c55e" },
    task: { icon: ClipboardList, color: "#3b82f6" },
    alert: { icon: AlertTriangle, color: "#f59e0b" },
    reminder: { icon: Clock, color: "#6366f1" },
    system: { icon: Cog, color: "#64748b" },
  };

  return (
    <GlassCard hover={false} className="p-5">
      <SectionHeader
        title="Recent Notifications"
        icon={BellRing}
        badge={
          data.unreadCount > 0 ? (
            <Badge variant="danger">{data.unreadCount} unread</Badge>
          ) : null
        }
      />
      {!data.recent?.length ? (
        <EmptyState icon={BellRing} message="No recent notifications" />
      ) : (
        <div className="space-y-1">
          {data.recent.slice(0, 5).map((n) => {
            const config = categoryConfig[n.category] || categoryConfig.system;
            const Icon = config.icon;
            return (
              <div
                key={n._id}
                onClick={() => n.actionUrl && navigate(n.actionUrl)}
                className="flex items-center gap-3 py-3 px-3 -mx-1 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${config.color}12` }}
                >
                  <Icon className="size-4" style={{ color: config.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold dark:text-white text-gray-800 truncate">
                    {n.title}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">
                    {n.message}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-gray-400 tabular-nums">
                    {formatDistanceToNow(new Date(n.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                  <ArrowUpRight className="size-3.5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
};

// --- Main Dashboard ---

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ViewWorkOrderModal, setViewWorkOrderModal] = useState(false);
  const { data, isLoading, isError, refetch, isFetching } = useDashboard();

  if (isLoading) return <Loader fullScreen={false} />;

  if (isError || !data || data.message === "No role assigned") {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
        <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <XCircle className="size-8 opacity-50" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold dark:text-white text-gray-700">
            {data?.message === "No role assigned"
              ? "No Role Assigned"
              : "Dashboard Unavailable"}
          </p>
          <p className="text-xs text-gray-400 mt-1 max-w-xs">
            {data?.message === "No role assigned"
              ? "Your account doesn't have a role. Please contact your administrator."
              : "We couldn't load the dashboard data. Please try again."}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600 font-semibold bg-blue-50 dark:bg-blue-950/30 px-4 py-2 rounded-xl transition-colors"
        >
          <RefreshCw className="size-4" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="h-full pb-16">
      {/* Header Bar */}
      <div className="flex justify-between items-center mb-4">
        <Title
          title="Dashboard"
          sub_title="Main Dashboard"
          page_title="Main Dashboard"
        />
        <div className="flex gap-2 items-center">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2.5 rounded-xl dark:bg-layout-dark bg-white dark:text-white text-darkest-blue border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer hover:shadow-sm"
            title="Refresh dashboard"
          >
            <RefreshCw
              className={`size-4 ${isFetching ? "animate-spin" : ""}`}
            />
          </button>
          <Button
            onClick={() => navigate("employeedashboard")}
            button_name="Employee"
            paddingY="py-2.5"
          />
          <Button
            onClick={() => navigate("viewcalendar")}
            button_name="Calendar"
            bgColor="dark:bg-layout-dark bg-white"
            textColor="dark:text-white text-darkest-blue"
            button_icon={<TbCalendarDue size={20} />}
            paddingY="py-2.5"
          />
          <Button
            onClick={() => setViewWorkOrderModal(true)}
            button_name="Work Orders"
            bgColor="dark:bg-layout-dark bg-white"
            textColor="dark:text-white text-darkest-blue"
            button_icon={<LuClipboardList size={20} />}
            paddingY="py-2.5"
          />
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="space-y-5 overflow-y-auto h-full no-scrollbar pb-8">
        {/* Welcome Banner */}
        <WelcomeHeader user={user} data={data} />

        {/* Overview Stats */}
        {data.overview && <OverviewSection data={data.overview} />}

        {/* My Work Profile + Upcoming Deadlines */}
        {(data.myWorkProfile || data.upcomingDeadlines) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {data.myWorkProfile && (
              <MyWorkProfileSection data={data.myWorkProfile} navigate={navigate} />
            )}
            {data.upcomingDeadlines && (
              <UpcomingDeadlinesSection data={data.upcomingDeadlines} />
            )}
          </div>
        )}

        {/* Attendance & Leaves Row */}
        {/* {(data.todayAttendance || data.pendingLeaves) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {data.todayAttendance && (
              <AttendanceSection data={data.todayAttendance} />
            )}
            {data.pendingLeaves && (
              <PendingLeavesSection data={data.pendingLeaves} />
            )}
          </div>
        )} */}

        {/* Tender Pipeline - Full Width */}
        {data.tenderPipeline && (
          <TenderPipelineSection data={data.tenderPipeline} />
        )}

        {/* Purchase & Work Orders Row */}
        {(data.purchaseRequests || data.workOrders) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {data.purchaseRequests && (
              <PurchaseSection data={data.purchaseRequests} />
            )}
            {data.workOrders && <WorkOrderSection data={data.workOrders} />}
          </div>
        )}

        {/* Financial Row */}
        {(data.emdSummary || data.billing || data.penaltySummary) && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {data.emdSummary && <EmdSection data={data.emdSummary} />}
            {data.billing && <BillingSection data={data.billing} />}
            {data.penaltySummary && (
              <PenaltySection data={data.penaltySummary} />
            )}
          </div>
        )}

        {/* Employees - Full Width */}
        {data.employees && <EmployeesSection data={data.employees} />}

        {/* Site & Machinery Row */}
        {(data.siteWorkDone || data.machinery) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {data.siteWorkDone && (
              <SiteWorkDoneSection data={data.siteWorkDone} />
            )}
            {data.machinery && <MachinerySection data={data.machinery} />}
          </div>
        )}

        {/* Notifications */}
        {data.notifications && (
          <NotificationsSection
            data={data.notifications}
            navigate={navigate}
          />
        )}
      </div>

      {ViewWorkOrderModal && (
        <ViewWorkOrderDashboard
          onclose={() => setViewWorkOrderModal(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
