import {Express} from "express";
import {rootUrl} from "./base.routes";
import * as location from '../controllers/location.controller';
import {authenticate} from "../middleware/auth.middleware";

module.exports = (app: Express) => {
    app.route(rootUrl+'/location')
        .get(location.viewAll)
        .post(authenticate, location.addOne);

    app.route(rootUrl+'/location/:id')
        .get(location.getOne)
}