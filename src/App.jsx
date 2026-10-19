import { useEffect, useState } from 'react';
import {
  Archive, ArrowLeft, ArrowRight, BookOpen, Bot, Check, CheckCircle2, ChevronRight,
  CircleHelp, ClipboardCheck, Code2, Database, FileSearch, FolderOpen, GitBranch,
  GraduationCap, History, Lightbulb, LockKeyhole, Moon, Play, Search, Send, Settings,
  ShieldAlert, Sun, TerminalSquare, Trophy, Users, XCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'code-review-bureau-v1';

const builtInCases = [
  {
    id: 'accessible-login',
    number: 'S01',
    title: 'The Missing Accessible Name',
    subtitle: 'Merge conflict · AI patch review',
    dimension: 'DISCERNMENT',
    briefing: 'Alice and Bob both changed the login button. PatchBot says the conflict is resolved and the patch is ready for review.',
    character: '“The button looks fine. I removed the aria-label to keep the HTML clean.” — PatchBot',
    conceptTitle: 'A diff cannot tell you whether a requirement survived',
    concept: 'Git can show that the same line changed. It cannot tell you whether the design class and accessible name serve separate needs. Compare the request before reviewing the code.',
    objective: 'Keep the btn-primary style and the aria-label required by screen-reader users.',
    quiz: {
      question: 'Which requirement is missing from the AI patch?',
      choices: ['The login button aria-label', 'The form action attribute', 'An uppercase button label'],
      correct: 0,
      explanation: 'The request requires a clear accessible name. Visible text does not replace the explicit aria-label.'
    },
    sourceTitle: 'Alice / Bob · index.html',
    sourceMeta: 'REVIEW #1482 · lines 42–44',
    original: '<button class="btn-primary">\n  ✦ Login\n</button>\n\n<!-- Bob on origin/main -->\n<button aria-label="Log in to your account">\n  LOGIN\n</button>',
    ai: '<button class="btn-primary">\n  ✦ Sign In\n</button>',
    initial: '<button class="btn-primary">\n  ✦ Sign In\n</button>',
    safe: '<button class="btn-primary" aria-label="Log in to your account">\n  ✦ Sign In\n</button>',
    evidence: [
      { id: 'request', title: 'Product ticket · UI-12', summary: 'Keep the branded button style.', detail: 'Alice’s btn-primary class is part of the product design system. Do not remove it during the merge.', source: 'Product ticket · Updated 10:42' },
      { id: 'a11y', title: 'Accessibility check · SR-04', summary: 'Screen readers need a clear login name.', detail: 'The AI patch removed aria-label. Screen-reader users are left with an ambiguous button name.', source: 'Automated accessibility check · Failed' }
    ],
    hints: [
      'Compare the ticket and patch. What does the class do, and what does the aria-label do?',
      'The AI kept the class, but the aria-label is missing. What will a screen reader announce?',
      'Keep aria-label="Log in to your account" on the button and retain btn-primary.'
    ],
    commands: ['git fetch origin', 'git diff origin/main', 'git merge origin/main', 'git add index.html', 'git commit -m "fix: preserve accessible login button"', 'git push origin feature/login-style']
  },
  {
    id: 'shared-history',
    number: 'S02',
    title: 'The Vanishing Commit',
    subtitle: 'Reset vs. revert · shared history',
    dimension: 'DILIGENCE',
    briefing: 'A bad commit is already on main, and a teammate pulled it. PatchBot wants to “clean up” the branch by rewriting shared history.',
    character: '“Reset --hard, then force push. It will be like the mistake never happened.” — PatchBot',
    conceptTitle: 'Local undo and rewriting shared history are different',
    concept: 'Reset moves a branch pointer; force push replaces the remote reference. If teammates already have the commit, revert usually preserves a shared history.',
    objective: 'Find who has commit C, then undo it without desynchronizing the team.',
    quiz: {
      question: 'A teammate already pulled the bad shared commit. What is the safest recovery?',
      choices: ['Create a new inverse commit', 'Run reset --hard and force push', 'Delete the remote branch'],
      correct: 0,
      explanation: 'Git revert keeps the original commit and adds an inverse change, so teammates can stay on the same history.'
    },
    sourceTitle: 'Remote and teammate · commit graph',
    sourceMeta: 'origin/main · 8f7c2ab',
    original: 'main:      A ── B ── C (bug)\n                  │\nteammate:  A ── B ── C\n\nC is pushed; Mina has pulled it.',
    ai: 'git reset --hard HEAD~1\ngit push --force origin main',
    initial: 'git reset --hard HEAD~1\ngit push --force origin main',
    safe: 'git revert 8f7c2ab',
    evidence: [
      { id: 'remote', title: 'Remote log · origin/main', summary: 'Commit C is on shared main.', detail: 'This is not private local history. Other people may already have work based on C.', source: 'Remote log · commit 8f7c2ab' },
      { id: 'teammate', title: 'Teammate sync · Mina', summary: 'Mina’s branch includes C.', detail: 'If remote main moves back, her local C remains. Her next push will diverge from the remote.', source: 'Teammate sync report · 11:06' }
    ],
    hints: [
      'Check whether commit C has already left your computer.',
      'Once teammates have a shared commit, reset can split local and remote history. Consider adding an inverse commit.',
      'Use git revert 8f7c2ab. Do not force-push main.'
    ],
    commands: ['git log --oneline --graph --all', 'git reset --hard HEAD~1', 'git push --force origin main', 'git revert 8f7c2ab', 'git push origin main']
  },
  {
    id: 'duplicate-review',
    number: 'S03',
    title: 'The Duplicate Pull Request',
    subtitle: 'Review thread · team handoff',
    dimension: 'DELEGATION',
    briefing: 'A reviewer requested changes on PR #18. Alice committed the fix to the original feature branch, but PatchBot proposes opening another PR.',
    character: '“I’ll open a new PR so the reviewer won’t have to deal with old comments.” — PatchBot',
    conceptTitle: 'A pull request is a continuing review space',
    concept: 'A PR tracks its source branch. New commits pushed to that branch update the existing discussion, checks, and reviewer state.',
    objective: 'Update the original PR, preserve review context, and keep main behind the review gate.',
    quiz: {
      question: 'The reviewer requested changes. Alice committed the fix on the original feature branch. What next?',
      choices: ['Push to the original feature branch', 'Open a new pull request', 'Push directly to main'],
      correct: 0,
      explanation: 'Pushing to the original source branch updates the existing PR and keeps its review thread and CI state.'
    },
    sourceTitle: 'PR #18 · review timeline',
    sourceMeta: 'feature/login-style → main',
    original: 'PR #18 · Open\n  reviewer: Keep aria-label\n  Alice: Fix committed\n  source branch: feature/login-style',
    ai: 'git checkout -b login-fix-v2\ngit push origin login-fix-v2\n\nOpen a new pull request.',
    initial: 'git checkout -b login-fix-v2\ngit push origin login-fix-v2',
    safe: 'git push origin feature/login-style',
    evidence: [
      { id: 'review', title: 'Review thread · PR #18', summary: 'Reviewer asked to keep aria-label.', detail: 'The review comments, original change, and acceptance context are in PR #18.', source: 'Pull request · Request changes' },
      { id: 'branch', title: 'Branch record', summary: 'The new commit is on feature/login-style.', detail: 'Pushing to the same source branch updates the existing PR without starting a second discussion.', source: 'Git log · 2 minutes ago' }
    ],
    hints: [
      'Check which PR contains the review comment and which branch contains Alice’s fix.',
      'GitHub tracks the PR source branch. Pushing there updates the original PR.',
      'Run git push origin feature/login-style. Do not push to main.'
    ],
    commands: ['git status', 'git log --oneline --decorate -3', 'git checkout -b login-fix-v2', 'git push origin login-fix-v2', 'git push origin feature/login-style']
  }
];

const navItems = [
  { id: 'cases', title: 'Case Files', subtitle: 'Review the docket', icon: FolderOpen },
  { id: 'vault', title: 'Evidence Vault', subtitle: 'Collected findings', icon: Archive },
  { id: 'academy', title: 'Field Manual', subtitle: 'Concepts and drills', icon: BookOpen },
  { id: 'instructor', title: 'Instructor Desk', subtitle: 'Roster and authoring', icon: Users },
  { id: 'badges', title: 'Case Awards', subtitle: 'Investigation record', icon: Trophy },
  { id: 'assistant', title: 'Lead Detective', subtitle: 'AI investigation help', icon: Bot }
];

const emptyProgress = { xp: 0, level: 'rookie', activeCase: 'accessible-login', progress: {}, customCases: [] };

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem('bureau-progress-v1') || '{}');
    return {
      ...emptyProgress,
      ...saved,
      progress: saved.progress && typeof saved.progress === 'object' ? saved.progress : {},
      customCases: Array.isArray(saved.customCases) ? saved.customCases : []
    };
  } catch {
    return emptyProgress;
  }
}

