'use client'

import Link from 'next/link'
import { ArrowRight, BellRing, MapPin, SlidersHorizontal } from 'lucide-react'
import { useModal } from '@/components/app-shell'

const stops = [
    ['Northgate Market', '5 packages · 6:30–8:00 AM', 'Rear loading bay · enter from Station Road'],
    ['Riverside Grocer', '4 packages · 6:00–8:00 AM', 'Curbside unloading · contact receiver on arrival'],
]

export default function RoutePage() {
    const setModal = useModal()

    return (
        <main className="content route-page">
            <div className="page-heading">
                <div>
                    <h1>Your route</h1>
                    <p>One stop at a time. You&apos;re on track.</p>
                </div>
                <button
                    className="alert-tile"
                    onClick={() => setModal('incident')}
                    aria-label="Open emergency incident report"
                >
                    <BellRing size={35} />
                </button>
            </div>

            <section className="panel map-panel">
                <div className="card-row">
                    <h2>Route at a glance</h2>
                    <Link href="/route/map" className="text-button">
                        View route <ArrowRight size={24} />
                    </Link>
                </div>
                <div className="map">
                    <div className="river"></div>
                    <div className="roads"></div>
                    <div className="route-line"></div>
                    <span className="map-point p1">1</span>
                    <span className="map-point p2">2</span>
                    <span className="map-point p3">3</span>
                    <span className="map-label">Illustrative map · demo route</span>
                </div>
                <div className="map-footer">
          <span>
            <MapPin size={24} />
            Peliyagoda depot
          </span>
                    <b>4 stops · 3 brands</b>
                </div>
            </section>

            <section className="panel sequence">
                <div className="card-row">
                    <h2>Stop sequence</h2>
                    <SlidersHorizontal size={26} />
                </div>
                {stops.map((s, i) => (
                    <div className="sequence-row" key={s[0]}>
                        <span className={i === 0 ? 'number active' : 'number'}>{i + 1}</span>
                        <div>
                            <h3>{s[0]}</h3>
                            <p>{s[1]}</p>
                            <p>{s[2]}</p>
                        </div>
                    </div>
                ))}
            </section>
        </main>
    )
}