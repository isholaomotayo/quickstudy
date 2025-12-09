const bookshelf = require('../config/connection').Bookshelf;

const Payment = bookshelf.Model.extend({
    tableName: 'payment2',
    hasTimestamps: true,

    student() {
        return this.belongsTo('Student')
    },
    department() {
        return this.belongsTo('Department');
    },
    institution() {
        return this.belongsTo('Institution');
    },
});

module.exports = bookshelf.model('Payment', Payment);
