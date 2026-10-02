export type Trip = {
    id: string
    daysAgo: number
    duration: string
    stops: number
    km: number
    packages: number
    onTime: number
}

// Sample trips dated relative to today until trip history comes from the backend
export const TRIPS: Trip[] = [
    { id: 'WD-R13', daysAgo: 1, duration: '6h 12m', stops: 7, km: 142, packages: 48, onTime: 100 },
    { id: 'WD-R11', daysAgo: 3, duration: '4h 48m', stops: 5, km: 98, packages: 34, onTime: 80 },
    { id: 'WD-R08', daysAgo: 9, duration: '7h 30m', stops: 9, km: 176, packages: 61, onTime: 89 },
    { id: 'WD-R05', daysAgo: 20, duration: '5h 10m', stops: 6, km: 121, packages: 41, onTime: 100 },
    { id: 'WD-R02', daysAgo: 41, duration: '5h 46m', stops: 6, km: 133, packages: 39, onTime: 83 },
]
