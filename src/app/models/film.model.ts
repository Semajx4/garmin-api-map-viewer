import {getPool} from "../../config/db";
import {ResultSetHeader} from "mysql2";
import Logger from "../../config/logger";

const viewAll = async (searchQuery: filmSearchQuery): Promise<filmReturn> => {
    let query = `SELECT
    F.id as filmId,
    F.title as title,
    F.director_id as directorId,
    U.first_name as directorFirstName,
    U.last_name as directorLastName,
    F.release_date as releaseDate
    FROM film F JOIN user U on F.director_id = U.id `;
    let countQuery = `SELECT COUNT(F.id) from film F JOIN user U on F.director_id = U.id `


    const whereConditions: string[] = []
    const values: any[] = []
    if (searchQuery.q && searchQuery.q !== "") {
        whereConditions.push('(title LIKE ? OR description LIKE ?)');
        values.push(`%${searchQuery.q}%`);
        values.push(`%${searchQuery.q}%`);
    }
    if (searchQuery.directorId && searchQuery.directorId !== -1) {
        whereConditions.push('director_id = ?');
        values.push(searchQuery.directorId);
    }


    if (whereConditions.length) {
        query += `\nWHERE ${(whereConditions ? whereConditions.join(' AND ') : 1)}\n`
        countQuery += `\nWHERE ${(whereConditions ? whereConditions.join(' AND ') : 1)}\n`
    }
    const countValues = [...values];

    const searchSwitch = (sort: string) => ({
        'ALPHABETICAL_ASC': `ORDER BY title ASC`,
        'ALPHABETICAL_DESC': `ORDER BY title DESC`,
        'RATING_ASC': `ORDER BY CAST(rating AS FLOAT) ASC`,
        'RATING_DESC': `ORDER BY CAST(rating AS FLOAT) DESC`,
        'RELEASED_ASC': `ORDER BY releaseDate ASC`,
        'RELEASED_DESC': `ORDER BY releaseDate DESC`
    })[sort];
    query += searchSwitch(searchQuery.sortBy) + ', filmId\n';

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
    const films = rows[0];
    const countRows = await getPool().query(countQuery, countValues);
    const count = Object.values(JSON.parse(JSON.stringify(countRows[0][0])))[0];
    return {films, count} as filmReturn;
};

const getOne = async (id: number): Promise<filmFull> => {
    const query = `SELECT
    F.id as filmId,
    F.title as title,
    F.description as description,
    F.director_id as directorId,
    U.first_name as directorFirstName,
    U.last_name as directorLastName,
    F.release_date as releaseDate,
    F.runtime as runtime
    FROM film F JOIN user U on F.director_id = U.id
    WHERE F.id=?`;
    const rows = await getPool().query(query, id);
    const film = rows[0].length === 0 ? null : rows[0][0] as unknown as filmFull;

    return film;
}

const addOne = async (directorId: number, title: string, description: string, releaseDate: string, runtime: number): Promise<ResultSetHeader> => {
    const query = `INSERT INTO film (director_id, title, description, release_date, runtime) VALUES (?, ?, ?, ?, ?)`;
    const [result] = await getPool().query(query, [directorId, title, description, releaseDate, runtime]);
    return result;
}

const editOne = async (id: number, title: string, description: string, releaseDate: string, runtime: number): Promise<boolean> => {
    const query = `UPDATE film SET title=?, description=?, release_date=?, runtime=? WHERE id=?`;
    const [result] = await getPool().query(query, [title, description, releaseDate, runtime, id]);
    return result && result.affectedRows === 1;
}

const deleteOne = async (id: number): Promise<boolean> => {
    const query = `DELETE FROM film WHERE id = ?`;
    const [result] = await getPool().query(query, id);
    return result && result.affectedRows === 1;
}


const getImageFilename = async (id: number): Promise<string> => {
    const query = 'SELECT `image_filename` FROM `film` WHERE id = ?';
    const rows = await getPool().query(query, [id]);
    return rows[0].length === 0 ? null : rows[0][0].image_filename;
}

const setImageFilename = async (id: number, filename: string): Promise<void> => {
    const query = "UPDATE `film` SET `image_filename`=? WHERE `id`=?";
    const result = await getPool().query(query, [filename, id]);
}

export {viewAll, getOne, addOne, editOne, deleteOne, getImageFilename, setImageFilename};