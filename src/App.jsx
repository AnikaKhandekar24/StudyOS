import React, { useEffect, useMemo, useState } from "react";
import {
  AlarmClock,
  ArrowRight,
  BarChart3,
  BookOpen,
  BrainCircuit,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock3,
  Flame,
  Focus,
  LayoutDashboard,
  ListTodo,
  Menu,
  MoreHorizontal,
  LockKeyhole,
  LogIn,
  LogOut,
  Mail,
  Pause,
  PencilLine,
  Play,
  Plus,
  RefreshCcw,
  Save,
  Settings,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  UserRound,
  X,
  Zap,
} from "lucide-react";

const STORAGE_KEY = "studyos-v1";
const AUTH_KEY = "studyos-auth-v1";
const SUBJECTS = ["Math", "Computer Science", "English", "Economics", "Design"];
const SUBJECT_COLORS = {
  Math: "#7c6ee6",
  "Computer Science": "#ef8da7",
  English: "#64b9aa",
  Economics: "#eeaa66",
  Design: "#9b7ac8",
};

const addDays = (days) => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const initialData = {
  assignments: [
    { id: 1, title: "Math Worksheet", subject: "Math", dueDate: addDays(1), priority: "High", status: "In Progress" },
    { id: 2, title: "CS Project Draft", subject: "Computer Science", dueDate: addDays(4), priority: "Medium", status: "Not Started" },
    { id: 3, title: "English Essay", subject: "English", dueDate: addDays(0), priority: "High", status: "Not Started" },
    { id: 4, title: "Design Reflection", subject: "Design", dueDate: addDays(-2), priority: "Low", status: "Completed", completedAt: new Date().toISOString() },
    { id: 5, title: "Microeconomics Quiz", subject: "Economics", dueDate: addDays(6), priority: "Medium", status: "In Progress" },
  ],
  goals: [
    { id: 1, text: "Review calculus notes for 30 min", completed: true },
    { id: 2, text: "Finish English essay outline", completed: false },
    { id: 3, text: "Complete one focus session", completed: false },
  ],
  focusToday: 50,
  focusWeek: 185,
  sessions: 2,
  streak: 6,
  weeklyFocus: [35, 50, 25, 45, 30, 0, 0],
  profile: {
    name: "Anika",
    email: "anika@example.com",
    school: "Anika Builds Academy",
    course: "Student workspace",
    bio: "Building better study systems, one focused session at a time.",
  },
  preferences: {
    focusMinutes: 25,
    breakMinutes: 5,
    accent: "lavender",
    deadlineReminders: true,
    dailySummary: true,
    compactMode: false,
  },
};

function usePersistentData() {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return initialData;
      const parsed = JSON.parse(saved);
      return {
        ...initialData,
        ...parsed,
        profile: { ...initialData.profile, ...parsed.profile },
        preferences: { ...initialData.preferences, ...parsed.preferences },
      };
    } catch {
      return initialData;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  return [data, setData];
}

