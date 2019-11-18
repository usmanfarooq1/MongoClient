let MongoClient = require('mongodb').MongoClient;
export class Database {
    private dBName: string;
    private dBType: string;
    private connection: any;
    constructor(name: string, type: string) {
        this.dBName = name;
        this.dBType = type;
        this.connection = new MongoClient('mongodb://localhost:27017/', {useUnifiedTopology: true});
    }
    private getConnString() {
        if (this.dBType === 'localhost') {
            return ;
        }
    }
    /**
     * return database connection
     */
    public getCollections() {
        return new Promise((reject, resolve) => {
            let db_name: string = this.dBName;
            this.connection.connect(function (err: any, connect: any) {
                let db = connect.db(db_name);
                db.listCollections().toArray(( items: any,err: any) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(items);
                    }
                    connect.close();
                });
            });
        });
    }
    public getDocuments(collectionName: string) {
        return new Promise((reject, resolve) => {
            let db_name: string = this.dBName;
            this.connection.connect(function (err: any, connect: any) {
                let db = connect.db(db_name);
                let collection = db.collection(collectionName);
                collection.find().toArray((err: any, data: any) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
                    connect.close();
                });
            });
        });
    }
}