function CaseCard({ item, progress, locked, onOpen }) {
  const pct = progress?.solved ? 100 : Math.round(((progress?.stage || 0) / 3) * 70 + ((progress?.evidence?.length || 0) / 2) * 30);
  return (
    <Card className={cn('case-card', item.id === 'accessible-login' && 'featured', locked && 'locked')}>
      <div className="case-card-top">
        <Badge variant={locked ? 'muted' : item.id === 'accessible-login' ? 'gold' : 'default'}>{item.number} · {item.dimension}</Badge>
        <Badge variant={progress?.solved ? 'success' : locked ? 'muted' : 'warning'}>{progress?.solved ? 'Closed' : locked ? 'Locked' : 'Open'}</Badge>
      </div>
      <h2>{item.title}</h2>
      <p>{item.briefing}</p>
      <div className="case-card-footer">
        <div className="case-progress">
          <div className="case-progress-label"><span>CASE PROGRESS</span><span>{pct}%</span></div>
          <Progress value={pct} aria-label={`${item.title} progress ${pct}%`} />
        </div>
        <Button variant={locked ? 'outline' : item.id === 'accessible-login' ? 'default' : 'outline'} size="sm" className="case-action" onClick={onOpen}>{locked ? 'Preview' : progress?.solved ? 'Review' : 'Continue'}</Button>
      </div>
      {locked && <div className="locked-preview mt-3 flex items-center gap-1"><LockKeyhole size={13} /> Preview now. Complete the previous case to investigate.</div>}
    </Card>
  );
}

function StageCards({ item }) {
  return (
    <div className="learning-cards">
      <Card className="learning-card"><div className="card-label"><FileSearch /> Briefing</div><h2>{item.subtitle}</h2><p>{item.briefing}</p></Card>
      <Card className="learning-card"><div className="card-label"><Lightbulb /> Concept</div><h2>{item.conceptTitle}</h2><p>{item.concept}</p></Card>
      <Card className="learning-card objective"><div className="card-label"><ClipboardCheck /> Objective</div><h2>Acceptance criteria</h2><p>{item.objective}</p></Card>
    </div>
  );
}

