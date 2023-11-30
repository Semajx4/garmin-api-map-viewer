
type mapPing = {
    pingTime: Date,
    pingLatitude: number,
    pingLongitude: number,
    pingElevation: number,
    pingVelocity: number,
    pingMessage: string
}


type pingSearchQuery = {
    pingTime?: Date,
    pingLatitude?: number,
    pingLongitude?: number,
    count?: number,
    startIndex?: number
}

type mapPingReturn = {
    mapPings: mapPing[],
    count: number
}