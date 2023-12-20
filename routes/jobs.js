const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError, ExpressError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");

const router = new express.Router();

/** GET / => { jobs: [ {id, title, salary, equity, compHandle }, ...]}
 *   
 * Can filter based on
 * - title (case insensitive)
 * - minSalary
 * - hasEquity ('true'/'false')
 * 
 * No auth required
 */

router.get('/', async (req,res,next)=>{
    try{
        let jobs;
        if(Object.keys(req.query).length ==0){
            jobs = await Job.findAll();
        }else{
            if(req.query.minSalary && isNaN(req.query.minSalary)){
                throw new ExpressError('minSalary must be a number');
            }else if(req.query.hasEquity && !(req.query.hasEquity === "true" || req.query.hasEquity === "false")){
                throw new ExpressError('hasEquity must be a boolean (true/false)');
            }else{
                jobs = await Job.find(req.query);
            };
        };
        return res.json({jobs});
    }catch(e){
        return next(e);
    };
});

/**
 * GET /[id] => { id, title, salary, equity, compHandle}
 * 
 * 404 if job is not found
 * 
 * No auth
 */
router.get('/:id', async (req,res,next)=>{
    try{
        const job = await Job.get(req.params.id);
        return res.json({job});
    }catch(e){
        return next(e);
    };
});

/**
 * POST {title, salary, equity, compHandle} => {id, title, salary, equity, compHandle}
 * 
 * Requires Admin
 */

router.post('/', ensureAdmin, async (req,res,next)=>{
    try{
        const validator = jsonschema.validate(req.body, jobNewSchema);
        if(!validator.valid){
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        };
        const job = await Job.create(req.body);
        return res.status(201).json({job});
    }catch(e){
        return next(e);
    };
});

/**
 * PATCH /[id] {fields,...} => {job}
 * 
 * Patches job data
 * can patch {title, salary, equity}
 * 
 * Requires Admin
 */

router.patch('/:id', ensureAdmin, async (req,res,next)=>{
    try{
        const validator = jsonschema.validate(req.body, jobUpdateSchema);
        if(!validator.valid){
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        };
        const job = await Job.update(req.params.id, req.body);
        return res.json({job});
    }catch(e){
        return next(e);
    };
});

/**
 * DELETE /[id] => {deleted : [id]}
 * Requires admin
 */

router.delete('/:id', ensureAdmin, async (req,res,next)=>{
    try{
        await Job.remove(req.params.id);
        return res.json({deleted : req.params.id});
    }catch(e){
        return next(e);
    };
});

module.exports = router;