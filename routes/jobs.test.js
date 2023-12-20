const request = require("supertest");

const db = require("../db");
const app = require("../app");
const Job = require('../models/job');
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/******************************GET /jobs */
describe('GET /jobs', ()=>{
    test('get all', async ()=>{
        const resp = await request(app).get('/jobs');
        const jobs = resp.body.jobs;
        expect(jobs.length).toEqual(3);
        expect(jobs[0].title).toEqual('j1');
        expect(jobs[1].title).toEqual('j2');
        expect(jobs[2].title).toEqual('job3');
    });
    test('filter by minSalary', async ()=>{
        const resp = await request(app).get('/jobs?minSalary=200');
        const jobs = resp.body.jobs;
        expect(jobs.length).toEqual(2);
        expect(jobs[0].title).toEqual('j2');
        expect(jobs[1].title).toEqual('job3');
    });
    test('filter by hasEquity = true', async ()=>{
        const resp = await request(app).get('/jobs?hasEquity=true');
        const jobs = resp.body.jobs;
        expect(jobs.length).toEqual(2);
        expect(jobs[0].title).toEqual('j2');
        expect(jobs[1].title).toEqual('job3');
    });
    test('filter by hasEquity = false', async ()=>{
        const resp = await request(app).get('/jobs?hasEquity=false');
        const jobs = resp.body.jobs;
        expect(jobs.length).toEqual(3);
        expect(jobs[0].title).toEqual('j1');
        expect(jobs[1].title).toEqual('j2');
        expect(jobs[2].title).toEqual('job3');
    });
    test('filter by title', async ()=>{
        const resp = await request(app).get('/jobs?title=job');
        const jobs = resp.body.jobs;
        expect(jobs.length).toEqual(1);
        expect(jobs[0].title).toEqual('job3');
    });
    test('filter by minSalary & hasEquity', async ()=>{
        const resp = await request(app).get('/jobs?minSalary=300&hasEquity=true');
        const jobs = resp.body.jobs;
        expect(jobs.length).toEqual(1);
        expect(jobs[0].title).toEqual('job3');
    });
    test('filter by minSalary & title', async ()=>{
        const resp = await request(app).get('/jobs?minSalary=100&title=job');
        const jobs = resp.body.jobs;
        expect(jobs.length).toEqual(1);
        expect(jobs[0].title).toEqual('job3');
    });
    test('filter by hasEquity & title', async () =>{
        const resp = await request(app).get('/jobs?hasEquity=true&title=job');
        const jobs = resp.body.jobs;
        expect(jobs.length).toEqual(1);
        expect(jobs[0].title).toEqual('job3');
    });
    test('filter by all 3', async ()=>{
        const resp = await request(app).get('/jobs?minSalary=200&hasEquity=true&title=j');
        const jobs = resp.body.jobs;
        expect(jobs.length).toEqual(2);
        expect(jobs[0].title).toEqual('j2');
        expect(jobs[1].title).toEqual('job3');
    });

    test('Get by id', async ()=>{
        const newJob = await Job.create({
            title : 'j4',
            salary : 4000,
            equity : 0.4,
            compHandle : 'c1'
        });
        const resp = await request(app).get(`/jobs/${newJob.id}`);
        const job = resp.body.job;
        expect(job.title).toEqual(newJob.title);
        expect(job.salary).toEqual(newJob.salary);
        expect(job.equity).toEqual(newJob.equity);
        expect(job.compHandle).toEqual(newJob.compHandle);
    });
});