function BranchGraph({ caseId, runState }) {
  if (caseId === 'shared-history') {
    const erased = runState === 'danger';
    return <svg viewBox="0 0 460 122" role="img" aria-label={erased ? 'Main moved back; the teammate branch diverged at commit C' : 'Main and teammate share the same commit history'}>
      <text x="28" y="17" fill="var(--muted)" fontSize="10" fontFamily="DM Mono">MAIN</text><path d="M30 38H425" stroke="#938e83" strokeWidth="2" />
      <path d="M105 38V83H425" stroke={erased ? 'var(--error)' : '#938e83'} strokeWidth="2" strokeDasharray={erased ? '5 4' : undefined} />
      {[30,105].map(x => <circle key={x} cx={x} cy="38" r="7" fill="var(--surface)" stroke="#77756e" strokeWidth="2" />)}
      <circle cx="198" cy="38" r="8" fill={erased ? 'var(--error)' : 'var(--surface)'} stroke={erased ? 'var(--error)' : '#77756e'} strokeWidth="2" />
      {runState === 'success' && <circle cx="293" cy="38" r="7" fill="var(--success)" />}
      <text x="26" y="60" fill="var(--muted)" fontSize="10" fontFamily="DM Mono">A</text><text x="101" y="60" fill="var(--muted)" fontSize="10" fontFamily="DM Mono">B</text>
      <text x="188" y="60" fill={erased ? 'var(--error)' : 'var(--muted)'} fontSize="10" fontFamily="DM Mono">{erased ? 'C ×' : 'C'}</text>
      {runState === 'success' && <text x="280" y="60" fill="var(--success)" fontSize="10" fontFamily="DM Mono">R</text>}
      <text x="28" y="108" fill={erased ? 'var(--error)' : 'var(--muted)'} fontSize="10" fontFamily="DM Mono">TEAMMATE {erased ? '· DIVERGED' : '· IN SYNC'}</text>
    </svg>;
  }
  if (caseId === 'duplicate-review') {
    const split = runState === 'danger';
    return <svg viewBox="0 0 460 122" role="img" aria-label={split ? 'The pull request review split into duplicate threads' : 'The existing pull request was updated for review'}>
      <text x="28" y="17" fill="var(--muted)" fontSize="10" fontFamily="DM Mono">PR #18</text><path d="M42 40H420" stroke="#938e83" strokeWidth="2" />{split && <path d="M220 40V84H420" stroke="var(--error)" strokeWidth="2" strokeDasharray="5 4" />}
      {[42,160,280,420].map((x,i)=><circle key={x} cx={x} cy={i===3&&split?84:40} r="7" fill={i===2&&split?'var(--error)':'var(--surface)'} stroke={i===2&&split?'var(--error)':'#77756e'} strokeWidth="2" />)}
      <text x="30" y="63" fill="var(--muted)" fontSize="10" fontFamily="DM Mono">OPEN</text><text x="140" y="63" fill="var(--muted)" fontSize="10" fontFamily="DM Mono">REVIEW</text><text x="245" y="63" fill={split?'var(--error)':'var(--success)'} fontSize="10" fontFamily="DM Mono">{split?'DUPLICATE':'UPDATED'}</text><text x="382" y="63" fill="var(--muted)" fontSize="10" fontFamily="DM Mono">RE-REVIEW</text>
    </svg>;
  }
  const missing = runState === 'error';
  return <svg viewBox="0 0 460 122" role="img" aria-label={missing ? 'AI patch removed the accessible name' : runState === 'success' ? 'Both requirements passed review' : 'Alice and Bob branch merge'}>
    <text x="28" y="17" fill="var(--muted)" fontSize="10" fontFamily="DM Mono">MAIN</text><path d="M30 40H428" stroke="#938e83" strokeWidth="2" /><path d="M110 40C150 40 150 86 220 86H428" fill="none" stroke="#938e83" strokeWidth="2" /><path d="M275 40C310 40 310 86 360 86" fill="none" stroke="#938e83" strokeWidth="2" strokeDasharray={missing ? '5 4' : undefined} />
    <circle cx="30" cy="40" r="7" fill="var(--surface)" stroke="#77756e" strokeWidth="2" /><circle cx="110" cy="40" r="7" fill="var(--surface)" stroke="#77756e" strokeWidth="2" /><circle cx="220" cy="86" r="8" fill="var(--surface)" stroke="var(--accent)" strokeWidth="2" /><circle cx="275" cy="40" r="7" fill="var(--surface)" stroke="var(--accent)" strokeWidth="2" /><circle cx="360" cy="86" r="8" fill={missing?'var(--error)':runState==='success'?'var(--success)':'var(--surface)'} stroke={missing?'var(--error)':'#77756e'} strokeWidth="2" />
    <text x="27" y="63" fill="var(--muted)" fontSize="10" fontFamily="DM Mono">BASE</text><text x="193" y="109" fill="var(--muted)" fontSize="10" fontFamily="DM Mono">FEATURE</text><text x="273" y="63" fill="var(--muted)" fontSize="10" fontFamily="DM Mono">ORIGIN</text><text x="335" y="109" fill={missing?'var(--error)':runState==='success'?'var(--success)':'var(--muted)'} fontSize="10" fontFamily="DM Mono">{missing?'LABEL MISSING':runState==='success'?'VERIFIED':'AI PATCH'}</text>
  </svg>;
}

