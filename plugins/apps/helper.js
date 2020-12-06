module.exports = class {

    constructor(db) {
        this.sequelize = db.sequelize;
        this.Sequelize = db.Sequelize;
        this.models = db.sequelize.models;
        this.Op = db.Op;
    }

}