/************************POST /jobs */
describe('POST /jobs', ()=>{
    const newJob ={
        title : 'j4',
        salary : 4000,
        equity : 0.4,
        compHandle : 'c1'
    };
    
    test('ok for admin', async ()=>{
        const resp = await request(app)
            .post('/jobs')
            .send(newJob)
            .set('authorization', `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(201);
        const job = resp.body.job;
        expect(job.title).toEqual(newJob.title);
        expect(job.salary).toEqual(newJob.salary);
        expect(job.equity).toEqual(String(newJob.equity));
        expect(job.compHandle).toEqual(newJob.compHandle);
    });

    test('unauth not admin', async ()=>{
        const resp = await request(app)
            .post('/jobs')
            .send(newJob)
            .set('authorization', `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(401);
    });

    test('unauth anon', async ()=>{
        const resp = await request(app)
            .post('/jobs')
            .send(newJob);
        expect(resp.statusCode).toEqual(401);
    });

    test('missing data', async ()=>{
        const resp = await request(app)
            .post('/jobs')
            .send({
                title : 'j4',
                salary : 4000,
                equity : 0.4,
            })
            .set('authorization', `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(400);
    });

    test('invalid data', async ()=>{
        const resp = await request(app)
            .post('/jobs')
            .send({
                title : 'j4',
                salary : 'asdf',
                equity : 0.4,
                compHandle : 'c1'
            })
            .set('authorization', `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(400);
    });
});

/*************************PATCH /jobs */
describe('PATCH /jobs', ()=>{
    test('works for admin', async ()=>{
        const newJob = await Job.create({
            title : 'j4',
            salary : 4000,
            equity : 0.4,
            compHandle : 'c1'
        });
        const resp = await request(app)
            .patch(`/jobs/${newJob.id}`)
            .send({title : 'new title'})
            .set("authorization", `Bearer ${adminToken}`);
        const job = resp.body.job;
        expect(job.title).toEqual('new title');
        expect(job.salary).toEqual(newJob.salary);
        expect(job.equity).toEqual(String(newJob.equity));
        expect(job.compHandle).toEqual(newJob.compHandle);
    });

    test('unauth for user', async ()=>{
        const newJob = await Job.create({
            title : 'j4',
            salary : 4000,
            equity : 0.4,
            compHandle : 'c1'
        });
        const resp = await request(app)
            .patch(`/jobs/${newJob.id}`)
            .send({title : 'new title'})
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(401);
    });

    test('unauth for anon', async ()=>{
        const newJob = await Job.create({
            title : 'j4',
            salary : 4000,
            equity : 0.4,
            compHandle : 'c1'
        });
        const resp = await request(app)
            .patch(`/jobs/${newJob.id}`)
            .send({title : 'new title'})
        expect(resp.statusCode).toEqual(401);
    });

    test('404 on missing job', async ()=>{
        const resp = await request(app)
            .patch(`/jobs/9999`)
            .send({title : 'new title'})
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(404);
    });

    test('bad request on no data', async ()=>{
        const newJob = await Job.create({
            title : 'j4',
            salary : 4000,
            equity : 0.4,
            compHandle : 'c1'
        });
        const resp = await request(app)
            .patch(`/jobs/${newJob.id}`)
            .send({})
        expect(resp.statusCode).toEqual(401);
    });

    test('bad request on invalid data', async ()=>{
        const newJob = await Job.create({
            title : 'j4',
            salary : 4000,
            equity : 0.4,
            compHandle : 'c1'
        });
        const resp = await request(app)
            .patch(`/jobs/${newJob.id}`)
            .send({salary : 'asdf'})
        expect(resp.statusCode).toEqual(401);
    });
});

/**************************DELETE /jobs */
describe('DELETE /jobs', ()=>{
    test('valid delete', async ()=>{
        const newJob = await Job.create({
            title : 'j4',
            salary : 4000,
            equity : 0.4,
            compHandle : 'c1'
        });
        const resp = await request(app)
            .delete(`/jobs/${newJob.id}`)
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.body).toEqual({deleted : String(newJob.id)});
    });

    test('unauth user', async ()=>{
        const newJob = await Job.create({
            title : 'j4',
            salary : 4000,
            equity : 0.4,
            compHandle : 'c1'
        });
        const resp = await request(app)
            .delete(`/jobs/${newJob.id}`)
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(401);
    });

    test('unauth anon', async ()=>{
        const newJob = await Job.create({
            title : 'j4',
            salary : 4000,
            equity : 0.4,
            compHandle : 'c1'
        });
        const resp = await request(app)
            .delete(`/jobs/${newJob.id}`);
        expect(resp.statusCode).toEqual(401);
    });

    test('404 no job', async ()=>{
        const resp = await request(app)
            .delete(`/jobs/9999`)
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(404);
    })
});