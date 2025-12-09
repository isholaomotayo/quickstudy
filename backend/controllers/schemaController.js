const boom = require('boom');
const bookshelf = require('../config/connection').Bookshelf;

exports.get = async (req, reply) => {
  try {
    const schema = await bookshelf.knex(req.params.table).columnInfo();
    return schema;
  } catch (err) {
    throw boom.boomify(err);
  }
};
