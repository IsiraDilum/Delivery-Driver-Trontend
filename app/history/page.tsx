import {
    ArrowRight,
    ChevronDown,
    ClipboardList,
    Clock3,
    Navigation,
    Package,
    Route as RouteIcon,
    SlidersHorizontal,
    Truck,
    UploadCloud,
} from 'lucide-react'

const metrics = [
    { label: 'Recent trips', value: '4', desc: '22–29 September', Icon: RouteIcon },
    { label: 'On-time rate', value: '92%', desc: '↗ 3% vs last week · sample', Icon: Clock3 },
    { label: 'Distance', value: '537 km', desc: 'Completed trips', Icon: Navigation },
    { label: 'Packages', value: '184', desc: 'Handed over', Icon: Package },
]

const trips = [
    { id: 'WD-R13', meta: '25 Sep 2026 · 6h 12m', stats: '7 stops     142 km', status: '100% on time' },
    { id: 'WD-R11', meta: '24 Sep 2026 · 4h 48m', stats: '5 stops     98 km', status: '80% on time' },
    { id: 'WD-R08', meta: '23 Sep 2026 · 7h 30m', stats: '9 stops     176 km', status: '89% on time' },
    { id: 'WD-R05', meta: '22 Sep 2026 · 5h 10m', stats: '6 stops     121 km', status: '100% on time' },
]

export default function HistoryPage() {
    return (
        <main className="content history-page">
            <div className="page-heading">
                <div>
                    <h1>Trip history</h1>
                    <p className="eyebrow">YOUR WORK, ALL IN ONE PLACE</p>
                </div>
                <button className="icon-button" aria-label="Filter">
                    <SlidersHorizontal size={24} />
                </button>
            </div>

            <div className="metric-grid">
                {metrics.map(({ label, value, desc, Icon }) => (
                    <section className="metric-card" key={label}>
                        <div>
                            <Icon size={25} />
                            {label}
                        </div>
                        <b>{value}</b>
                        <p>{desc}</p>
                    </section>
                ))}
            </div>

            <section className="panel journeys">
                <div className="card-row">
                    <h2>Recent journeys</h2>
                    <button className="select-button">
                        All trips <ChevronDown size={20} />
                    </button>
                </div>
                {trips.map((t) => (
                    <div className="journey" key={t.id}>
                        <div className="truck-icon">
                            <Truck size={26} />
                        </div>
                        <div>
                            <h3>{t.id}</h3>
                            <p>{t.meta}</p>
                            <b>{t.stats}</b>
                        </div>
                        <span className={t.status.startsWith('100') ? 'status-green' : 'status-amber'}>
              {t.status}
            </span>
                    </div>
                ))}
            </section>

            <section className="panel reports">
                <div className="card-row">
                    <h2>Reports &amp; records</h2>
                    <ClipboardList size={24} />
                </div>
                <div className="empty-state">
                    <ClipboardList size={42} />
                    <p>No reports yet</p>
                    <small>Your fine and fuel records will appear here.</small>
                </div>
            </section>

            <section className="panel sync-card">
                <UploadCloud size={24} />
                <div>
                    <b>Your records are up to date</b>
                    <p>Demo records stay on this device.</p>
                    <button>
                        View sync queue <ArrowRight size={18} />
                    </button>
                </div>
            </section>
        </main>
    )
}