'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
    ArrowRight,
    Box,
    Camera,
    Check,
    CheckCheck,
    ChevronRight,
    ClipboardList,
    Plus,
    QrCode,
    Truck,
    X,
} from 'lucide-react'
import { useModal } from '@/components/app-shell'

const packages = ['PKG-9040', 'PKG-9041', 'PKG-9042', 'PKG-9043', 'PKG-9044']
const MAX_PHOTO_MB = 10

type Outcome = 'Delivered' | 'Partial delivery' | 'Unable to deliver'

export default function DeliveryPage() {
    const setModal = useModal()
    const [checked, setChecked] = useState([true, false, false, false, false])
    const [receiver, setReceiver] = useState('')
    const [outcome, setOutcome] = useState<Outcome>('Delivered')
    const [photo, setPhoto] = useState<{ url: string; name: string } | null>(null)
    const [photoError, setPhotoError] = useState('')
    const [completed, setCompleted] = useState(false)


    const count = checked.filter(Boolean).length
    const total = packages.length

    // Free the preview URL when it changes or the page unmounts
    useEffect(() => {
        return () => {
            if (photo) URL.revokeObjectURL(photo.url)
        }
    }, [photo])

    function handleOutcome(next: Outcome) {
        setOutcome(next)
        if (next === 'Delivered') setChecked(packages.map(() => true))
        if (next === 'Unable to deliver') setChecked(packages.map(() => false))
    }

    function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        e.target.value = '' // allows picking the same file again
        if (!file) return

        if (!file.type.startsWith('image/')) {
            setPhotoError('Please choose an image file.')
            return
        }
        if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
            setPhotoError(`Image must be under ${MAX_PHOTO_MB} MB.`)
            return
        }
        setPhotoError('')
        setPhoto({ url: URL.createObjectURL(file), name: file.name })
    }

    // What is required depends on the outcome
    const needsReceiver = outcome !== 'Unable to deliver'
    const packagesOk =
        outcome === 'Delivered'
            ? count === total
            : outcome === 'Partial delivery'
                ? count > 0 && count < total
                : true
    const canComplete = packagesOk && (!needsReceiver || receiver.trim().length > 0)

    const helperText = !packagesOk
        ? outcome === 'Delivered'
            ? 'Select all packages to mark as delivered.'
            : 'Select the packages you handed over (not all of them).'
        : needsReceiver && receiver.trim().length === 0
            ? 'Enter the receiver’s name to continue.'
            : 'Everything looks good. You can complete the delivery.'

    if (completed) {
        return (
            <main className="content delivery-page">
                <section className="panel success-card">
                    <span className="success-icon">
                        <CheckCheck size={40} aria-hidden="true" />
                    </span>
                    <h1>{outcome === 'Unable to deliver' ? 'Stop recorded' : 'Delivery complete'}</h1>
                    <p className="subhead">Northgate Market · Stop 1 of 4</p>

                    <dl className="success-summary">
                        <div>
                            <dt>Outcome</dt>
                            <dd>{outcome}</dd>
                        </div>
                        <div>
                            <dt>Packages</dt>
                            <dd>
                                {count} / {total}
                            </dd>
                        </div>
                        {needsReceiver && (
                            <div>
                                <dt>Received by</dt>
                                <dd>{receiver}</dd>
                            </div>
                        )}
                        <div>
                            <dt>Photo</dt>
                            <dd>{photo ? 'Attached' : 'None'}</dd>
                        </div>
                    </dl>

                    {photo && <img src={photo.url} alt="Handoff" className="success-photo" />}

                    <Link href="/route" className="primary-button">
                        Continue to next stop <ArrowRight size={20} aria-hidden="true" />
                    </Link>
                </section>
            </main>
        )
    }

    return (
        <main className="content delivery-page">
            <p className="eyebrow">STOP 1 OF 4 · WD-R14</p>
            <h1>Confirm delivery</h1>
            <p className="subhead">Check the store. Hand over. You’re done.</p>

            <section className="panel stop-card">
                <div className="card-row">
                    <span className="status-purple">CURRENT STOP</span>
                    <span className="status-green">
                        <Check size={18} aria-hidden="true" /> Arrived
                    </span>
                </div>
                <h2>Northgate Market</h2>
                <p>42 Negombo Road, Peliyagoda</p>
                <hr />
                <p className="instruction">
                    <Truck size={23} aria-hidden="true" />
                    Rear loading bay · enter from Station Road
                </p>
            </section>

            <section className="panel handoff">
                <div className="card-row">
                    <div>
                        <h2>Package handoff</h2>
                        <p>Select each package as you hand it over.</p>
                    </div>
                    <span className="step-pill">
                        {count} / {total}
                    </span>
                </div>

                {packages.map((pkg, i) => (
                    <button
                        type="button"
                        className="package-row"
                        key={pkg}
                        aria-pressed={checked[i]}
                        onClick={() => setChecked((c) => c.map((v, j) => (j === i ? !v : v)))}
                    >
                        <span className={checked[i] ? 'check-box checked' : 'check-box'}>
                            {checked[i] && <Check size={18} aria-hidden="true" />}
                        </span>
                        <Box size={26} aria-hidden="true" />
                        <span>
                            <b>{pkg}</b>
                            <small>Fresh · Northgate Market</small>
                        </span>
                        {checked[i] && <Check className="green-check" size={24} aria-hidden="true" />}
                    </button>
                ))}

                <button
                    type="button"
                    className="secondary-action select-all"
                    onClick={() => setChecked(packages.map(() => true))}
                >
                    Select all packages <CheckCheck size={18} aria-hidden="true" />
                </button>
            </section>

            <section className="panel complete-handoff">
                <h2>Complete the handoff</h2>

                <div className="arrival-row">
                    <span className="arrival-icon">
                        <Check size={24} aria-hidden="true" />
                    </span>
                    <div>
                        <b>Arrival recorded</b>
                        <small>Manual check-in · demo location</small>
                    </div>
                </div>

                <button type="button" className="verify-row" onClick={() => setModal('verify')}>
                    <span className="qr-icon">
                        <QrCode size={24} aria-hidden="true" />
                    </span>
                    <span>
                        <b>Verify store QR</b>
                        <small>Open sample store verification</small>
                    </span>
                    <ChevronRight size={20} aria-hidden="true" />
                </button>

                <label>
                    Delivery outcome
                    <select value={outcome} onChange={(e) => handleOutcome(e.target.value as Outcome)}>
                        <option>Delivered</option>
                        <option>Partial delivery</option>
                        <option>Unable to deliver</option>
                    </select>
                </label>

                {needsReceiver && (
                    <label>
                        Receiver’s name
                        <input
                            placeholder="e.g. Anoma Perera"
                            autoComplete="off"
                            value={receiver}
                            onChange={(e) => setReceiver(e.target.value)}
                        />
                    </label>
                )}

                {/* Hidden file input: opens the gallery/camera picker */}
                {/* File input: visually hidden but not display:none */}
                <input
                    id="handoff-photo"
                    type="file"
                    accept="image/*"
                    className="file-input"
                    onChange={handlePhoto}
                />

                {photo ? (
                    <div className="photo-preview">
                        <img src={photo.url} alt="Handoff photo preview" />
                        <div className="photo-preview-info">
                            <b>{photo.name}</b>
                            <label htmlFor="handoff-photo" className="photo-change">
                                Change
                            </label>
                        </div>
                        <button
                            type="button"
                            className="photo-remove"
                            aria-label="Remove photo"
                            onClick={() => setPhoto(null)}
                        >
                            <X size={18} aria-hidden="true" />
                        </button>
                    </div>
                ) : (
                    <label htmlFor="handoff-photo" className="photo-row">
                        <Camera size={21} aria-hidden="true" />
                        <span>
            <b>Add handoff photo</b>
            <small>Optional · preview only, not uploaded</small>
        </span>
                        <Plus size={22} aria-hidden="true" />
                    </label>
                )}
                {photoError && <small className="field-error" role="alert">{photoError}</small>}




                <button
                    type="button"
                    className="complete-button"
                    disabled={!canComplete}
                    onClick={() => setCompleted(true)}
                >
                    <CheckCheck size={20} aria-hidden="true" /> Complete delivery
                </button>
                <p className="helper center">{helperText}</p>
            </section>

            <button type="button" className="parking-link" onClick={() => setModal('fine')}>
                <ClipboardList size={20} aria-hidden="true" /> Report a parking fine{' '}
                <ChevronRight size={20} aria-hidden="true" />
            </button>
        </main>
    )
}