const dateLabel = (dateString) => {
  const date = new Date(`${dateString}T12:00:00`);
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const diff = Math.round((date - today) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const isOverdue = (assignment) =>
  assignment.status !== "Completed" &&
  new Date(`${assignment.dueDate}T23:59:59`) < new Date();

function Brand() {
  return (
    <div className="brand">
      <div className="brand-mark"><BookOpen size={21} strokeWidth={2.3} /></div>
      <div>
        <strong>StudyOS</strong>
        <span>by Anika</span>
      </div>
    </div>
  );
}

const navItems = [
  ["dashboard", "Dashboard", LayoutDashboard],
  ["assignments", "Assignments", ListTodo],
  ["focus", "Focus timer", Focus],
  ["goals", "Study goals", Target],
  ["progress", "Progress", BarChart3],
  ["settings", "Settings", Settings],
];

const getInitials = (name = "") =>
  name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "S";

async function hashPassword(password) {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function Sidebar({ page, setPage, open, setOpen, profile, onSignOut }) {
  return (
    <>
      {open && <button className="scrim" aria-label="Close menu" onClick={() => setOpen(false)} />}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-top">
          <Brand />
          <button className="icon-btn mobile-close" aria-label="Close navigation" onClick={() => setOpen(false)}><X size={18} /></button>
        </div>
        <nav>
          <p className="nav-label">Workspace</p>
          {navItems.map(([id, label, Icon]) => (
            <button
              key={id}
              className={`nav-item ${page === id ? "active" : ""}`}
              onClick={() => { setPage(id); setOpen(false); }}
            >
              <Icon size={18} />
              <span>{label}</span>
              {page === id && <span className="active-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-card">
          <div className="mini-sparkle"><Sparkles size={16} /></div>
          <strong>Smart Plan</strong>
          <p>AI study planning is coming soon.</p>
          <span>Join the waitlist <ArrowRight size={13} /></span>
        </div>
        <button className="profile" onClick={() => { setPage("settings"); setOpen(false); }}>
          <div className="avatar">{getInitials(profile.name)}</div>
          <div><strong>{profile.name}</strong><span>{profile.course}</span></div>
          <MoreHorizontal size={18} />
        </button>
        <button className="sign-out-link" onClick={onSignOut}><LogOut size={15} /> Sign out</button>
      </aside>
    </>
  );
}

function Header({ page, setPage, setMenuOpen, data }) {
  const title = navItems.find(([id]) => id === page)?.[1] || "Dashboard";
  return (
    <header className="topbar">
      <button className="icon-btn menu-btn" aria-label="Open navigation" onClick={() => setMenuOpen(true)}><Menu size={20} /></button>
      <div>
        <span className="eyebrow">Study workspace</span>
        <h2>{title}</h2>
      </div>
      <div className="top-actions">
        <div className="streak-pill"><Flame size={16} fill="currentColor" /> {data.streak} day streak</div>
        <button className="avatar small" aria-label="Open profile settings" onClick={() => setPage("settings")}>{getInitials(data.profile.name)}</button>
      </div>
    </header>
  );
}

function PageIntro({ eyebrow, title, body, action }) {
  return (
    <div className="page-intro">
      <div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{body}</p></div>
      {action}
    </div>
  );
}

function Dashboard({ data, setData, setPage, openAssignment }) {
  const active = data.assignments.filter((a) => a.status !== "Completed");
  const completed = data.assignments.filter((a) => a.status === "Completed");
  const upcoming = active.filter((a) => !isOverdue(a)).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const goalDone = data.goals.filter((goal) => goal.completed).length;
  const goalPercent = data.goals.length ? Math.round((goalDone / data.goals.length) * 100) : 0;

  const toggleGoal = (id) => setData((d) => ({
    ...d,
    goals: d.goals.map((goal) => goal.id === id ? { ...goal, completed: !goal.completed } : goal),
  }));

  return (
    <div className="page">
      <section className="hero">
        <div>
          <span className="hero-kicker"><Sparkles size={14} /> {new Date().toLocaleDateString("en-US", { weekday: "long" })}, let’s make it count</span>
          <h1>Welcome back, {data.profile.name.split(" ")[0]} <span>✦</span></h1>
          <p>You’re building steady momentum. Here’s what’s happening in your study world today.</p>
          <div className="hero-actions">
            <button className="button primary" onClick={openAssignment}><Plus size={17} /> Add assignment</button>
            <button className="button ghost" onClick={() => setPage("focus")}><Play size={16} fill="currentColor" /> Start focus session</button>
          </div>
        </div>
        <div className="hero-date">
          <span>{new Date().toLocaleDateString("en-US", { weekday: "long" })}</span>
          <strong>{new Date().getDate()}</strong>
          <span>{new Date().toLocaleDateString("en-US", { month: "long" })}</span>
        </div>
      </section>

      <section className="stat-grid">
        <StatCard label="Active assignments" value={active.length} note={`${active.filter(isOverdue).length} need attention`} icon={ListTodo} tone="purple" />
        <StatCard label="Due this week" value={upcoming.filter((a) => new Date(a.dueDate) - new Date() < 7 * 86400000).length} note="Stay one step ahead" icon={CalendarDays} tone="peach" />
        <StatCard label="Tasks completed" value={completed.length} note="All-time progress" icon={CheckCircle2} tone="green" />
        <StatCard label="Focus today" value={`${data.focusToday}m`} note={`${data.sessions} sessions finished`} icon={Clock3} tone="blue" />
      </section>

      <div className="dashboard-grid">
        <section className="card span-2">
          <CardHeader title="Coming up" subtitle="Your nearest deadlines" action={<button className="text-button" onClick={() => setPage("assignments")}>View all <ChevronRight size={15} /></button>} />
          <div className="assignment-preview">
            {upcoming.slice(0, 4).map((a) => (
              <div className="assignment-row" key={a.id}>
                <button className="check-button" aria-label={`Complete ${a.title}`} onClick={() => setData((d) => ({ ...d, assignments: d.assignments.map((x) => x.id === a.id ? { ...x, status: "Completed", completedAt: new Date().toISOString() } : x) }))}><Circle size={19} /></button>
                <span className="subject-dot" style={{ background: SUBJECT_COLORS[a.subject] || "#8778e8" }} />
                <div className="assignment-copy"><strong>{a.title}</strong><span>{a.subject}</span></div>
                <span className={`priority ${a.priority.toLowerCase()}`}>{a.priority}</span>
                <div className={`due ${dateLabel(a.dueDate) === "Today" ? "today" : ""}`}><CalendarDays size={14} /> {dateLabel(a.dueDate)}</div>
              </div>
            ))}
          </div>
          <button className="add-row" onClick={openAssignment}><Plus size={16} /> Add another assignment</button>
        </section>

        <section className="card goal-card">
          <CardHeader title="Today’s goals" subtitle={`${goalDone} of ${data.goals.length} complete`} action={<span className="circle-progress" style={{ "--progress": `${goalPercent * 3.6}deg` }}>{goalPercent}%</span>} />
          <div className="goal-list compact">
            {data.goals.map((goal) => (
              <button key={goal.id} className={`goal-row ${goal.completed ? "done" : ""}`} onClick={() => toggleGoal(goal.id)}>
                <span className="goal-check">{goal.completed && <Check size={13} />}</span>
                <span>{goal.text}</span>
              </button>
            ))}
          </div>
          <button className="text-button footer-link" onClick={() => setPage("goals")}>Manage goals <ArrowRight size={14} /></button>
        </section>

        <section className="card span-2">
          <CardHeader title="Subject progress" subtitle="A quick look across your classes" action={<button className="text-button" onClick={() => setPage("progress")}>Full report <ChevronRight size={15} /></button>} />
          <SubjectBars assignments={data.assignments} />
        </section>

        <section className="card focus-promo">
          <div className="focus-visual"><div className="focus-ring"><BrainCircuit size={27} /></div><span>25:00</span></div>
          <div><span className="eyebrow">Focus room</span><h3>Make space for deep work.</h3><p>One clear task. Twenty-five quiet minutes.</p></div>
          <button className="button dark full" onClick={() => setPage("focus")}><Play size={15} fill="currentColor" /> Begin session</button>
        </section>

        <section className="card weekly-card span-3">
          <CardHeader title="This week at a glance" subtitle="Your effort is adding up" action={<span className="trend"><TrendingUp size={14} /> 12% from last week</span>} />
          <div className="weekly-body">
            <div className="weekly-stats">
              <div><strong>{completed.length}</strong><span>Assignments<br />completed</span></div>
              <div><strong>{data.focusWeek}</strong><span>Focus minutes<br />logged</span></div>
              <div><strong>{data.streak}</strong><span>Day study<br />streak</span></div>
            </div>
            <MiniChart values={data.weeklyFocus} />
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value, note, icon: Icon, tone }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}><Icon size={19} /></div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}

function CardHeader({ title, subtitle, action }) {
  return <div className="card-header"><div><h3>{title}</h3><p>{subtitle}</p></div>{action}</div>;
}

function SubjectBars({ assignments }) {
  const subjectStats = SUBJECTS.map((subject) => {
    const tasks = assignments.filter((a) => a.subject === subject);
    const done = tasks.filter((a) => a.status === "Completed").length;
    const percent = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
    return { subject, done, total: tasks.length, percent };
  });

  return (
    <div className="subject-bars">
      {subjectStats.map((item) => (
        <div className="subject-bar" key={item.subject}>
          <div className="subject-name"><span style={{ background: SUBJECT_COLORS[item.subject] }} /><strong>{item.subject}</strong><small>{item.done}/{item.total} tasks</small><b>{item.percent}%</b></div>
          <div className="progress-track"><span style={{ width: `${item.percent}%`, background: SUBJECT_COLORS[item.subject] }} /></div>
        </div>
      ))}
    </div>
  );
}

function MiniChart({ values }) {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const max = Math.max(...values, 60);
  return (
    <div className="mini-chart">
      {values.map((value, i) => (
        <div className="chart-column" key={`${days[i]}-${i}`}>
          <div className="bar-wrap"><span className={i === 4 ? "current" : ""} style={{ height: `${Math.max((value / max) * 100, 7)}%` }}><i>{value}m</i></span></div>
          <small>{days[i]}</small>
        </div>
      ))}
    </div>
  );
}

function Assignments({ data, setData, openAssignment }) {
  const [priority, setPriority] = useState("All");
  const [status, setStatus] = useState("All");
  const filtered = data.assignments.filter((a) =>
    (priority === "All" || a.priority === priority) &&
    (status === "All" || a.status === status)
  ).sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const updateStatus = (id, next) => setData((d) => ({
    ...d,
    assignments: d.assignments.map((a) => a.id === id ? { ...a, status: next, completedAt: next === "Completed" ? new Date().toISOString() : null } : a),
  }));
  const remove = (id) => setData((d) => ({ ...d, assignments: d.assignments.filter((a) => a.id !== id) }));

  return (
    <div className="page">
      <PageIntro eyebrow="Plan with clarity" title="Assignments" body="Keep every deadline visible and every next step manageable." action={<button className="button primary" onClick={openAssignment}><Plus size={17} /> New assignment</button>} />
      <div className="filter-row">
        <div className="filter-group"><span>Priority</span>{["All", "High", "Medium", "Low"].map((x) => <button key={x} className={priority === x ? "selected" : ""} onClick={() => setPriority(x)}>{x}</button>)}</div>
        <div className="filter-group"><span>Status</span>{["All", "Not Started", "In Progress", "Completed"].map((x) => <button key={x} className={status === x ? "selected" : ""} onClick={() => setStatus(x)}>{x}</button>)}</div>
      </div>
      <div className="assignment-board">
        {filtered.map((a) => (
          <article className={`assignment-card ${isOverdue(a) ? "overdue" : ""}`} key={a.id}>
            <button className={`big-check ${a.status === "Completed" ? "checked" : ""}`} onClick={() => updateStatus(a.id, a.status === "Completed" ? "In Progress" : "Completed")}>{a.status === "Completed" && <Check size={16} />}</button>
            <div className="assignment-main">
              <div className="assignment-title-line"><span className="subject-chip" style={{ "--subject": SUBJECT_COLORS[a.subject] }}>{a.subject}</span><span className={`priority ${a.priority.toLowerCase()}`}>{a.priority}</span></div>
              <h3>{a.title}</h3>
              <div className="assignment-meta">
                <span className={isOverdue(a) ? "danger" : ""}><CalendarDays size={15} /> {isOverdue(a) ? "Overdue · " : ""}{dateLabel(a.dueDate)}</span>
                <span><Clock3 size={15} /> {a.status}</span>
              </div>
            </div>
            <select aria-label={`Status for ${a.title}`} value={a.status} onChange={(e) => updateStatus(a.id, e.target.value)}>
              <option>Not Started</option><option>In Progress</option><option>Completed</option>
            </select>
            <button className="icon-btn delete" aria-label={`Delete ${a.title}`} onClick={() => remove(a.id)}><Trash2 size={17} /></button>
          </article>
        ))}
        {!filtered.length && <EmptyState icon={ListTodo} title="No assignments here" body="Try another filter or add something new." />}
      </div>
    </div>
  );
}

function AssignmentModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ title: "", subject: "Math", dueDate: addDays(1), priority: "Medium", status: "Not Started" });
  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onAdd({ ...form, title: form.title.trim(), id: Date.now() });
    onClose();
  };
  return (
    <div className="modal-wrap" role="dialog" aria-modal="true">
      <button className="modal-backdrop" onClick={onClose} aria-label="Close modal" />
      <form className="modal" onSubmit={submit}>
        <div className="modal-head"><div><span className="eyebrow">Add to your plan</span><h2>New assignment</h2></div><button type="button" className="icon-btn" aria-label="Close assignment form" onClick={onClose}><X size={19} /></button></div>
        <label>Assignment title<input autoFocus required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Chapter 4 problem set" /></label>
        <div className="form-grid">
          <label>Subject<select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>{SUBJECTS.map((s) => <option key={s}>{s}</option>)}</select></label>
          <label>Due date<input type="date" required value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></label>
          <label>Priority<select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}><option>Low</option><option>Medium</option><option>High</option></select></label>
          <label>Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>Not Started</option><option>In Progress</option><option>Completed</option></select></label>
        </div>
        <div className="modal-actions"><button type="button" className="button ghost" onClick={onClose}>Cancel</button><button className="button primary" type="submit"><Plus size={16} /> Add assignment</button></div>
      </form>
    </div>
  );
}

function FocusTimer({ data, setData }) {
  const focusLength = data.preferences.focusMinutes * 60;
  const breakLength = data.preferences.breakMinutes * 60;
  const [mode, setMode] = useState("focus");
  const [seconds, setSeconds] = useState(focusLength);
  const [running, setRunning] = useState(false);
  const total = mode === "focus" ? focusLength : breakLength;

  useEffect(() => {
    if (!running) return undefined;
    const timer = setInterval(() => setSeconds((value) => {
      if (value <= 1) {
        setRunning(false);
        if (mode === "focus") {
          setData((d) => ({
            ...d,
            focusToday: d.focusToday + d.preferences.focusMinutes,
            focusWeek: d.focusWeek + d.preferences.focusMinutes,
            sessions: d.sessions + 1,
          }));
        }
        return 0;
      }
      return value - 1;
    }), 1000);
    return () => clearInterval(timer);
  }, [running, mode, setData]);

  const switchMode = (next) => {
    setMode(next);
    setRunning(false);
    setSeconds(next === "focus" ? focusLength : breakLength);
  };
  const reset = () => { setRunning(false); setSeconds(total); };
  const progress = ((total - seconds) / total) * 360;
  const format = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <div className="page focus-page">
      <PageIntro eyebrow="Protect your attention" title="Focus room" body="Settle in, choose one thing, and give it your full attention." />
      <div className="focus-layout">
        <section className="timer-card">
          <div className="mode-toggle"><button className={mode === "focus" ? "active" : ""} onClick={() => switchMode("focus")}>Focus</button><button className={mode === "break" ? "active" : ""} onClick={() => switchMode("break")}>Short break</button></div>
          <div className="timer-ring" style={{ "--timer-progress": `${progress}deg` }}>
            <div><span>{mode === "focus" ? "Focus session" : "Take a breath"}</span><strong>{format}</strong><small>{running ? "You’re doing beautifully. Keep going." : "Ready when you are."}</small></div>
          </div>
          <div className="timer-controls">
            <button className="round-btn secondary" aria-label="Reset timer" onClick={reset}><RefreshCcw size={20} /></button>
            <button className="round-btn primary-control" aria-label={running ? "Pause timer" : "Start timer"} onClick={() => setRunning(!running)}>{running ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}</button>
            <button className="round-btn secondary" aria-label="Skip session" onClick={() => switchMode(mode === "focus" ? "break" : "focus")}><ChevronRight size={23} /></button>
          </div>
          <p className="timer-quote">“Small focused steps create remarkable progress.”</p>
        </section>
        <aside className="focus-side">
          <div className="card"><CardHeader title="Today’s focus" subtitle="Quiet progress, counted" /><div className="focus-stats"><div><span><Clock3 size={17} /> Minutes</span><strong>{data.focusToday}</strong></div><div><span><Zap size={17} /> Sessions</span><strong>{data.sessions}</strong></div></div></div>
          <div className="card focus-tip"><Sparkles size={20} /><div><strong>A tiny focus ritual</strong><p>Put your phone away, close extra tabs, and write down the one outcome you want from this session.</p></div></div>
        </aside>
      </div>
    </div>
  );
}

