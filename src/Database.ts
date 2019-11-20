let MongoClient = require('mongodb').MongoClient;
let mongo = require('mongodb');
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
                if(err){
                    // connect.close();
                    reject(err);
                }
                let db = connect.db(db_name);
                db.listCollections().toArray(( items: any,err: any) => {
                    if (err) {
                        // connect.close();
                        reject(err);
                    } else {
                        // connect.close();
                        resolve(items);
                    }
                    // connect.close();
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
                collection.find().toArray(( data: any,err: any) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
                    // connect.close();
                });
            });
        });
    }
    public getDocument(id: string,collectionName: string) {
        return new Promise((reject, resolve) => {
            let db_name: string = this.dBName;
            this.connection.connect(function (err: any, connect: any) {
                let db = connect.db(db_name);
                let collection = db.collection(collectionName);
                let o_id = new mongo.ObjectID(id);
                collection.find({_id:o_id}).toArray(( data: any,err: any) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
                    // connect.close();
                });
            });
        });
    }
}