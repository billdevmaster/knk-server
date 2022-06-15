const JWTSECRET = process.env.JWTSECRET;
const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_HOST = process.env.DB_HOST;

module.exports = {
    jwtSecret: JWTSECRET,
    // mongodburi: 'mongodb://' + DB_USERNAME + ':' + DB_PASSWORD + '@' + DB_HOST + ':27017/vend-portal?authSource=admin'
};