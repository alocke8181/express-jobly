const {sqlForPartialUpdate} = require('./sql');
const { BadRequestError } = require("../expressError");

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