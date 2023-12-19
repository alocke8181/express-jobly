const db = require("../db.js");
const { BadRequestError, NotFoundError, ExpressError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");


beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/****************************** create */
describe('create', ()=>{
    const newJob = {
        title : 'new',
        salary : 1000,
        equity : 0.0,
        compHandle : "c1"
    };
    test('works', async ()=>{
        let job = await Job.create(newJob);
        expect(job.title).toEqual(newJob.title);
        expect(job.salary).toEqual(newJob.salary);
        expect(parseInt(job.equity)).toEqual(newJob.equity);
        expect(job.compHandle).toEqual(newJob.compHandle);

        const result = await db.query('SELECT * FROM jobs WHERE id = $1',[job.id]);
        expect(result.rows[0]).toEqual({
            id : job.id,
            title : 'new',
            salary : 1000,
            equity : '0',
            company_handle : 'c1'
        });
    });

    test('no company found', async ()=>{
        const badJob = {
            title : 'new',
            salary : 1000,
            equity : 0.0,
            compHandle : "asdf"
        };
        try{
            await Job.create(badJob);
            fail();
        }catch(e){
            expect(e instanceof NotFoundError).toBeTruthy();
        };
    });
});

/***************************** gets */
describe('gets', ()=>{
    test('find all', async ()=>{
        const result = await Job.findAll();
        expect(result.length).toEqual(3);
        expect(result[0].title).toEqual('j1');
        expect(result[1].title).toEqual('j2');
        expect(result[2].title).toEqual('j3');
    });
    
    test('find one', async ()=>{
        const newJob = {
            title : 'new',
            salary : 1000,
            equity : 0.0,
            compHandle : "c1"
        };
        let job = await Job.create(newJob);
        let foundJob = await Job.get(job.id);
        expect(foundJob).toEqual(job);
    });

    test("not found", async function () {
        try {
          await Job.get("99999");
          fail();
        } catch (err) {
          expect(err instanceof NotFoundError).toBeTruthy();
        }
      });
});

describe('update', ()=>{
    const newJob = {
        title : 'new',
        salary : 1000,
        equity : 0.0,
        compHandle : "c1"
    };
    test('update', async ()=>{
        let jobTest = await Job.create(newJob);
        const updateData = {
            title : 'new title',
            salary : 2000,
            equity : 0.5
        };
        let updatedJob = await Job.update(jobTest.id, updateData);
        expect(updateData.title).toEqual('new title');
        expect(updateData.salary).toEqual(2000);
        expect(updateData.equity).toEqual(0.5);

        const result = await Job.get(jobTest.id);
        expect(result.title).toEqual('new title');
        expect(result.salary).toEqual(2000);
        expect(result.equity).toEqual('0.5');
    });
    test('update null fields', async ()=>{
        let jobTest = await Job.create(newJob);
        const updateData = {
            title : 'new title'
        };
        let updatedJob = await Job.update(jobTest.id, updateData);
        expect(updatedJob.title).toEqual('new title');
        expect(updatedJob.salary).toEqual(1000);
        expect(updatedJob.equity).toEqual('0');

        const result = await Job.get(jobTest.id);
        expect(result.title).toEqual('new title');
        expect(result.salary).toEqual(1000);
        expect(result.equity).toEqual('0');
    });
    test("not found", async function () {
        try {
            const updateData = {
                title : 'new title',
                salary : 2000,
                equity : 0.5
            };
            await Job.update(99999, updateData);
            fail();
        } catch (err) {
          expect(err instanceof NotFoundError).toBeTruthy();
        }
      });
})