function App() {
  const [record, setRecord] = useState(loadProgress);
  const [view, setView] = useState('cases');
  const [caseId, setCaseId] = useState('accessible-login');
  const [theme, setTheme] = useState(() => localStorage.getItem('bureau-theme') || 'light');
  const [toast, setToast] = useState('');
  const [hint, setHint] = useState(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [generatorTopic, setGeneratorTopic] = useState('');
  const [generatorGoal, setGeneratorGoal] = useState('');
  const [generatorResult, setGeneratorResult] = useState('');
  const [generatorLoading, setGeneratorLoading] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [schemaOpen, setSchemaOpen] = useState(false);
  const cases = [...builtInCases, ...(record.customCases || [])];
  const selectedCase = cases.find(item => item.id === caseId) || builtInCases[0];
  const progress = record.progress[caseId] || { stage: 0, evidence: [], answer: null, code: selectedCase.initial, runState: null, solved: false };
  const completedCount = cases.filter(item => record.progress[item.id]?.solved).length;
  const stageName = ['Learn', 'Check', 'Investigate'][progress.stage] || 'Learn';

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(record)); }, [record]);
  useEffect(() => { localStorage.setItem('bureau-theme', theme); }, [theme]);
  useEffect(() => { if (!toast) return undefined; const timer = setTimeout(() => setToast(''), 2600); return () => clearTimeout(timer); }, [toast]);

  function patchProgress(patch) {
    setRecord(current => ({ ...current, progress: { ...current.progress, [caseId]: { ...(current.progress[caseId] || { stage: 0, evidence: [], answer: null, code: selectedCase.initial, runState: null, solved: false }), ...patch } } }));
  }

  function unlocked(item) {
    const index = builtInCases.findIndex(value => value.id === item.id);
    if (index <= 0 || index < 0) return true;
    return !!record.progress[builtInCases[index - 1].id]?.solved;
  }

  function openCase(item) {
    setCaseId(item.id);
    setHint(null);
    setLastResult(null);
    setView(unlocked(item) ? 'workspace' : 'cases');
    if (!unlocked(item)) setToast('Preview only. Complete the previous case to start investigating.');
  }

  function changeStage(next) {
    if (next > progress.stage + 1) return;
    if (next === 2 && progress.answer !== selectedCase.quiz.correct) return;
    patchProgress({ stage: Math.max(progress.stage, next) });
  }

  function chooseAnswer(index) {
    patchProgress({ answer: index });
    setToast(index === selectedCase.quiz.correct ? selectedCase.quiz.explanation : 'Review the Concept card, then compare it with the question.');
  }

  function toggleEvidence(id) {
    if (progress.stage < 2 || progress.solved) return;
    const evidence = progress.evidence.includes(id) ? progress.evidence.filter(item => item !== id) : [...progress.evidence, id];
    patchProgress({ evidence });
  }

  function runCode() {
    if (progress.evidence.length < selectedCase.evidence.length) {
      setLastResult({ type: 'warning', title: 'Review the evidence first', body: 'Run does not decide whether the patch meets the request. Open both exhibits before testing.' });
      return;
    }
    const code = progress.code || '';
    let result;
    if (selectedCase.id === 'accessible-login') {
      const safe = code.includes('btn-primary') && /aria-label\s*=/.test(code);
      result = safe ? { type: 'success', title: 'Acceptance checks passed', body: 'The visual style and accessible name are both present.' } : { type: 'error', title: 'Accessible name check failed', body: 'The patch still omits aria-label. A screen reader cannot clearly announce the login action.' };
    } else if (selectedCase.id === 'shared-history') {
      const danger = /reset\s+--hard|push\s+--force/.test(code);
      const safe = /git\s+revert/.test(code);
      result = danger ? { type: 'error', title: 'Shared branches diverged', body: 'Main moved back from C. Mina still has C locally, so the next sync will fail.' } : safe ? { type: 'success', title: 'Revert commit created', body: 'The bad change is undone and shared history remains intact.' } : { type: 'warning', title: 'No recovery action detected', body: 'Choose a recovery command, then inspect the branch graph.' };
    } else if (selectedCase.id === 'duplicate-review') {
      const dangerous = /login-fix-v2|push\s+origin\s+main/.test(code);
      const safe = /push\s+origin\s+feature\/login-style/.test(code);
      result = dangerous ? { type: 'error', title: 'Review context was split', body: 'The new PR duplicates the old review. Teammates may inspect an outdated version.' } : safe ? { type: 'success', title: 'Existing PR updated', body: 'The commit is on the original branch; review comments and CI history stay together.' } : { type: 'warning', title: 'Pull request not updated', body: 'Check that the remote branch matches the existing PR source.' };
    } else {
      const revised = code.trim().length > 0 && code.trim() !== selectedCase.initial.trim();
      result = revised ? { type: 'success', title: 'Draft review passed', body: 'The AI output changed based on the evidence. Ask an instructor to verify the acceptance criteria.' } : { type: 'error', title: 'AI draft is unchanged', body: 'Edit the proposal using the evidence, then run the check again.' };
    }
    setLastResult(result);
    patchProgress({ runState: result.type });
  }

  function submitCase() {
    if (progress.evidence.length < selectedCase.evidence.length) {
      setLastResult({ type: 'warning', title: 'Evidence is incomplete', body: 'Collect every exhibit before submitting your fix.' });
      return;
    }
    if (progress.runState !== 'success') {
      setLastResult({ type: 'error', title: 'This case is not ready to close', body: 'Revise the AI output, run the checks, and submit only after they pass.' });
      return;
    }
    if (progress.solved) { setToast('This case is already closed.'); return; }
    setRecord(current => ({ ...current, xp: current.xp + 50, progress: { ...current.progress, [caseId]: { ...progress, solved: true } } }));
    setLastResult({ type: 'success', title: 'Case closed', body: 'The fix passed review. Your progress and points have been saved.' });
    setToast('Case closed · +50 XP');
  }

  async function requestHint(tier) {
    setHintLoading(true);
    setHint({ tier, text: 'The lead detective is reviewing the evidence…', source: 'AI' });
    try {
      const response = await fetch('/api/coach', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'hint', caseId, question: selectedCase.hints[tier - 1], hintTier: tier, learnerLevel: record.level }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.code || 'AI_UNAVAILABLE');
      setHint({ tier, text: data.reply, source: 'OpenRouter' });
    } catch {
      setHint({ tier, text: selectedCase.hints[tier - 1], source: 'Offline hint' });
    } finally { setHintLoading(false); }
  }

  async function sendChat(event) {
    event.preventDefault();
    const question = chatInput.trim();
    if (!question) return;
    setChatInput('');
    setChatMessages(messages => [...messages, { role: 'user', text: question }]);
    try {
      const response = await fetch('/api/coach', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'chat', caseId, question, learnerLevel: record.level }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.code || 'AI_UNAVAILABLE');
      setChatMessages(messages => [...messages, { role: 'assistant', text: data.reply }]);
    } catch {
      setChatMessages(messages => [...messages, { role: 'assistant', text: 'The lead detective is offline. Review the request, then ask: which users are affected by this change?' }]);
    }
  }

  async function generateCase(event) {
    event.preventDefault();
    setGeneratorLoading(true);
    setGeneratorResult('');
    try {
      const response = await fetch('/api/coach', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'generate', topic: generatorTopic, learningGoal: generatorGoal, learnerLevel: record.level }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.code || 'AI_UNAVAILABLE');
      const raw = data.case;
      const customCase = {
        id: `custom-${Date.now()}`,
        number: `S0${builtInCases.length + (record.customCases?.length || 0) + 1}`,
        title: raw.title,
        subtitle: `${raw.dimension || 'AI CASE'} · Instructor draft`,
        dimension: raw.dimension || 'DISCERNMENT',
        briefing: raw.context,
        character: raw.proposal,
        conceptTitle: `Concept / ${raw.dimension || 'AI review'}`,
        concept: 'Read the requirements first. Identify which claim in the proposed output can be tested against evidence.',
        objective: raw.learningGoal || generatorGoal,
        quiz: {
          question: 'Which reason is best supported by the evidence?',
          choices: raw.reasons,
          correct: raw.correctReasonIndex,
          explanation: 'The strongest reason connects a specific piece of evidence to an observable risk.'
        },
        sourceTitle: raw.sourceLabel || 'Generated case evidence',
        sourceMeta: 'AI DRAFT · REVIEW REQUIRED',
        original: raw.before,
        ai: raw.aiOutput,
        initial: raw.aiOutput,
        safe: raw.safeResult || raw.safeAction,
        evidence: raw.evidence.map((item,index)=>({ id:`clue-${index+1}`, title:item.title, summary:item.excerpt, detail:item.detail, source:`Generated evidence · ${index+1}` })),
        hints: [raw.hint, raw.unsafeOutcome, raw.safeAction],
        commands: ['Review generated evidence', 'Edit the AI proposal', 'Run instructor acceptance check']
      };
      setRecord(current => ({ ...current, customCases: [...(current.customCases || []), customCase], progress: { ...current.progress, [customCase.id]: { stage: 0, evidence: [], answer: null, code: customCase.initial, runState: null, solved: false } } }));
      setCaseId(customCase.id);
      setView('workspace');
      setGeneratorOpen(false);
      setGeneratorResult(`Generated “${customCase.title}”. Opening the playable instructor draft.`);
      setToast('AI case draft generated');
      } catch (error) {
        setGeneratorResult(error.message === 'OPENROUTER_NOT_CONFIGURED' ? 'OPENROUTER_API_KEY is not configured in Vercel. Add it, redeploy, then try again.' : 'OpenRouter could not generate the case. No placeholder case was created. Try again later.');
    } finally { setGeneratorLoading(false); }
  }

  const pageLabel = navItems.find(item => item.id === view)?.title || 'Case Workspace';
  const nav = (
    <nav className="side-nav" aria-label="Primary navigation">
      {navItems.map(item => {
        const Icon = item.icon;
        return <button key={item.id} type="button" aria-current={view === item.id ? 'page' : undefined} onClick={() => setView(item.id)}><Icon /><span><span className="nav-title">{item.title}</span><span className="nav-subtitle">{item.subtitle}</span></span></button>;
      })}
    </nav>
  );

  return (
    <div className={cn('app-shell', theme === 'dark' && 'theme-dark')}>
      <div className="app-layout">
        <aside className="sidebar">
          <a className="sidebar-brand" href="/"><span className="brand-mark"><Search size={20} /></span><span><span className="brand-name">Code Review Bureau</span><span className="brand-subtitle">AI OUTPUT INVESTIGATION</span></span></a>
          <div className="sidebar-user"><span className="user-avatar" aria-hidden="true">D</span><span className="user-identity"><span className="user-name">Detective</span><span className="user-meta">Junior reviewer</span></span></div>
          <div className="side-label">Bureau desk</div>{nav}
          <div className="sidebar-bottom"><div className="sidebar-xp"><span>CASE POINTS</span><span>{record.xp} XP</span></div><Progress value={Math.min(100, record.xp % 100)} className="mt-2" aria-label={`Case points: ${record.xp}`} /><div className="version-label">FIELD NOTES · V1.4</div></div>
        </aside>

        <div className="app-main">
          <header className="topbar"><div className="breadcrumb"><span>Bureau</span><ChevronRight size={14} /><strong>{pageLabel}</strong>{view === 'workspace' && <><ChevronRight size={14} /><strong>{selectedCase.number}</strong></>}</div><div className="topbar-tools"><span className="progress-indicator"><span>CASES</span><strong>{completedCount} / {builtInCases.length}</strong></span><Button variant="outline" size="icon" className="theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>{theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}</Button></div></header>

          <main className="page-content">
            {view === 'cases' && <>
              <div className="page-heading"><div><div className="page-kicker">CASE FILES / ACTIVE</div><h1>Case Files</h1><p>Read the briefing. Review the change PatchBot left behind.</p></div><Button onClick={() => setGeneratorOpen(true)}><Code2 size={16} /> New case</Button></div>
              <div className="case-grid">{builtInCases.map((item,index) => <CaseCard key={item.id} item={item} progress={record.progress[item.id]} locked={index>0&&!unlocked(item)} onOpen={() => openCase(item)} />)}</div>
              <Card className="mt-4 p-4"><div className="flex items-center justify-between gap-4"><div><div className="card-label"><History /> FIELD LOG</div><p className="mt-2 text-sm text-[var(--muted)]">Progress is stored on this device. {completedCount} cases closed · {record.xp} XP.</p></div><Button variant="outline" onClick={() => setView('vault')}>View log <ArrowRight size={15} /></Button></div></Card>
            </>}

            {view === 'workspace' && <>
              <div className="workspace-header"><Button variant="ghost" className="back-button" onClick={() => setView('cases')}><ArrowLeft size={16} /> All cases</Button><div className="workspace-title"><div className="page-kicker">{selectedCase.number} · {selectedCase.dimension}</div><h1>{selectedCase.title}</h1><p>{selectedCase.subtitle}</p></div><Badge variant={progress.solved ? 'success' : 'warning'}>{progress.solved ? 'CLOSED' : stageName.toUpperCase()}</Badge></div>
              <Tabs value={String(progress.stage)} onValueChange={value => changeStage(Number(value))} className="stage-tabs">
                <TabsList className="stage-tab-list" aria-label="Learning progress">
                  {['Learn','Check','Investigate'].map((name,index)=><TabsTrigger key={name} value={String(index)} disabled={index>progress.stage} className="stage-trigger"><span className="stage-num">0{index+1}</span>{name}</TabsTrigger>)}
                </TabsList>
                <TabsContent value="0"><StageCards item={selectedCase} /><Card className="p-5"><div className="flex flex-wrap items-center justify-between gap-4"><div><div className="card-label"><BookOpen /> LEARN / CASE BRIEF</div><p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--muted)]">{selectedCase.briefing}</p><blockquote className="mt-4 border-l-2 border-[var(--gold)] pl-4 text-sm italic">{selectedCase.character}</blockquote></div><Button onClick={() => changeStage(1)}>Read briefing · Start check <ArrowRight size={15} /></Button></div></Card></TabsContent>
                <TabsContent value="1"><StageCards item={selectedCase} /><Card className="mx-auto max-w-3xl p-5"><div className="card-label"><CircleHelp /> CHECK / QUICK REVIEW</div><h2 className="mt-3 text-lg font-bold">{selectedCase.quiz.question}</h2><div className="mt-4 grid gap-2">{selectedCase.quiz.choices.map((choice,index)=><button key={choice} type="button" aria-pressed={progress.answer===index} onClick={()=>chooseAnswer(index)} className={cn('min-h-12 rounded-md border px-4 py-3 text-left text-sm transition-colors',progress.answer===index?'border-[var(--accent)] bg-[var(--accent-soft)]':'border-[var(--line)] bg-[var(--surface)] hover:border-[var(--accent)]')}>{choice}</button>)}</div>{progress.answer!==null&&<ResultBanner type={progress.answer===selectedCase.quiz.correct?'success':'error'} title={progress.answer===selectedCase.quiz.correct?'Correct':`Review the concept · ${selectedCase.quiz.explanation}`} />}{progress.answer===selectedCase.quiz.correct&&<Button className="mt-4" onClick={()=>changeStage(2)}>Open evidence workspace <ArrowRight size={15} /></Button>}</Card></TabsContent>
                <TabsContent value="2"><StageCards item={selectedCase} /><div className="challenge-grid"><EvidenceBoard item={selectedCase} progress={progress} onToggle={id=>{const evidence=progress.evidence.includes(id)?progress.evidence.filter(value=>value!==id):[...progress.evidence,id];patchProgress({evidence});}} runState={progress.runState} onOpenSchema={()=>setSchemaOpen(true)} /><div className="terminal-panel"><Card className="terminal-panel"><div className="panel-titlebar"><div><h2>Review workspace</h2><p>Edit the AI proposal, run checks, then submit your fix.</p></div><Badge variant={progress.runState==='success'?'success':progress.runState==='error'?'error':'muted'}>{progress.runState==='success'?'TEST PASS':progress.runState==='error'?'TEST FAIL':'READY'}</Badge></div><Terminal item={selectedCase} value={progress.code} onChange={code=>patchProgress({code,runState:null})} runState={progress.runState} onRun={runCode} onHint={()=>requestHint(1)} onSubmit={submitCase} canRun={progress.evidence.length===selectedCase.evidence.length} solved={progress.solved} />{lastResult&&<ResultBanner type={lastResult.type} title={lastResult.title} body={lastResult.body} />}</Card><HintPanel hint={hint} loading={hintLoading} onAsk={requestHint} /></div></div></TabsContent>
              </Tabs>
            </>}

            {view === 'vault' && <SimplePage title="Evidence Vault" kicker="EVIDENCE / COLLECTED" description="Exhibits and test results collected during your investigations." icon={Archive}><div className="grid gap-3">{builtInCases.flatMap(item=>(record.progress[item.id]?.evidence||[]).map(id=>({item,evidence:item.evidence.find(row=>row.id===id)}))).map(({item,evidence})=><Card key={`${item.id}-${evidence.id}`} className="p-4"><Badge variant="gold">{item.number}</Badge><h2 className="mt-2 text-sm font-bold">{evidence.title}</h2><p className="mt-1 text-sm text-[var(--muted)]">{evidence.detail}</p><p className="mt-2 font-mono text-[10px] text-[var(--muted)]">{evidence.source}</p></Card>)}{completedCount===0&&<EmptyState icon={Archive} title="No evidence collected yet" body="Open a case and inspect its exhibits to start the record." action={()=>setView('cases')} actionLabel="Go to case files" />}</div></SimplePage>}
            {view === 'academy' && <SimplePage title="Field Manual" kicker="FIELD MANUAL / CONCEPTS" description="Review the concept before applying it to a case." icon={GraduationCap}><div className="case-grid">{[{title:'Read a diff',body:'Red lines are removed and green lines are added. Then ask whether the change still meets the original request.'},{title:'Shared history and revert',body:'When a pushed commit is shared, revert adds an inverse change without rewriting team history.'},{title:'Pull request review',body:'Push a new commit to the PR source branch to update its existing review and checks.'}].map((item,index)=><Card key={item.title} className="p-4"><div className="card-label"><BookOpen /> FIELD NOTE 0{index+1}</div><h2 className="mt-3 text-base font-bold">{item.title}</h2><p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{item.body}</p></Card>)}</div></SimplePage>}
            {view === 'instructor' && <SimplePage title="Instructor Desk" kicker="CLASSROOM / REVIEW ACTIVITY" description="Track participation and turn learning goals into review cases." icon={Users}><div className="case-summary"><Card className="summary-card"><div className="card-label"><Users /> CLASS ROSTER</div><h2 className="mt-2">COMP5241 · 24 learners</h2><div className="mt-4 grid gap-3"><RosterRow name="Taylor Chen" activity="Closed: The Missing Accessible Name" value={100} /><RosterRow name="Mina Huang" activity="Investigating: The Vanishing Commit" value={62} /><RosterRow name="Jamie Li" activity="Collected 1 / 2 exhibits" value={38} /><RosterRow name="Alex Chang" activity="Not started" value={0} /></div></Card><Card className="summary-card"><div className="card-label"><ClipboardCheck /> PARTICIPATION</div><h2 className="mt-2">This week</h2><p>19 / 24 learners have an investigation record</p><Progress value={79} className="mt-4" /><div className="mt-3 flex justify-between text-xs text-[var(--muted)]"><span>Case completion</span><strong className="font-mono text-[var(--ink)]">79%</strong></div><Button className="mt-5" onClick={()=>setGeneratorOpen(true)}><Code2 size={15} /> New case</Button></Card></div></SimplePage>}
            {view === 'badges' && <SimplePage title="Investigation Record" kicker="BUREAU LOG / PROGRESS" description="Case progress and review outcomes." icon={Trophy}><div className="case-summary"><Card className="summary-card"><div className="card-label"><CheckCircle2 /> CASE COMPLETION</div><h2 className="mt-2">{completedCount} / {builtInCases.length} cases closed</h2><Progress value={completedCount/builtInCases.length*100} className="mt-4" /></Card><Card className="summary-card"><div className="card-label"><Trophy /> TOTAL POINTS</div><h2 className="mt-2">{record.xp} XP</h2><p>Points are saved on this device.</p></Card></div></SimplePage>}
            {view === 'assistant' && <SimplePage title="Lead Detective" kicker="AI ASSISTANT / ASK FOR A NUDGE" description="Ask a specific question. Hints will not choose the answer for you." icon={Bot}><Card className="max-w-3xl"><div className="assistant-log" aria-live="polite">{chatMessages.length===0?<EmptyState icon={Bot} title="The lead detective is ready" body="Ask about an exhibit, command, or test result. No need to repeat the whole case." />:chatMessages.map((message,index)=><div key={index} className={cn('assistant-message',message.role==='user'&&'user')}>{message.text}</div>)}</div><form className="assistant-composer" onSubmit={sendChat}><input value={chatInput} onChange={event=>setChatInput(event.target.value)} placeholder="For example: Why avoid force push?" aria-label="Ask the lead detective" /><Button type="submit" aria-label="Send question"><Send size={16} /></Button></form></Card></SimplePage>}
          </main>
        </div>
      </div>

      <nav className="mobile-nav" aria-label="Mobile navigation">{[navItems[0],navItems[1],navItems[2],navItems[3],navItems[5]].map(item=>{const Icon=item.icon;return <button key={item.id} type="button" aria-current={view===item.id?'page':undefined} onClick={()=>setView(item.id)}><Icon /><span>{item.title}</span></button>;})}</nav>

      <Dialog open={generatorOpen} onOpenChange={setGeneratorOpen}><DialogContent><DialogTitle>Draft a case</DialogTitle><DialogDescription>Enter a topic and learning goal. OpenRouter will draft exhibits and an AI proposal for instructor review.</DialogDescription><form className="mt-5 grid gap-3" onSubmit={generateCase}><label className="grid gap-1 text-xs font-semibold">Case topic<input className="h-10 rounded border border-[var(--line)] bg-[var(--surface)] px-3 text-sm" value={generatorTopic} onChange={event=>setGeneratorTopic(event.target.value)} required placeholder="For example: AI misses empty input validation" /></label><label className="grid gap-1 text-xs font-semibold">Learning goal<textarea className="min-h-20 rounded border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm" value={generatorGoal} onChange={event=>setGeneratorGoal(event.target.value)} placeholder="What evidence should learners use to find the issue?" /></label><Button type="submit" disabled={generatorLoading||!generatorTopic.trim()}>{generatorLoading?'Generating…':'Generate case'}</Button>{generatorResult&&<ResultBanner type={generatorResult.includes('OPENROUTER_API_KEY')||generatorResult.includes('OpenRouter')?'warning':'success'} title={generatorResult} />}</form></DialogContent></Dialog>

      <Dialog open={schemaOpen} onOpenChange={setSchemaOpen}><DialogContent><DialogTitle>Case schema</DialogTitle><DialogDescription>Tables referenced in the source material.</DialogDescription><div className="mt-4 grid gap-2">{['users(id, name, role)','sessions(user_id, started_at)','pull_requests(branch, status)'].map(table=><div key={table} className="rounded border border-[var(--line)] bg-[var(--background)] px-3 py-2 font-mono text-xs">{table}</div>)}</div></DialogContent></Dialog>
      {toast&&<div className="toast" role="status">{toast}</div>}
    </div>
  );
}

