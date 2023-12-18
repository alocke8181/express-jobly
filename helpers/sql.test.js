const {sqlForPartialUpdate, sqlForFilteredSearch} = require('./sql');
const { BadRequestError, ExpressError } = require("../expressError");

describe('sqlForPartialUpdate', ()=>{
    test('Works with valid data', ()=>{
        const dataToUpdate = {
            firstName: 'Test',
            age: 100
        };
        const jsToSql = {
            firstName : 'first_name',
            age : 'age'
        };
        const {setCols, values} = sqlForPartialUpdate(dataToUpdate, jsToSql);
        expect(setCols).toEqual("\"first_name\"=$1, \"age\"=$2");
        expect(values).toEqual(['Test',100]);
    });
});

describe('sqlForFilteredSearch', ()=>{
    test('Works with min employees only', ()=>{
        const query = {minEmployees : '100'};
        const {queryString, params} = sqlForFilteredSearch(query);
        expect(queryString).toContain('num_employees > $1');
        expect(params[0]).toEqual(query.minEmployees);
    });
    test('Works with max employees only', ()=>{
        const query = {maxEmployees : '100'};
        const {queryString, params} = sqlForFilteredSearch(query);
        expect(queryString).toContain('num_employees < $1');
        expect(params[0]).toEqual(query.maxEmployees);
    });
    test('Works with nameLike only', ()=>{
        const query = {nameLike : 'Test'};
        const {queryString, params} = sqlForFilteredSearch(query);
        expect(queryString).toContain('LOWER(name) LIKE $1');
        expect(params[0]).toEqual(`%${query.nameLike.toLowerCase()}%`);
    });
    test('Works with min & max employees', ()=>{
        const query = {minEmployees : '0', maxEmployees: '100'};
        const {queryString, params} = sqlForFilteredSearch(query);
        expect(queryString).toContain('num_employees > $1');
        expect(queryString).toContain('num_employees < $2');
        expect(params[0]).toEqual(query.minEmployees);
        expect(params[1]).toEqual(query.maxEmployees);
    });
    test('Works with min and name', ()=>{
        const query = {minEmployees : '0', nameLike: 'Test'};
        const {queryString, params} = sqlForFilteredSearch(query);
        expect(queryString).toContain('num_employees > $1');
        expect(queryString).toContain('LOWER(name) LIKE $2');
        expect(params[0]).toEqual(query.minEmployees);
        expect(params[1]).toEqual(`%${query.nameLike.toLowerCase()}%`);
    });
    test('Works with max and name', ()=>{
        const query = {maxEmployees : '100', nameLike: 'Test'};
        const {queryString, params} = sqlForFilteredSearch(query);
        expect(queryString).toContain('num_employees < $1');
        expect(queryString).toContain('LOWER(name) LIKE $2');
        expect(params[0]).toEqual(query.maxEmployees);
        expect(params[1]).toEqual(`%${query.nameLike.toLowerCase()}%`);
    });
    test('Works with all three', ()=>{
        const query = {minEmployees : '0', maxEmployees: '100', nameLike: 'Test'};
        const {queryString, params} = sqlForFilteredSearch(query);
        expect(queryString).toContain('num_employees > $1');
        expect(queryString).toContain('num_employees < $2');
        expect(queryString).toContain('LOWER(name) LIKE $3');
        expect(params[0]).toEqual(query.minEmployees);
        expect(params[1]).toEqual(query.maxEmployees);
        expect(params[2]).toEqual(`%${query.nameLike.toLowerCase()}%`);
    });
    test('Throws error if min > max', ()=>{
        expect(() =>{
            const query = {minEmployees : '100', maxEmployees: '10', nameLike: 'Test'};
            const {queryString, params} = sqlForFilteredSearch(query)}).toThrow(ExpressError);
    })
});