function Goals({ data, setData }) {
  const [text, setText] = useState("");
  const done = data.goals.filter((g) => g.completed).length;
  const percent = data.goals.length ? Math.round(done / data.goals.length * 100) : 0;
  const add = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setData((d) => ({ ...d, goals: [...d.goals, { id: Date.now(), text: text.trim(), completed: false }] }));
    setText("");
  };
  const toggle = (id) => setData((d) => ({ ...d, goals: d.goals.map((g) => g.id === id ? { ...g, completed: !g.completed } : g) }));
  const remove = (id) => setData((d) => ({ ...d, goals: d.goals.filter((g) => g.id !== id) }));
  return (
    <div className="page">
      <PageIntro eyebrow="A gentle daily plan" title="Study goals" body="Turn ambitious plans into a few clear promises to yourself." />
      <section className="goal-hero">
        <div><span>Today’s progress</span><strong>{percent}%</strong><p>{done} of {data.goals.length} goals complete</p></div>
        <div className="large-progress" style={{ "--progress": `${percent * 3.6}deg` }}><span>{percent}%</span></div>
      </section>
      <form className="goal-form" onSubmit={add}><div><PencilLine size={18} /><input value={text} onChange={(e) => setText(e.target.value)} placeholder="What would make today feel successful?" /></div><button className="button primary"><Plus size={17} /> Add goal</button></form>
      <section className="goals-board card">
        <CardHeader title="Today’s goals" subtitle="Keep it realistic, then make it happen" />
        <div className="goal-list">
          {data.goals.map((g) => (
            <div className={`goal-item ${g.completed ? "done" : ""}`} key={g.id}>
              <button className="big-check" onClick={() => toggle(g.id)}>{g.completed && <Check size={16} />}</button>
              <span>{g.text}</span>
              <button className="icon-btn delete" onClick={() => remove(g.id)}><Trash2 size={17} /></button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Progress({ data }) {
  const completed = data.assignments.filter((a) => a.status === "Completed").length;
  return (
    <div className="page">
      <PageIntro eyebrow="See how far you’ve come" title="Progress & insights" body="Your consistency is a story worth noticing." />
      <section className="insight-banner"><div className="insight-icon"><TrendingUp size={25} /></div><div><span>Weekly insight</span><h2>You’re most focused on Tuesdays.</h2><p>That’s your strongest day for deep work. Consider protecting a longer study block then.</p></div></section>
      <section className="stat-grid analytics">
        <StatCard label="Completed this week" value={completed} note="Assignments finished" icon={CheckCircle2} tone="green" />
        <StatCard label="Focus minutes" value={data.focusWeek} note="Across all sessions" icon={Clock3} tone="purple" />
        <StatCard label="Best study day" value="Tue" note="50 focused minutes" icon={Zap} tone="peach" />
        <StatCard label="Current streak" value={`${data.streak}d`} note="Keep the rhythm going" icon={Flame} tone="blue" />
      </section>
      <div className="analytics-grid">
        <section className="card">
          <CardHeader title="Focus rhythm" subtitle="Minutes focused this week" action={<span className="trend"><TrendingUp size={14} /> Strong week</span>} />
          <div className="large-chart"><MiniChart values={data.weeklyFocus} /></div>
        </section>
        <section className="card">
          <CardHeader title="Subject progress" subtitle="Based on completed assignments" />
          <SubjectBars assignments={data.assignments} />
        </section>
      </div>
      <section className="smart-plan-wide"><div><Sparkles size={22} /><span>Coming soon</span></div><h2>Your plan, made smarter.</h2><p>StudyOS will soon help you prioritize deadlines, balance subjects, and build a study plan around the time you actually have.</p><button className="button light">AI study planning coming soon</button></section>
    </div>
  );
}

function SettingsPage({ data, setData, onSignOut }) {
  const [draft, setDraft] = useState(data.profile);
  const [saved, setSaved] = useState(false);
  const preferences = data.preferences;

  const updatePreference = (key, value) => {
    setData((current) => ({
      ...current,
      preferences: { ...current.preferences, [key]: value },
    }));
  };

  const saveProfile = (event) => {
    event.preventDefault();
    setData((current) => ({ ...current, profile: { ...draft } }));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  return (
    <div className="page settings-page">
      <PageIntro
        eyebrow="Make StudyOS yours"
        title="Profile & settings"
        body="Personalize your workspace and shape focus sessions around how you study best."
      />

      <div className="settings-layout">
        <aside className="profile-summary card">
          <div className="profile-avatar-large">{getInitials(data.profile.name)}</div>
          <h2>{data.profile.name}</h2>
          <p>{data.profile.course}</p>
          <span>{data.profile.email}</span>
          <div className="profile-quote">{data.profile.bio}</div>
          <div className="profile-mini-stats">
            <div><strong>{data.streak}</strong><span>day streak</span></div>
            <div><strong>{data.sessions}</strong><span>sessions</span></div>
          </div>
        </aside>

        <div className="settings-sections">
          <form className="card settings-card" onSubmit={saveProfile}>
            <div className="settings-heading">
              <div className="settings-icon"><UserRound size={18} /></div>
              <div><h3>Profile details</h3><p>The name and context shown around your workspace.</p></div>
            </div>
            <div className="settings-fields">
              <label>Full name<input required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label>
              <label>Email<input type="email" required value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} /></label>
              <label>School or university<input value={draft.school} onChange={(event) => setDraft({ ...draft, school: event.target.value })} /></label>
              <label>Workspace label<input value={draft.course} onChange={(event) => setDraft({ ...draft, course: event.target.value })} /></label>
              <label className="full-field">Short bio<textarea rows="3" value={draft.bio} onChange={(event) => setDraft({ ...draft, bio: event.target.value })} /></label>
            </div>
            <div className="settings-actions">
              {saved && <span className="saved-message"><CheckCircle2 size={15} /> Profile saved</span>}
              <button className="button primary" type="submit"><Save size={16} /> Save changes</button>
            </div>
          </form>

          <section className="card settings-card">
            <div className="settings-heading">
              <div className="settings-icon peach"><AlarmClock size={18} /></div>
              <div><h3>Focus defaults</h3><p>Choose the timer rhythm that helps you settle in.</p></div>
            </div>
            <div className="duration-grid">
              <label>Focus session<select value={preferences.focusMinutes} onChange={(event) => updatePreference("focusMinutes", Number(event.target.value))}><option value="20">20 minutes</option><option value="25">25 minutes</option><option value="30">30 minutes</option><option value="45">45 minutes</option><option value="50">50 minutes</option></select></label>
              <label>Short break<select value={preferences.breakMinutes} onChange={(event) => updatePreference("breakMinutes", Number(event.target.value))}><option value="5">5 minutes</option><option value="10">10 minutes</option><option value="15">15 minutes</option></select></label>
            </div>
          </section>

          <section className="card settings-card">
            <div className="settings-heading">
              <div className="settings-icon green"><Sparkles size={18} /></div>
              <div><h3>Workspace preferences</h3><p>Small choices for a calmer daily dashboard.</p></div>
            </div>
            <div className="accent-picker">
              <span>Accent color</span>
              <div>
                {[
                  ["lavender", "Lavender", "#7668df"],
                  ["rose", "Rose", "#d96f91"],
                  ["mint", "Mint", "#4f9d8c"],
                ].map(([value, label, color]) => (
                  <button type="button" key={value} className={preferences.accent === value ? "selected" : ""} onClick={() => updatePreference("accent", value)}>
                    <i style={{ background: color }} /> {label} {preferences.accent === value && <Check size={13} />}
                  </button>
                ))}
              </div>
            </div>
            <div className="preference-list">
              <PreferenceToggle label="Deadline reminders" description="Highlight assignments as their due dates approach." checked={preferences.deadlineReminders} onChange={(value) => updatePreference("deadlineReminders", value)} />
              <PreferenceToggle label="Daily summary" description="Show a quick productivity recap on your dashboard." checked={preferences.dailySummary} onChange={(value) => updatePreference("dailySummary", value)} />
              <PreferenceToggle label="Compact cards" description="Use slightly tighter spacing across the workspace." checked={preferences.compactMode} onChange={(value) => updatePreference("compactMode", value)} />
            </div>
          </section>

          <section className="card settings-card account-card">
            <div className="settings-heading">
              <div className="settings-icon rose"><LockKeyhole size={18} /></div>
              <div><h3>Account</h3><p>Your current StudyOS session on this device.</p></div>
            </div>
            <div className="account-row">
              <div><strong>{data.profile.email}</strong><span>Signed in locally</span></div>
              <button className="button ghost" onClick={onSignOut}><LogOut size={15} /> Sign out</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function PreferenceToggle({ label, description, checked, onChange }) {
  return (
    <div className="preference-row">
      <div><strong>{label}</strong><span>{description}</span></div>
      <button type="button" role="switch" aria-checked={checked} className={`toggle ${checked ? "on" : ""}`} onClick={() => onChange(!checked)}><span /></button>
    </div>
  );
}

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState("signup");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    const email = form.email.trim().toLowerCase();
    const auth = JSON.parse(localStorage.getItem(AUTH_KEY) || '{"accounts":[]}');
    const existing = auth.accounts.find((account) => account.email === email);
    const passwordHash = await hashPassword(form.password);

    if (mode === "signup") {
      if (existing) {
        setError("An account with this email already exists. Try signing in.");
        return;
      }
      const account = { name: form.name.trim(), email, passwordHash };
      localStorage.setItem(AUTH_KEY, JSON.stringify({ accounts: [...auth.accounts, account], session: email }));
      onAuthenticated(account, true);
      return;
    }

    if (!existing || existing.passwordHash !== passwordHash) {
      setError("That email and password do not match.");
      return;
    }
    localStorage.setItem(AUTH_KEY, JSON.stringify({ ...auth, session: email }));
    onAuthenticated(existing, false);
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError("");
  };

  return (
    <main className="auth-page">
      <section className="auth-story">
        <Brand />
        <div className="auth-copy">
          <span className="hero-kicker"><Sparkles size={14} /> MindStack by Anika</span>
          <h1>Your student life,<br /><em>organized.</em></h1>
          <p>Plan deadlines, protect focus time, and turn everyday effort into progress you can see.</p>
          <div className="auth-benefits">
            <span><CheckCircle2 size={16} /> One calm home for every deadline</span>
            <span><Focus size={16} /> Focus sessions that fit your rhythm</span>
            <span><TrendingUp size={16} /> Progress that keeps you moving</span>
          </div>
        </div>
        <div className="auth-note">StudyOS <b>✦</b> Built for students who want less chaos.</div>
      </section>

      <section className="auth-panel">
        <div className="auth-form-wrap">
          <div className="auth-mobile-brand"><Brand /></div>
          <span className="eyebrow">{mode === "signup" ? "Create your workspace" : "Welcome back"}</span>
          <h2>{mode === "signup" ? "Start with StudyOS" : "Sign in to StudyOS"}</h2>
          <p>{mode === "signup" ? "A clearer study week starts here." : "Your dashboard is ready when you are."}</p>

          <div className="auth-tabs">
            <button className={mode === "signup" ? "active" : ""} onClick={() => switchMode("signup")}>Sign up</button>
            <button className={mode === "signin" ? "active" : ""} onClick={() => switchMode("signin")}>Sign in</button>
          </div>

          <form className="auth-form" onSubmit={submit}>
            {mode === "signup" && <label>Full name<input required minLength="2" autoComplete="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Your name" /></label>}
            <label>Email address<div className="input-with-icon"><Mail size={16} /><input required type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" /></div></label>
            <label>Password<div className="input-with-icon"><LockKeyhole size={16} /><input required minLength="6" type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="At least 6 characters" /></div></label>
            {error && <div className="auth-error">{error}</div>}
            <button className="button primary auth-submit" type="submit">{mode === "signup" ? <><Sparkles size={16} /> Create my workspace</> : <><LogIn size={16} /> Sign in</>}</button>
          </form>

          <div className="email-expectation">
            <Mail size={17} />
            <div><strong>Thoughtful emails, not noise.</strong><span>Welcome and deadline emails require the secure mail backend to be connected.</span></div>
          </div>
          <small className="auth-terms">By continuing, you agree to use StudyOS for excellent things.</small>
        </div>
      </section>
    </main>
  );
}

function EmptyState({ icon: Icon, title, body }) {
  return <div className="empty-state"><Icon size={27} /><strong>{title}</strong><p>{body}</p></div>;
}

export default function App() {
  const [data, setData] = usePersistentData();
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const auth = JSON.parse(localStorage.getItem(AUTH_KEY) || '{"accounts":[]}');
      return auth.accounts.find((account) => account.email === auth.session) || null;
    } catch {
      return null;
    }
  });
  const [page, setPage] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [assignmentOpen, setAssignmentOpen] = useState(false);

  const pageContent = useMemo(() => {
    const shared = { data, setData };
    if (page === "assignments") return <Assignments {...shared} openAssignment={() => setAssignmentOpen(true)} />;
    if (page === "focus") return <FocusTimer {...shared} />;
    if (page === "goals") return <Goals {...shared} />;
    if (page === "progress") return <Progress data={data} />;
    if (page === "settings") return <SettingsPage {...shared} onSignOut={signOut} />;
    return <Dashboard {...shared} setPage={setPage} openAssignment={() => setAssignmentOpen(true)} />;
  }, [page, data, currentUser]);

  function authenticate(account, isNew) {
    setCurrentUser(account);
    if (isNew) {
      setData((current) => ({
        ...current,
        profile: { ...current.profile, name: account.name, email: account.email },
      }));
    }
  }

  function signOut() {
    const auth = JSON.parse(localStorage.getItem(AUTH_KEY) || '{"accounts":[]}');
    localStorage.setItem(AUTH_KEY, JSON.stringify({ ...auth, session: null }));
    setCurrentUser(null);
    setPage("dashboard");
  }

  if (!currentUser) return <AuthScreen onAuthenticated={authenticate} />;

  return (
    <div className={`app-shell theme-${data.preferences.accent} ${data.preferences.compactMode ? "compact-mode" : ""}`}>
      <Sidebar page={page} setPage={setPage} open={menuOpen} setOpen={setMenuOpen} profile={data.profile} onSignOut={signOut} />
      <main className="main">
        <Header page={page} setPage={setPage} setMenuOpen={setMenuOpen} data={data} />
        {pageContent}
        <footer>StudyOS <span>✦</span> Your student life, organized.</footer>
      </main>
      {assignmentOpen && <AssignmentModal onClose={() => setAssignmentOpen(false)} onAdd={(assignment) => setData((d) => ({ ...d, assignments: [...d.assignments, assignment] }))} />}
    </div>
  );
}