function EvidenceBoard({ item, progress, onToggle, runState, onOpenSchema }) {
  return <Card className="evidence-panel"><div className="panel-titlebar"><div><h2>Evidence board</h2><p>{item.sourceTitle}</p></div><Button variant="outline" size="sm" onClick={onOpenSchema}><Database size={14} /> Schema</Button></div><div className="evidence-sources"><span className="evidence-source"><FileSearch /> REQUIREMENTS</span><span className="evidence-source"><GitBranch /> GIT LOG</span><span className="evidence-source"><ClipboardCheck /> TEST REPORT</span></div><div className="diff-viewer"><div className="diff-column"><div className="diff-header"><span>REQUIREMENT / BEFORE</span><span>{item.sourceMeta}</span></div><pre className="code-block">{item.original}</pre></div><div className="diff-column"><div className="diff-header"><span>PATCHBOT / PROPOSED</span><span>AI OUTPUT</span></div><pre className="code-block ai">{item.ai}</pre></div></div><div className="diagram-wrap"><div className="diagram-label"><span>BRANCH GRAPH / SIMULATION</span><Badge variant={runState==='error'?'error':runState==='success'?'success':'muted'}>{runState==='error'?'DIVERGED':runState==='success'?'VERIFIED':'WAITING'}</Badge></div><BranchGraph caseId={item.id} runState={runState} /></div><div className="evidence-checks">{item.evidence.map(evidence=>{const checked=progress.evidence.includes(evidence.id);return <button key={evidence.id} type="button" className="evidence-check" aria-pressed={checked} onClick={()=>onToggle(evidence.id)}><FileSearch /><span className="evidence-copy"><strong>{evidence.title}</strong><small>{checked?evidence.detail:evidence.summary}</small></span><span className="evidence-read">{checked?'READ ✓':'OPEN'}</span></button>;})}</div><div className="objective-banner"><strong>Objective</strong>{item.objective}</div></Card>;
}

