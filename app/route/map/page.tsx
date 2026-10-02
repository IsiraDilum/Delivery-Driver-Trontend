'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowRight, BellRing, Clock3 } from 'lucide-react'
import { useModal } from '@/components/app-shell'

export default function RouteMapPage() {
    const setModal = useModal()

    return (
        <main className="content route-page">
            <div className="map-screen">
                <div className="turn-card">
                    <ArrowRight size={25} />
                    <div>
                        <b>450 m</b>
                        <span>Turn right onto Station Road</span>
                    </div>
                </div>

                <div className="map map-large">
                    <div className="river"></div>
                    <div className="roads"></div>
                    <div className="route-line"></div>
                    <span className="map-label label-river">Kelani River</span>
                    <span className="map-label label-street">Main Street</span>
                    <span className="map-badge">Illustrative map · demo route</span>
                    <div className="map-stop stop-two">2</div>
                    <div className="map-stop stop-three">3</div>
                    <div className="map-stop stop-four">4</div>

                    <button className="emergency-button" onClick={() => setModal('incident')}>
                        <BellRing size={22} /> Emergency
                    </button>

                    <section className="map-stop-card">
                        <div>
                            <span className="status-purple">STOP 1 · FRESH</span>
                            <small>3.2 km</small>
                        </div>
                        <div>
                            <h2>Northgate Market</h2>
                            <b>6:55</b>
                        </div>
                        <p>42 Negombo Road, Peliyagoda</p>
                        <span className="delivery-window">
              <Clock3 size={15} /> Delivery window 6:30–8:00 AM
            </span>
                    </section>
                </div>
            </div>

            <Link href="/route" className="text-button" style={{ marginTop: 20 }}>
                <ArrowLeft size={20} /> Back to route overview
            </Link>
        </main>
    )
}