import mysql from "mysql2/promise";

export const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root", // <-- Coloque a senha do seu MySQL aqui
    database: "Abrigo",
    dateStrings: true
});