function Terminal({ item, value, onChange, runState, onRun, onHint, onSubmit, canRun, solved }) {
  const lineCount = Math.max(1,value.split('\n').length);
  return <div className="terminal"><div className="terminal-header"><span className="terminal-title"><span className="terminal-dot" /> REVIEW_TERMINAL / {item.number}</span><span className="terminal-status">{runState==='success'?'PASS':runState==='error'?'FAIL':'READY'}</span></div><div className="terminal-input-wrap"><div className="line-numbers" aria-hidden="true">{Array.from({length:Math.max(8,lineCount)},(_,i)=><div key={i}>{i+1}</div>)}</div><textarea spellCheck="false" value={value} onChange={event=>onChange(event.target.value)} aria-label="Edit the AI patch or command" /></div><div className="terminal-footer"><Button variant="ghost" className="hint-inline text-[var(--code-ink)] hover:bg-white/10 hover:text-white" onClick={onHint}><Lightbulb size={14} /> Hint</Button><span className="spacer" /><Button variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10" onClick={onRun} disabled={!canRun}><Play size={14} /> Run</Button><Button variant="gold" onClick={onSubmit} disabled={solved}><Check size={15} /> Submit</Button></div></div>;
}

function HintPanel({ hint, loading, onAsk }) {
  return <Card className="hint-panel"><div className="panel-titlebar"><div><h2>Hint panel</h2><p>Tiered hints. You choose how much to reveal.</p></div><Lightbulb size={16} /></div><div className="hint-buttons">{[1,2,3].map(tier=><Button key={tier} variant="outline" size="sm" onClick={()=>onAsk(tier)} disabled={loading}>Nudge {tier}</Button>)}</div>{hint&&<div className="hint-output"><div className="mb-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider"><span>{hint.source} · TIER {hint.tier}</span><span>NO COST</span></div>{hint.text}</div>}</Card>;
}

