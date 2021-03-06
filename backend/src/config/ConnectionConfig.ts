import oracledb from "oracledb";
import EnvConfig from "./EnvConfig";

class DatabaseConfig {
    constructor() {
        try {
            oracledb.initOracleClient({libDir: EnvConfig.ICLIENT_PATH});
        } catch(error) {
            console.error("ClientNotFound: "+error);
        }
    }

    // connect to the database
    connect() {
        try {
            const connection = oracledb.getConnection({
                user: EnvConfig.DB_USER,
                password: EnvConfig.DB_PASS,
                connectString: `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(Host=${EnvConfig.DB_HOST})(Port=${EnvConfig.DB_PORT}))(CONNECT_DATA=(SID=${EnvConfig.DB_SID})))`
            });
            return connection;
        } catch(error) {
            console.error(error);
            return null;
        }
    }

    // returns the results of a query
    async query(sql : string) {
        let connection;
        const db = require("oracledb");
        try {
            connection = await this.connect();
            if(connection === null) {
                throw new Error("Failed to connect to database!");
            }
            const result = await connection.execute(sql, [], {outFormat: db.OBJECT, autoCommit: true});
            return result;
        } catch(error) {
            console.error(error);
            return null;
        } finally {
            try {
                connection.close();
            } catch(closeError) {
                console.error(closeError);
            }
        }
    }

    async modify(sql: string, returnID: boolean): Promise<number> {
        let connection;
        try {
            connection = await this.connect();
            if(connection === null) {
                throw new Error("Failed to connect to database!");
            }
            let result;
            if (returnID) {
                result = await connection.execute(sql, {id: {type: oracledb.NUMBER, dir: oracledb.BIND_OUT}}, {autoCommit: true});
                const outBinds: {[k: string]: any} = result.outBinds;
                return outBinds.id[0];
            }
            else {
                await connection.execute(sql, [], {autoCommit: true});
                return 0;
            }
        } catch(error) {
            console.error(error);
            return null;
        } finally {
            try {
                connection.close();
            } catch(closeError) {
                console.error(closeError);
            }
        }
    }

    // execute pl/sql function, returns :result
    async executeFunc(sql: string): Promise<any> {
        let connection;
        try {
            connection = await this.connect();
            if(connection === null) {
                throw new Error("Failed to connect to database!");
            }

            const result = await connection.execute(sql, {result: {dir: oracledb.BIND_OUT}}, {autoCommit: true})
            const outBinds: {[k: string]: any} = result.outBinds;
            return outBinds.result;
        } catch(error) {
            console.error(error);
            return null;
        } finally {
            try {
                connection.close();
            } catch(closeError) {
                console.error(closeError);
            }
        }
    }
}

export default new DatabaseConfig();