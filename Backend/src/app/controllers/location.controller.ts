import {Request, Response} from "express";
import Logger from '../../config/logger';
import * as Ping from '../models/location.model';
import * as schemas from '../resources/schemas.json';
import {validate} from "../services/validator";
import exp from "constants";
import * as Loc from '../services/locationFetcher'

const viewAll = async (req: Request, res: Response): Promise<void> => {
    try {
        const validation = await validate(schemas.ping_search, req.query); // TODO: add ping schema
        if (validation !== true) {
            res.statusMessage = `Bad Request: ${validation.toString()}`;
            res.status(400).send();
            return;
        }

        if (req.query.hasOwnProperty("startIndex"))
            req.query.startIndex = parseInt(req.query.startIndex as string, 10) as any;
        if (req.query.hasOwnProperty("count"))
            req.query.count = parseInt(req.query.count as string, 10) as any;


        let search: pingSearchQuery = {
            pingTime: null,
            pingLatitude:-1,
            pingLongitude: -1,
            count: -1,
            startIndex: 0
        }
        search = {...search, ...req.query} as pingSearchQuery;

        const pings = await Ping.viewAll(search);
        res.status(200).send(pings);
        return;
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
        return;
    }
};

const getOne = async (req: Request, res: Response): Promise<void> => {
    try {
        const pingId = parseInt(req.params.id, 10);
        if (isNaN(pingId)) {
            res.statusMessage = "Id must be an integer"
            res.status(400).send();
            return;
        }
        const ping = await Ping.getOne(pingId);
        if (ping !== null) {
            res.status(200).send(ping);
            return;
        } else {
            res.status(404).send();
            return;
        }
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
    }
}

const addOne = async (req: Request, res: Response): Promise<void> => {
    const currentPing = await Loc.fetchAndStoreData();
    try {
        const currentPingJson = {
            "latitude": currentPing.pingLatitude,
            "longitude": currentPing.pingLongitude,
            "elevation": currentPing.pingElevation, 
            "velocity": currentPing.pingVelocity, 
            "textMessage": currentPing.pingMessage,
            "timeStamp": currentPing.pingTime.toISOString().replace('T', ' ').slice(0, -5) // Formatting timestamp
        }
        const validation = await validate(schemas.ping_post, currentPingJson);
        if (validation !== true) {
            res.statusMessage = `Bad Request: ${validation.toString()}`;
            Logger.warn(res.statusMessage)
            res.status(400).send();
            return;
        }
        const result = await Ping.addOne(
            currentPing.pingLatitude,
            currentPing.pingLongitude,
            currentPing.pingElevation,
            currentPing.pingVelocity,
            currentPing.pingMessage,
            currentPing.pingTime)
        if (result) {
            res.status(201).send({"pingId": result.insertId});
            return;
        } else {
            Logger.warn("Ping not added to database...");
            res.statusMessage = "Ping could not be saved to database"
            res.status(500).send();
            return;
        }
    } catch (err) {
        Logger.error(err);
        if (err.errno === 1062) { // 1062 = Duplicate entry MySQL error number
            res.statusMessage = "Forbidden: Duplicate ping";
            res.status(403).send();
            return;
        } else if (err.errno === 1292 && err.message.includes("datetime")) {
            res.statusMessage = "Bad Request: Invalid datetime value";
            res.status(400).send();
            return;
        } else {
            res.statusMessage = "Internal Server Error";
            res.status(500).send();
            return;
        }
    }
}
export {viewAll, getOne, addOne}