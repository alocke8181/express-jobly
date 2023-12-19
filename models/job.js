const db = require('../db');
const { BadRequestError, NotFoundError, ExpressError } = require("../expressError");
const {sqlForPartialUpdate} = require('../helpers/sql');

class Job{
    /**
     * Create a job from data, update db, return new company data
     * 
     * data should be {title, salary, equity, compHandle}
     * salary > 0
     * equity < 1.0
     * 
     * returns {id, title, salary, equity, compHandle}
     * Throws 404 if company handle is not found
     * Duplicate jobs are allowed
     */

    static async create({title, salary, equity, compHandle}){
        try{
            const result = await db.query(
                `INSERT INTO jobs
                (title, salary, equity, company_handle)
                VALUES ($1, $2, $3, $4)
                RETURNING id, title, salary, equity, company_handle AS "compHandle"`,
                [title, salary, equity, compHandle]);
            return result.rows[0];
        }catch(e){
            throw new NotFoundError(`Company handle ${compHandle} not found`);
        };
    };

    /**
     * Finds all jobs
     * 
     */
    static async findAll(){
        const result = await db.query(`
        SELECT id, title, salary, equity, company_handle AS "compHandle" 
        FROM jobs ORDER BY id`);
        return result.rows;
    };

    /**
     * Finds a job by an id
     * Throws 404 if not found
     */
    static async get(id){
        const result = await db.query(
            `SELECT id, title, salary, equity, company_handle AS "compHandle"
            FROM jobs WHERE id = $1`,
            [id]);
        const job = result.rows[0];
        if(!job){
            throw new NotFoundError(`No job with id ${id}`);
        }
        return job;
    };

    /**
     * Update job data with partial data
     * The compHandle cannot be updated
     * 
     * Data can include {title, salary, equity}
     * 
     * Returns {id, title, salary, equity, compHandle}
     * 
     * Throws 404 if not found
     */

    static async update(id, data){
        const { setCols, values } = sqlForPartialUpdate(data,{});
        const idVarIdx = '$' + (values.length +1);
        const queryString = `UPDATE jobs
                            SET ${setCols}
                            WHERE id = ${idVarIdx}
                            RETURNING id,
                                    title,
                                    salary,
                                    equity,
                                    company_handle AS "compHandle"`;
        const result = await db.query(queryString, [...values, id]);
        const job = result.rows[0]
        if(!job){
            throw new NotFoundError(`No job with id ${id}`);
        };
        return job;
    };

    /**
     * Delete a job
     * 
     * Throwns 404 if not found
     */

    static async remove(id){
        const result = await db.query(
            `DELETE FROM jobs
            WHERE id = $1
            RETURNING id`,
            [id]);
        if(!result.rows[0]){
            throw new NotFoundError(`No job with id ${id}`);
        };
    };


}
module.exports = Job;