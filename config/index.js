

const mailConfig = {
    noreply : {
        user: process.env.MAIL_NOREPLY_USER,
        password: process.env.MAIL_NOREPLY_PWD
    },

    info : {
        user: process.env.MAIL_INFO_USER,
        password: process.env.MAIL_INFO_PWD
    },
    port: process.env.NODE_ENV === "production" ? parseInt(process.env.MAIL_PORT, 10) : 587,
    host: process.env.MAIL_HOST

}

const jwtKeys = {secret:process.env.JWT_SECRET, public:process.env.JWT_PUBLIC}

const appOrigin = process.env.NODE_ENV === "production" ? "https://portal.ficoven.com" : "http://localhost:3000";

// admin@nin-panduspowells.ficoven.com
const adminEmail = "admin@nin-panduspowells.ficoven.com"

module.exports = {mailConfig, adminEmail, appOrigin, jwtKeys};