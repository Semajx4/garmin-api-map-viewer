import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import Logger from './logger';
dotenv.config();

const state = {
    // @ts-ignore
    pool: null
};
Logger.info(parseInt(process.env.MYSQL_PORT,10))
const connect = async (): Promise<void> => {
    state.pool = await mysql.createPool({
        connectionLimit: 100,
        multipleStatements: true,
        host: "localhost",
        user: "root",
        password: "",
        database: "films_schema",
        port: 3306
    });
    await state.pool.getConnection(); // Check connection
    Logger.info(`Successfully connected to database on port: ` + process.env.MYSQL_PORT)
    return
};

const getPool = () => {
    return state.pool;
};

export {connect, getPool}
