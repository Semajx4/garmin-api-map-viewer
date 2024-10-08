import {Request, Response} from "express";
import Logger from '../../config/logger';
import * as Film from '../models/film.model';
import * as Review from '../models/film.review.model';
import * as schemas from '../resources/schemas.json';
import {validate} from "../services/validator";
import {removeImage} from "../models/images.model";


const viewAll = async (req: Request, res: Response): Promise<void> => {
    try {
        const validation = await validate(schemas.film_search, req.query);
        if (validation !== true) {
            res.statusMessage = `Bad Request: ${validation.toString()}`;
            res.status(400).send();
            return;
        }
        if (req.query.hasOwnProperty("directorId"))
            req.query.directorId = parseInt(req.query.directorId as string, 10) as any;
        if (req.query.hasOwnProperty("startIndex"))
            req.query.startIndex = parseInt(req.query.startIndex as string, 10) as any;
        if (req.query.hasOwnProperty("count"))
            req.query.count = parseInt(req.query.count as string, 10) as any;


        let search: filmSearchQuery = {
            q: '',
            directorId:-1,
            startIndex: 0,
            count: -1,
            sortBy: 'RELEASED_ASC'
        }
        search = {...search, ...req.query} as filmSearchQuery;

        const films = await Film.viewAll(search);
        res.status(200).send(films);
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
        const filmId = parseInt(req.params.id, 10);
        if (isNaN(filmId)) {
            res.statusMessage = "Id must be an integer"
            res.status(400).send();
            return;
        }
        const film = await Film.getOne(filmId);
        if (film !== null) {
            res.status(200).send(film);
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
    try {
        const validation = await validate(schemas.film_post, req.body);
        if (validation !== true) {
            res.statusMessage = `Bad Request: ${validation.toString()}`;
            res.status(400).send();
            return;
        }
        let releaseDate = null;
        if (req.body.hasOwnProperty("releaseDate")) {
            if (Date.parse(req.body.releaseDate) < Date.now()) {
                res.statusMessage = "Cannot release a film in the past";
                res.status(403).send();
                return;
            }
            releaseDate = req.body.releaseDate;
        } else {
            const d = new Date()
            const year = d.getFullYear()
            const month = d.getMonth() + 1
            const day = d.getDate()
            const hour = d.getHours()
            const minute = d.getMinutes()
            const second = d.getSeconds()
            releaseDate = `${year}-${month}-${day} ${hour}:${minute}:${second}`
        }

        let runtime: number = null;
        if (req.body.hasOwnProperty("runtime")) {
            runtime = req.body.runtime;
        }

        Logger.info(req.authId);
        const result = await Film.addOne(req.authId, req.body.title, req.body.description, releaseDate, runtime)
        if (result) {
            res.status(201).send({"filmId": result.insertId});
            return;
        } else {
            Logger.warn("Film not added to database...");
            res.statusMessage = "Film could not be saved to database"
            res.status(500).send();
            return;
        }
    } catch (err) {
        Logger.error(err);
        if (err.errno === 1062) { // 1062 = Duplicate entry MySQL error number
            res.statusMessage = "Forbidden: Duplicate film";
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

const editOne = async (req: Request, res: Response): Promise<void> => {
    try {
        const validation = await validate(schemas.film_patch, req.body);
        if (validation !== true) {
            res.statusMessage = `Bad Request: ${validation.toString()}`;
            res.status(400).send();
            return;
        }
        const filmId = parseInt(req.params.id, 10);
        if (isNaN(filmId)) {
            res.statusMessage = "Id must be an integer"
            res.status(400).send();
            return;
        }
        const film = await Film.getOne(filmId);
        if (film == null) {
            res.status(404).send();
            return;
        }
        if (film.directorId !== req.authId) {
            res.statusMessage = "Cannot edit another user's film";
            res.status(403).send();
            return;
        }
        let title;
        if (req.body.hasOwnProperty("title")) {
            title = req.body.title;
        } else {
            title = film.title;
        }
        let description;
        if (req.body.hasOwnProperty("description")) {
            description = req.body.description;
        } else {
            description = film.description;
        }

        let releaseDate;
        if (req.body.hasOwnProperty("releaseDate")) {
            if (Date.parse(req.body.releaseDate) < Date.now()) {
                res.statusMessage = "Cannot release a film in the past.";
                res.status(403).send();
                return;
            } else if (Date.parse(film.releaseDate) < Date.now()){
                res.statusMessage = "Cannot change the release date of a film already released.";
                res.status(403).send();
                return;
            }
            releaseDate = req.body.releaseDate;
        } else {
            releaseDate = film.releaseDate;
        }








        let runtime;
        if (req.body.hasOwnProperty("runtime")) {
            runtime = req.body.runtime;
        } else {
            runtime = film.runtime;
        }

        const result = await Film.editOne(filmId, title, description, releaseDate, runtime)
        if (result) {
            res.status(200).send();
            return;
        } else {
            Logger.warn("Film not updated in database...");
            res.statusMessage = "Film could not be updated";
            res.status(500).send();
        }

    } catch (err) {
        Logger.error(err);
        if (err.errno === 1062) { // 1062 = Duplicate entry MySQL error number
            res.statusMessage = "Forbidden: Duplicate film";
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

const deleteOne = async (req: Request, res: Response): Promise<void> => {
    try {
        const filmId = parseInt(req.params.id, 10);
        if (isNaN(filmId)) {
            res.statusMessage = "Id must be an integer"
            res.status(400).send();
            return;
        }
        const film = await Film.getOne(filmId);
        if (film == null) {
            res.status(404).send();
            return;
        }
        if (film.directorId !== req.authId) {
            res.statusMessage = "Cannot delete another user's film";
            res.status(403).send();
            return;
        }
        const filename = await Film.getImageFilename(filmId);
        const result = await Film.deleteOne(filmId);

        if (result) {
            if (filename !== null || filename !== "") {
                await removeImage(filename);
            }
            res.status(200).send();
            return;
        } else {
            res.statusMessage = "Film could not be removed from the database";
            res.status(500).send();
            return;
        }
    } catch (err) {
        Logger.error(err);
        res.statusMessage = "Internal Server Error";
        res.status(500).send();
    }
}



export {viewAll, getOne, addOne, editOne, deleteOne};