function RosterRow({ name, activity, value }) {
  return <div className="grid grid-cols-[30px_minmax(0,1fr)_55px] items-center gap-3 border-t border-[var(--line)] pt-3"><span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--accent-soft)] text-xs font-bold text-[var(--accent)]">{name.slice(0,1)}</span><span className="min-w-0"><strong className="block text-xs">{name}</strong><small className="block truncate text-[10px] text-[var(--muted)]">{activity}</small><Progress value={value} className="mt-1.5 h-1.5" /></span><Badge variant={value===0?'muted':value>=80?'success':'warning'}>{value}%</Badge></div>;
}

function ResultBanner({ type, title, body }) {
  const Icon=type==='success'?CheckCircle2:type==='error'?XCircle:ShieldAlert;
  return <div className={cn('run-result',type)} role="status"><Icon /><span><strong>{title}</strong>{body&&<><br />{body}</>}</span></div>;
}

function SimplePage({ title, kicker, description, icon: Icon, children }) {
  return <><div className="page-heading"><div><div className="page-kicker">{kicker}</div><h1>{title}</h1><p>{description}</p></div><Icon size={25} className="text-[var(--accent)]" /></div>{children}</>;
}

function EmptyState({ icon: Icon, title, body, action, actionLabel }) {
  return <div className="empty-state"><Icon /><strong>{title}</strong><div className="mt-1">{body}</div>{action&&<Button variant="outline" className="mt-3" onClick={action}>{actionLabel}</Button>}</div>;
}

export default App;