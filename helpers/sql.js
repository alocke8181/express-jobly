const { BadRequestError, ExpressError } = require("../expressError");

/**  
 * Turns JavaScript objects into SQL commands to be used for partial updates
 * ({firstName: 'Aliya', age: 32}, {firstName: 'first_name', age: 'age}) =>
 * {setCols: ['"first_name"=$1', '"age"=$2'], values: ['Aliya', 32]}
 */
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

/**
 * Creates a query string to be used for filtering companies
 * Accepts: the queries directly from req.query
 * Returns: The completed query string and array of values
 */


function sqlForFilteredSearch(query){
  const minEmployees = query.minEmployees;
    const maxEmployees = query.maxEmployees;
    const nameLike = query.nameLike;
    let lowerName;
    if(nameLike){
      lowerName = '%' + nameLike.toLowerCase() + '%';
    };
    if (minEmployees && maxEmployees && minEmployees > maxEmployees){
      throw new ExpressError('minEmployees cannot be greater than maxEmployees',400);
    };
    let index = 1;
    let params = []
    let queryString = 'SELECT handle, name, description, num_employees as "numEmployees", logo_url as "logoUrl" FROM companies WHERE ';
    if(minEmployees){
      queryString = queryString + `num_employees >= $${index} `;
      params.push(minEmployees);
      index++;
      if(maxEmployees || lowerName){
        queryString = queryString + 'AND '
      };
    };
    if(maxEmployees){
      queryString = queryString + `num_employees <= $${index} `;
      params.push(maxEmployees);
      index++;
      if(lowerName){
        queryString = queryString + 'AND '
      }
    };
    if(lowerName){
      queryString = queryString + `LOWER(name) LIKE $${index} `
      params.push(lowerName);
    };
    queryString = queryString + 'ORDER BY name';
    return {queryString, params};
}

module.exports = { sqlForPartialUpdate, sqlForFilteredSearch };
