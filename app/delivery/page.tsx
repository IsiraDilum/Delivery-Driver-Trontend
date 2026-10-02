'use client'

import { useState } from 'react'
import {
    Box,
    Camera,
    Check,
    ChevronRight,
    ClipboardList,
    Plus,
    ScanLine,
    Truck,
} from 'lucide-react'
import { useModal } from '@/components/app-shell'

const packages = ['PKG-9040', 'PKG-9041', 'PKG-9042', 'PKG-9043', 'PKG-9044']

export default function DeliveryPage() {
    const setModal = useModal()
    const [checked, setChecked] = useState([true, false, false, false, false])

    return (
        <main className="content delivery-page">
            <p className="eyebrow">STOP 1 OF 4 · WD-R14</p>
            <h1>Confirm delivery</h1>
            <p className="subhead">Check the store. Hand over. You&apos;re done.</p>

            <section className="panel stop-card">
                <div className="card-row">
                    <span className="status-purple">CURRENT STOP</span>
                    <span className="status-green">
            <Check size={18} /> Arrived
          </span>
                </div>
                <h2>Northgate Market</h2>
                <p>42 Negombo Road, Peliyagoda</p>
                <hr />
                <p className="instruction">
                    <Truck size={23} />
                    Rear loading bay · enter from Station Road
                </p>
            </section>

            <section className="panel handoff">
                <div className="card-row">
                    <div>
                        <h2>Package handoff</h2>
                        <p>Select each package as you hand it over.</p>
                    </div>
                    <span className="step-pill">{checked.filter(Boolean).length} / 5</span>
                </div>

                {packages.map((pkg, i) => (
                    <button
                        className="package-row"
                        key={pkg}
                        onClick={() => setChecked((c) => c.map((v, j) => (j === i ? !v : v)))}
                    >
            <span className={checked[i] ? 'check-box checked' : 'check-box'}>
              {checked[i] && <Check size={18} />}
            </span>
                        <Box size={26} />
                        <span>
              <b>{pkg}</b>
              <small>Fresh · Northgate Market</small>
            </span>
                        {checked[i] && <Check className="green-check" size={24} />}
                    </button>
                ))}

                <button
                    className="secondary-action select-all"
                    onClick={() => setChecked(packages.map(() => true))}
                >
                    Select all packages <Check size={18} />
                </button>
            </section>

            <section className="panel complete-handoff">
                <h2>Complete the handoff</h2>

                <div className="arrival-row">
          <span className="arrival-icon">
            <Check size={20} />
          </span>
                    <div>
                        <b>Arrival recorded</b>
                        <small>Manual check-in · demo location</small>
                    </div>
                </div>

                <button className="verify-row" onClick={() => setModal('verify')}>
          <span className="qr-icon">
            <ScanLine size={20} />
          </span>
                    <span>
            <b>Verify store QR</b>
            <small>Open sample store verification</small>
          </span>
                    <ChevronRight size={20} />
                </button>

                <label>
                    Receiver&apos;s name
                    <input placeholder="e.g. Anoma Perera" />
                </label>

                <label>
                    Delivery outcome
                    <select defaultValue="Delivered">
                        <option>Delivered</option>
                        <option>Partial delivery</option>
                        <option>Unable to deliver</option>
                    </select>
                </label>

                <button className="photo-row">
                    <Camera size={21} />
                    <span>
            <b>Add handoff photo</b>
            <small>Optional · preview only, not uploaded</small>
          </span>
                    <Plus size={22} />
                </button>

                <button className="complete-button">
                    <Check size={20} /> Complete delivery
                </button>
                <p className="helper center">Verify the store and record the handoff first.</p>
            </section>

            <button className="parking-link" onClick={() => setModal('fine')}>
                <ClipboardList size={20} /> Report a parking fine <ChevronRight size={20} />
            </button>
        </main>
    )
}