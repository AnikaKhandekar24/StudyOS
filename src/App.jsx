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
  Pause,
  PencilLine,
  Play,
  Plus,
  RefreshCcw,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";

const STORAGE_KEY = "studyos-v1";
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
};

function usePersistentData() {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...initialData, ...JSON.parse(saved) } : initialData;
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
];

function Sidebar({ page, setPage, open, setOpen }) {
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
        <div className="profile">
          <div className="avatar">A</div>
          <div><strong>Anika</strong><span>Student workspace</span></div>
          <MoreHorizontal size={18} />
        </div>
      </aside>
    </>
  );
}

function Header({ page, setMenuOpen }) {
  const title = navItems.find(([id]) => id === page)?.[1] || "Dashboard";
  return (
    <header className="topbar">
      <button className="icon-btn menu-btn" aria-label="Open navigation" onClick={() => setMenuOpen(true)}><Menu size={20} /></button>
      <div>
        <span className="eyebrow">Study workspace</span>
        <h2>{title}</h2>
      </div>
      <div className="top-actions">
        <div className="streak-pill"><Flame size={16} fill="currentColor" /> 6 day streak</div>
        <button className="avatar small">A</button>
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
          <h1>Welcome back, Anika <span>✦</span></h1>
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
  const [mode, setMode] = useState("focus");
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const total = mode === "focus" ? 25 * 60 : 5 * 60;

  useEffect(() => {
    if (!running) return undefined;
    const timer = setInterval(() => setSeconds((value) => {
      if (value <= 1) {
        setRunning(false);
        if (mode === "focus") {
          setData((d) => ({ ...d, focusToday: d.focusToday + 25, focusWeek: d.focusWeek + 25, sessions: d.sessions + 1 }));
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
    setSeconds(next === "focus" ? 25 * 60 : 5 * 60);
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

function EmptyState({ icon: Icon, title, body }) {
  return <div className="empty-state"><Icon size={27} /><strong>{title}</strong><p>{body}</p></div>;
}

export default function App() {
  const [data, setData] = usePersistentData();
  const [page, setPage] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [assignmentOpen, setAssignmentOpen] = useState(false);

  const pageContent = useMemo(() => {
    const shared = { data, setData };
    if (page === "assignments") return <Assignments {...shared} openAssignment={() => setAssignmentOpen(true)} />;
    if (page === "focus") return <FocusTimer {...shared} />;
    if (page === "goals") return <Goals {...shared} />;
    if (page === "progress") return <Progress data={data} />;
    return <Dashboard {...shared} setPage={setPage} openAssignment={() => setAssignmentOpen(true)} />;
  }, [page, data]);

  return (
    <div className="app-shell">
      <Sidebar page={page} setPage={setPage} open={menuOpen} setOpen={setMenuOpen} />
      <main className="main">
        <Header page={page} setMenuOpen={setMenuOpen} />
        {pageContent}
        <footer>StudyOS <span>✦</span> Your student life, organized.</footer>
      </main>
      {assignmentOpen && <AssignmentModal onClose={() => setAssignmentOpen(false)} onAdd={(assignment) => setData((d) => ({ ...d, assignments: [...d.assignments, assignment] }))} />}
    </div>
  );
}
