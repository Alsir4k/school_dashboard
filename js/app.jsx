const { useState, useMemo, useEffect } = React;

// --- Icons as inline SVG components (replacing Lucide) ---
const Icon = ({ d, size = 24, className = '', strokeWidth = 2 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
    className={className}>
    {d}
  </svg>
);

const LayoutDashboardIcon = (p) => <Icon {...p} d={<><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></>}/>;
const FileTextIcon = (p) => <Icon {...p} d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></>}/>;
const CheckCircleIcon = (p) => <Icon {...p} d={<><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>}/>;
const ClockIcon = (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>}/>;
const AlertCircleIcon = (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>}/>;
const SearchIcon = (p) => <Icon {...p} d={<><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>}/>;
const UsersIcon = (p) => <Icon {...p} d={<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>}/>;
const TargetIcon = (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></>}/>;
const TrophyIcon = (p) => <Icon {...p} d={<><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 22V13"/><path d="M14 22V13"/><path d="M8 13h8a4 4 0 0 0 4-4V4H4v5a4 4 0 0 0 4 4Z"/></>}/>;
const LinkIcon = (p) => <Icon {...p} d={<><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>}/>;
const ExternalLinkIcon = (p) => <Icon {...p} d={<><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></>}/>;
const Trash2Icon = (p) => <Icon {...p} d={<><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></>}/>;
const ChevronDownIcon = (p) => <Icon {...p} d={<polyline points="6 9 12 15 18 9"/>}/>;
const ChevronUpIcon = (p) => <Icon {...p} d={<polyline points="18 15 12 9 6 15"/>}/>;

// --- Main App ---
const App = () => {
    const [docStatus, setDocStatus] = useState(() => {
        const s = localStorage.getItem('school_doc_status_v3');
        return s ? JSON.parse(s) : {};
    });
    const [docLinks, setDocLinks] = useState(() => {
        const s = localStorage.getItem('school_doc_links_v3');
        return s ? JSON.parse(s) : {};
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'pending' | 'completed'
    const [selectedDomain, setSelectedDomain] = useState(window.schoolData[0]?.name || '');
    const [expandedIndicator, setExpandedIndicator] = useState(null);
    const [editingLink, setEditingLink] = useState(null);
    const [tempLink, setTempLink] = useState('');

    // Persist changes
    useEffect(() => { localStorage.setItem('school_doc_status_v3', JSON.stringify(docStatus)); }, [docStatus]);
    useEffect(() => { localStorage.setItem('school_doc_links_v3', JSON.stringify(docLinks)); }, [docLinks]);

    // Flatten data for easier processing
    const flatData = useMemo(() => {
        const result = [];
        window.schoolData.forEach((domain, dIdx) => {
            domain.standards.forEach((std, sIdx) => {
                std.indicators.forEach((ind, iIdx) => {
                    result.push({
                        ...ind,
                        domain: domain.name,
                        standard: std.name,
                        dIdx, sIdx, iIdx,
                        key: `${dIdx}-${sIdx}-${iIdx}`,
                    });
                });
            });
        });
        return result;
    }, []);

    // Domain list
    const domains = useMemo(() => window.schoolData.map(d => d.name), []);

    // Statistics
    const stats = useMemo(() => {
        const totalIndicators = flatData.length;
        const totalDocs = flatData.reduce((acc, ind) => acc + ind.documents.length, 0);
        const completedDocs = Object.values(docStatus).filter(s => s === 'completed').length;
        const remainingDocs = totalDocs - completedDocs;
        const overallProgress = totalDocs > 0 ? Math.round((completedDocs / totalDocs) * 100) : 0;

        // Per-domain stats
        const domainStats = window.schoolData.map(domain => {
            const domainInds = flatData.filter(ind => ind.domain === domain.name);
            const total = domainInds.reduce((acc, ind) => acc + ind.documents.length, 0);
            const completed = domainInds.reduce((acc, ind) =>
                acc + ind.documents.filter((_, dIdx) => docStatus[`${ind.key}-${dIdx}`] === 'completed').length, 0);
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
            return { name: domain.name, total, completed, pct };
        });

        return { totalIndicators, totalDocs, completedDocs, remainingDocs, overallProgress, domainStats };
    }, [flatData, docStatus]);

    // Per-indicator progress
    const getProgress = (ind) => {
        if (!ind.documents.length) return 0;
        const completed = ind.documents.filter((_, dIdx) => docStatus[`${ind.key}-${dIdx}`] === 'completed').length;
        return Math.round((completed / ind.documents.length) * 100);
    };

    // Filtered and grouped by standard
    const filteredByStandard = useMemo(() => {
        const domainData = flatData.filter(ind => ind.domain === selectedDomain);
        const searched = domainData.filter(ind => {
            // Text search
            const matchesText = !searchTerm ||
                ind.text.includes(searchTerm) ||
                ind.number.includes(searchTerm) ||
                ind.standard.includes(searchTerm);
            if (!matchesText) return false;

            // Indicator-level status filter
            if (filterStatus !== 'all' && ind.documents.length > 0) {
                const completedCount = ind.documents.filter((_, dIdx) =>
                    docStatus[`${ind.key}-${dIdx}`] === 'completed'
                ).length;
                const pendingCount = ind.documents.length - completedCount;

                // "مكتملة": hide indicator if it has NO completed docs
                if (filterStatus === 'completed' && completedCount === 0) return false;
                // "لم تبدأ": hide indicator if ALL docs are completed (nothing pending)
                if (filterStatus === 'pending' && pendingCount === 0) return false;
            }
            return true;
        });
        const grouped = {};
        searched.forEach(ind => {
            if (!grouped[ind.standard]) grouped[ind.standard] = [];
            grouped[ind.standard].push(ind);
        });
        return grouped;
    }, [flatData, selectedDomain, searchTerm, filterStatus, docStatus]);

    return (
        <div className="min-h-screen bg-slate-50 text-right pb-20" dir="rtl" style={{ fontFamily: "'Tajawal', sans-serif" }}>

            {/* Navigation */}
            <nav className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-md">
                            <LayoutDashboardIcon size={22} />
                        </div>
                        <span className="font-black text-xl text-slate-800">التقويم المدرسي</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <a href="visitor.html"
                           className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-bold transition-all border border-blue-100">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                            </svg>
                            <span className="hidden sm:inline">عرض الزوار</span>
                        </a>
                        <button
                            onClick={() => {
                                if (window.confirm('هل أنت متأكد من مسح جميع بيانات الإنجاز؟')) {
                                    setDocStatus({});
                                    setDocLinks({});
                                }
                            }}
                            className="flex items-center gap-2 text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                        >
                            <Trash2Icon size={16} /> <span className="hidden sm:inline">مسح البيانات</span>
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-4 sm:p-6 md:p-10">

                {/* KPI Cards — 4 counters */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4">
                    {/* Total Indicators */}
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                            <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl"><TargetIcon size={20} /></div>
                            <span className="text-3xl font-black text-slate-800">{stats.totalIndicators}</span>
                        </div>
                        <p className="font-bold text-slate-400 text-sm">إجمالي المؤشرات</p>
                    </div>
                    {/* Total Docs */}
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                            <div className="bg-indigo-50 text-indigo-600 p-3 rounded-2xl"><FileTextIcon size={20} /></div>
                            <span className="text-3xl font-black text-slate-800">{stats.totalDocs}</span>
                        </div>
                        <p className="font-bold text-slate-400 text-sm">إجمالي الوثائق</p>
                    </div>
                    {/* Completed Docs */}
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl"><CheckCircleIcon size={20} /></div>
                            <span className="text-3xl font-black text-slate-800">{stats.completedDocs}</span>
                        </div>
                        <p className="font-bold text-slate-400 text-sm">الوثائق المجهزة</p>
                    </div>
                    {/* Remaining Docs */}
                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                            <div className="bg-orange-50 text-orange-500 p-3 rounded-2xl"><ClockIcon size={20} /></div>
                            <span className="text-3xl font-black text-slate-800">{stats.remainingDocs}</span>
                        </div>
                        <p className="font-bold text-slate-400 text-sm">الوثائق المتبقية</p>
                    </div>
                </div>

                {/* Overall Progress Card */}
                <div className="bg-blue-600 text-white p-6 sm:p-8 rounded-3xl shadow-lg shadow-blue-200 mb-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
                    <div className="relative z-10">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-3 rounded-2xl"><TrophyIcon size={24} /></div>
                                <div>
                                    <p className="font-bold opacity-80 text-sm">نسبة الإنجاز الكلي</p>
                                    <p className="text-4xl font-black">{stats.overallProgress}%</p>
                                </div>
                            </div>
                            <div className="text-left">
                                <p className="opacity-70 text-xs mb-1">الملفات المنجزة</p>
                                <p className="text-2xl font-black">
                                    {stats.completedDocs}
                                    <span className="text-white/50 font-medium text-lg"> / {stats.totalDocs}</span>
                                </p>
                            </div>
                        </div>
                        {/* Big progress bar */}
                        <div className="w-full h-4 bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white rounded-full transition-all duration-1000"
                                style={{ width: `${stats.overallProgress}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-xs opacity-60 mt-1.5">
                            <span>0</span>
                            <span>{stats.totalDocs} وثيقة</span>
                        </div>
                    </div>
                </div>

                {/* Domain Progress */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-10">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                        <h3 className="font-black text-slate-700">التقدم حسب المجالات</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                        {stats.domainStats.map(d => (
                            <div key={d.name}>
                                <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-sm font-bold text-slate-600 truncate ml-2">{d.name}</span>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="text-xs text-slate-400">{d.completed}/{d.total}</span>
                                        <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${
                                            d.pct === 100 ? 'bg-emerald-50 text-emerald-600'
                                            : d.pct > 0   ? 'bg-blue-50 text-blue-600'
                                            : 'bg-slate-100 text-slate-400'
                                        }`}>{d.pct}%</span>
                                    </div>
                                </div>
                                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-700 ${
                                            d.pct === 100 ? 'bg-emerald-500' : 'bg-blue-500'
                                        }`}
                                        style={{ width: `${d.pct}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Domain Tabs */}
                <div className="flex flex-wrap gap-2 mb-8 pb-2">
                    {domains.map(domain => (
                        <button
                            key={domain}
                            onClick={() => { setSelectedDomain(domain); setExpandedIndicator(null); }}
                            className={`px-5 sm:px-7 py-3 rounded-2xl font-bold whitespace-nowrap transition-all text-sm ${
                                selectedDomain === domain
                                    ? 'bg-slate-800 text-white shadow-lg'
                                    : 'bg-white text-slate-500 hover:bg-slate-100 shadow-sm border border-slate-100'
                            }`}
                        >
                            {domain}
                        </button>
                    ))}
                </div>

                {/* Search + Status Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-10 items-start sm:items-center">
                    <div className="relative flex-1 max-w-2xl w-full">
                        <SearchIcon size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="ابحث برقم المؤشر أو نص المعيار أو اسم الوثيقة..."
                            className="w-full pr-14 pl-6 py-4 rounded-2xl bg-white border border-slate-100 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {/* Status Filter Pills */}
                    <div className="flex gap-2 bg-white border border-slate-100 shadow-sm p-1.5 rounded-2xl shrink-0">
                        {[
                            { v: 'all',       label: 'الكل',      cls: 'bg-slate-800 text-white' },
                            { v: 'pending',   label: 'لم تبدأ',   cls: 'bg-slate-200 text-slate-700' },
                            { v: 'completed', label: '✓ مكتملة',  cls: 'bg-emerald-500 text-white' },
                        ].map(({ v, label, cls }) => (
                            <button
                                key={v}
                                onClick={() => setFilterStatus(v)}
                                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                                    filterStatus === v ? cls : 'text-slate-400 hover:bg-slate-50'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-12">
                    {Object.entries(filteredByStandard).map(([standard, indicators]) => (
                        <section key={standard}>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-2 h-8 bg-blue-600 rounded-full" />
                                <h2 className="text-2xl font-black text-slate-800">{standard}</h2>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {indicators.map(ind => {
                                    const prog = getProgress(ind);
                                    const isExpanded = expandedIndicator === ind.key;

                                    return (
                                        <div
                                            key={ind.key}
                                            className={`bg-white rounded-[2rem] border-2 transition-all duration-300 ${
                                                isExpanded
                                                    ? 'border-blue-500 shadow-xl'
                                                    : 'border-slate-100 shadow-sm hover:border-slate-200'
                                            }`}
                                        >
                                            {/* Indicator Header */}
                                            <div
                                                className="p-6 sm:p-8 cursor-pointer"
                                                onClick={() => setExpandedIndicator(isExpanded ? null : ind.key)}
                                            >
                                                <div className="flex justify-between items-center mb-4">
                                                    <span className="text-xs font-mono text-slate-400 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">{ind.number}</span>
                                                    <span className="text-sm font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">{prog}%</span>
                                                </div>
                                                <h3 className="text-base font-bold text-slate-700 leading-relaxed mb-6">{ind.text}</h3>
                                                <div className="w-full h-2 bg-slate-100 rounded-full mb-6 overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-600 transition-all duration-700 rounded-full"
                                                        style={{ width: `${prog}%` }}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    {ind.responsible ? (
                                                        <span className="flex items-center gap-2 text-slate-500 font-medium truncate ml-3">
                                                            <UsersIcon size={15} className="text-slate-400 shrink-0" />
                                                            <span className="truncate">{ind.responsible.split('–')[0]}</span>
                                                        </span>
                                                    ) : <span />}
                                                    <span className="shrink-0 flex items-center gap-1.5 text-blue-600 font-bold bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors">
                                                        {isExpanded
                                                            ? <><ChevronUpIcon size={16}/> إخفاء</>
                                                            : <><ChevronDownIcon size={16}/> عرض الوثائق ({ind.documents.length})</>
                                                        }
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Expanded Documents */}
                                            {isExpanded && (
                                                <div className="px-6 sm:px-8 pb-8 space-y-3 border-t border-slate-100 pt-6 bg-slate-50/50 rounded-b-[2rem]">
                                                    <h4 className="text-sm font-bold text-slate-400 mb-4 flex items-center gap-2">
                                                        <FileTextIcon size={15} /> قائمة الوثائق المطلوبة ({ind.documents.length}):
                                                    </h4>

                                                    {/* Select All */}
                                                    {ind.documents.length > 1 && (
                                                        <div className="flex justify-end mb-2">
                                                            <button
                                                                onClick={() => {
                                                                    const allDone = ind.documents.every((_, dIdx) => docStatus[`${ind.key}-${dIdx}`] === 'completed');
                                                                    const newStatus = { ...docStatus };
                                                                    ind.documents.forEach((_, dIdx) => {
                                                                        newStatus[`${ind.key}-${dIdx}`] = allDone ? 'pending' : 'completed';
                                                                    });
                                                                    setDocStatus(newStatus);
                                                                }}
                                                                className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                                                            >
                                                                {ind.documents.every((_, dIdx) => docStatus[`${ind.key}-${dIdx}`] === 'completed') ? '✕ إلغاء تحديد الكل' : '✓ تحديد الكل'}
                                                            </button>
                                                        </div>
                                                    )}

                                                    {ind.documents.map((doc, dIdx) => {
                                                        // Apply status filter
                                                        const _docKey = `${ind.key}-${dIdx}`;
                                                        const _docStatus = docStatus[_docKey] || 'pending';
                                                        if (filterStatus !== 'all' && _docStatus !== filterStatus) return null;
                                                        const docKey = `${ind.key}-${dIdx}`;
                                                        const status = docStatus[docKey] || 'pending';
                                                        const isEditingThisLink = editingLink === docKey;
                                                        const hasLink = !!docLinks[docKey];

                                                        return (
                                                            <div
                                                                key={docKey}
                                                                className={`flex flex-col gap-2 p-4 bg-white rounded-2xl border transition-all ${
                                                                    status === 'completed'
                                                                        ? 'border-green-100'
                                                                        : 'border-slate-100'
                                                                } shadow-sm`}
                                                            >
                                                                <div className="flex items-center justify-between flex-wrap gap-3">
                                                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                        <span className={`text-sm leading-relaxed ${status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-700 font-medium'}`}>
                                                                            {doc}
                                                                        </span>
                                                                        {hasLink && !isEditingThisLink && (
                                                                            <a
                                                                                href={docLinks[docKey]}
                                                                                target="_blank"
                                                                                rel="noreferrer"
                                                                                onClick={e => e.stopPropagation()}
                                                                                className="shrink-0 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg flex items-center gap-1 text-xs font-bold transition-colors"
                                                                                title="فتح الوثيقة"
                                                                            >
                                                                                <ExternalLinkIcon size={12} /> عرض
                                                                            </a>
                                                                        )}
                                                                    </div>

                                                                    <div className="flex gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-100 shrink-0">
                                                                        {/* Link button */}
                                                                        <button
                                                                            onClick={e => {
                                                                                e.stopPropagation();
                                                                                setEditingLink(isEditingThisLink ? null : docKey);
                                                                                setTempLink(docLinks[docKey] || '');
                                                                            }}
                                                                            className={`p-2.5 rounded-lg transition-all ${isEditingThisLink || hasLink ? 'text-blue-600 bg-white shadow-sm' : 'text-slate-400 hover:text-blue-500 hover:bg-white'}`}
                                                                            title="إضافة أو تعديل الرابط"
                                                                        >
                                                                            <LinkIcon size={16} />
                                                                        </button>
                                                                        <div className="w-px bg-slate-200 mx-0.5" />
                                                                        {/* Status buttons */}
                                                                        {[
                                                                            { s: 'pending', Icon: AlertCircleIcon, label: 'لم تُجهَّز', active: 'bg-slate-200 text-slate-600' },
                                                                            { s: 'completed', Icon: CheckCircleIcon, label: 'مجهزة', active: 'bg-emerald-500 text-white shadow-md' },
                                                                        ].map(({ s, Icon: BtnIcon, label, active }) => (
                                                                            <button
                                                                                key={s}
                                                                                onClick={e => { e.stopPropagation(); setDocStatus(p => ({ ...p, [docKey]: s })); }}
                                                                                className={`p-2.5 rounded-lg transition-all ${status === s ? active : 'text-slate-300 hover:bg-white hover:text-slate-500'}`}
                                                                                title={label}
                                                                            >
                                                                                <BtnIcon size={16} />
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                                {/* Link editor */}
                                                                {isEditingThisLink && (
                                                                    <div className="flex flex-col sm:flex-row items-stretch gap-2 mt-2 pt-3 border-t border-slate-100">
                                                                        <input
                                                                            type="url"
                                                                            value={tempLink}
                                                                            onChange={e => setTempLink(e.target.value)}
                                                                            placeholder="https://drive.google.com/..."
                                                                            className="flex-1 p-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-left bg-slate-50 focus:bg-white transition-colors"
                                                                            dir="ltr"
                                                                        />
                                                                        <div className="flex gap-2">
                                                                            <button
                                                                                onClick={() => { setDocLinks(p => ({ ...p, [docKey]: tempLink })); setEditingLink(null); }}
                                                                                className="flex-1 sm:flex-none bg-blue-600 text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
                                                                            >حفظ</button>
                                                                            <button
                                                                                onClick={() => setEditingLink(null)}
                                                                                className="flex-1 sm:flex-none bg-white text-slate-500 border border-slate-200 px-5 py-3 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
                                                                            >إلغاء</button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    ))}

                    {Object.keys(filteredByStandard).length === 0 && (
                        <div className="text-center py-20">
                            <SearchIcon size={56} className="text-slate-200 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-400">لا توجد نتائج مطابقة لبحثك</h3>
                        </div>
                    )}
                </div>
            </main>

            <footer className="mt-16 text-center text-xs text-slate-400 pb-4">
                نظام التقويم المدرسي &copy; 1447 هـ
            </footer>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
