'use client'

import { useState } from 'react'
import {
    Box,
    Check,
    CircleHelp,
    MapPin,
    Route as RouteIcon,
    ScanLine,
    Wrench,
    X,
    Zap,
} from 'lucide-react'

export type Modal = 'incident' | 'fine' | 'verify' | null

const incidentTypes = [
    ['Vehicle breakdown', Wrench],
    ['Flat tyre', CircleHelp],
    ['Accident / collision', Zap],
    ['Road blocked', RouteIcon],
    ['Cargo issue', Box],
    ['Other', CircleHelp],
] as const

export function ModalView({
                              modal,
                              close,
                          }: {
    modal: Modal
    close: () => void
}) {
    // Hooks must run before the early return below
    const [selectedIncident, setSelectedIncident] = useState<string | null>(null)

    if (!modal) return null

    return (
        <div className="modal-backdrop">
            <section className="modal">
                <button className="close" onClick={close} aria-label="Close">
                    <X size={28} />
                </button>

                {modal === 'incident' && (
                    <>
                        <h2>Report an incident</h2>

                        <div className="incident-context">
                            <MapPin size={30} />
                            <div>
                                <b>WD-R14 · Vehicle V-14</b>
                                <span>Northgate Market · Stop 1 of 4</span>
                            </div>
                        </div>

                        <p className="incident-label">What type of incident?</p>
                        <div className="incident-grid" role="radiogroup" aria-label="Incident type">
                            {incidentTypes.map(([label, Icon]) => {
                                const isSelected = selectedIncident === label
                                return (
                                    <button
                                        key={label}
                                        type="button"
                                        role="radio"
                                        aria-checked={isSelected}
                                        className={isSelected ? 'selected' : undefined}
                                        onClick={() => setSelectedIncident(label)}
                                    >
                                        <Icon size={29} />
                                        <span>{label}</span>
                                        {isSelected && (
                                            <Check size={20} className="incident-check" aria-hidden="true" />
                                        )}
                                    </button>
                                )
                            })}
                        </div>

                        <label>
                            Details (optional)
                            <textarea placeholder="What happened? Are you in a safe location?" />
                        </label>

                        <button
                            type="button"
                            className="danger-button"
                            onClick={close}
                            disabled={!selectedIncident}
                        >
                            {selectedIncident ? 'Save incident report' : 'Select an incident type'}
                        </button>
                    </>
                )}

                {modal === 'fine' && (
                    <>
                        <h2>Report a parking fine</h2>
                        <p className="modal-copy">
                            Link the fine to your delivery and add the ticket details.
                        </p>
                        <div className="fine-context">
                            <MapPin size={28} />
                            <div>
                                <b>Northgate Market</b>
                                <span>Rear loading bay · enter from Station Road</span>
                            </div>
                        </div>
                        <label>
                            Fine amount (LKR)
                            <input placeholder="e.g. 1500" />
                        </label>
                        <label>
                            Reason
                            <textarea placeholder="Explain the unloading or parking situation" />
                        </label>
                        <label>
                            Ticket photo
                            <input />
                        </label>
                        <button className="primary-button" onClick={close}>
                            Save record
                        </button>
                    </>
                )}

                {modal === 'verify' && (
                    <>
                        <h2>Verify the receiving store</h2>
                        <p className="modal-copy">
                            Sample verification flow. No camera scanning is connected.
                        </p>
                        <div className="qr">
                            <ScanLine size={100} />
                        </div>
                        <h3 className="center">Northgate Market</h3>
                        <p className="center muted">STORE · WP-001</p>
                        <span className="sample-code">Sample code</span>
                        <button className="primary-button" onClick={close}>
                            Verify sample store
                        </button>
                    </>
                )}
            </section>
        </div>
    )
}