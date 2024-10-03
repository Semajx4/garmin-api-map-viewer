import {getPool} from "../../config/db";
import {ResultSetHeader} from "mysql2";
import Logger from "../../config/logger";



const viewAll = async (searchQuery: pingSearchQuery): Promise<mapPingReturn> => {
    let query = `SELECT
    id as pingId,
    latitude as pingLatitude,
    longitude as pingLongitude,
    elevation as pingElevation,
    velocity as pingVelocity,
    text_message as pingMessage,
    timestamp as pingTimeStamp
    FROM map_pings`;
    const countQuery = `SELECT COUNT(id) from map_pings`
    const values: any[] = []
    const countValues = [...values];
    if (searchQuery.count && searchQuery.count !== -1) {
        query += 'LIMIT ?\n';
        values.push(searchQuery.count);
    }

    if (searchQuery.startIndex && searchQuery.startIndex !== -1) {
        if (!searchQuery.count || searchQuery.count === -1) {
            query += 'LIMIT ?\n';
            values.push(10000000);
        }
        query += 'OFFSET ?\n';
        values.push(searchQuery.startIndex);
    }

    const rows = await getPool().query(query, values);
    const mapPings = rows[0];
    const countRows = await getPool().query(countQuery, countValues);
    const count = Object.values(JSON.parse(JSON.stringify(countRows[0][0])))[0];
    return {mapPings, count} as mapPingReturn;
};

const getOne = async (id: number): Promise<mapPing> => {
    const query = `SELECT
    id as pingId,
    latitude as pingLatitude,
    longitude as pingLongitude,
    elevation as pingElevation,
    velocity as pingVelocity,
    text_message as pingMessage,
    timestamps as pingTimeStamp
    FROM map_pings
    WHERE id = ?`;
    const rows = await getPool().query(query, id);
    const mapPing = rows[0].length === 0 ? null : rows[0][0] as unknown as mapPing;

    return mapPing;
}

const addOne = async (latitude: number, longitude: number, elevation: number, velocity: number, textMessage: string, timeStamp: Date): Promise<ResultSetHeader> => {
    const query = `INSERT INTO map_pings (latitude, longitude, elevation, velocity, text_message, timestamp) VALUES (?, ?, ?, ?, ?, ?)`;
    const [result] = await getPool().query(query, [latitude, longitude, elevation, velocity, textMessage, timeStamp]);
    return result;
};

export {viewAll, getOne, addOne};
