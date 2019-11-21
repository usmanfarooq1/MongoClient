import * as vscode from 'vscode';
import { DB_THREAD, DB_ACTIONS, processToBeCreated, GUI_THREAD, GUI_ACTIONS } from './ext_consts';
let fs  =require ('fs');
import { Database } from "./Database";

export class App {
    private databaseName: string = '';
    private databaseLink: string = '';
    private databaseType: string = '';
    private webviewPanel: any;
    private db: any;
    constructor() {

    }
    private guiCommunicator(message: any): void {
        switch (message.command) {
            case 'get-db-name':
                this.webviewPanel.webview.postMessage({ command: 'db-name', dbName: this.databaseName });
                break;
            case 'get-collections':
                this.db.getCollections().then((collections: any) => {
                    this.webviewPanel.webview.postMessage({ command: 'collections', collectionsList: collections });
                }).catch((error: any) => {
                    console.log('Error', error);
                });
                break;
            case 'get-documents':
                this.db.getDocuments(message.collectionName).then((documents: any) => {
                    this.webviewPanel.webview.postMessage({ command: 'documents', documentsList: documents,collection:message.collectionName });
                }).catch((error: any) => {
                    console.log('Error', error);
                });
                break;
            case 'get-document':
                this.db.getDocument(message.documentId,message.collection).then((document: any) => {
                    console.log(document);
                    this.webviewPanel.webview.postMessage({ command: 'single-document', document: document.length ? document[0]:{}  });
                }).catch((error: any) => {
                    console.log('Error', error);
                });
                break;
        }
    }
    public Init(): void {
        this.showInputSelection().then(() => {
            this.db = new Database(this.databaseName, this.databaseType);
            this.webviewPanel = vscode.window.createWebviewPanel('MongoClient', this.databaseName, vscode.ViewColumn.One, { enableScripts: true });
            this.webviewPanel.webview.onDidReceiveMessage((message: any) => {
                this.guiCommunicator(message);
            });
            // let html = fs.readFileSync ('./index.html');
            // if(html){
            //     console.log(html);
            // }
            this.webviewPanel.webview.html =`<!DOCTYPE html>
            <html lang="en">
            
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="X-UA-Compatible" content="ie=edge">
                <title>Mongo Client</title>
                <style>
                    body {
                        margin: 0%;
                        padding: 0%;
                    }
            
                    .header {
                        font-weight: bolder;
                        font-size: 8vh;
                        background-color: #0d0d0d;
                        height: 10vh;
                        text-align: center;
                        position: sticky;
                        top: 0;
                    }
            
                    html {
                        background-color: #595959;
                        color: white;
                        font-size: 5vh;
                    }
            
                    .container {
                        display: flex;
                        flex-direction: row;
                    }
            
                    .collections {
                        background-color: #404040;
                        height: 70vh;
                        width: 15vw;
                        margin-right: 3px;
                        text-align: center;
                        overflow-y: scroll;
                        overflow-x: hidden;
                        font-size:3vh;
                    }
            
                    .documents {
                        background-color: #404040;
                        height: 70vh;
                        width: 15vw;
                        margin-right: 3px;
                        text-align: center;
                        overflow-y: scroll;
                        overflow-x: hidden;
                        font-size:3vh;
                    }
            
                    .buttons-pane {
                        background-color: #0d0d0d;
                        height: 5vh;
            
                    }
            
                    .badges {
                        width: 70vw;
                        height: 5vh;
                        background-color: #404040;
                        margin-bottom: 3px;
                    }
            
                    .heading {
                        width: 15vw;
                        height: 6vh;
                        font-size:5vh;
                        margin-bottom: 3px;

                    }
            
                    .table {
                        width: 70vw;
                        height: 70vh;
                        background-color: #404040;
                        margin-bottom: 3px;
                        overflow: auto;
                        text-align:center;
                    }
            
                    ul {
                        list-style-type: none;
                        padding-inline-start: 0px;
                    }
            
                    li {
                        background-color: #262626;
                        width: 15vw;
                        height: 5vh;
                        text-align: center;
                        margin-bottom: 3px;
                        user-select: none;
                    }
            
                    li:hover {
                        cursor: pointer;
                        user-select: none;
                        background-color: #0d0d0d;
                        color: #88aff7;
                    }
                    .datatype {
                        font-style: italic;
                        color: #10af03;
                        user-select: none;
                    }
            
                    .objectSpan {
                        text-decoration: underline;
                        font-style: italic;
                        color: #0e4672;
                        cursor: pointer;
                    }
            
                    .badgeSpan {
                        border-radius: 5px;
                        user-select: none;
                        width: fit-content;
                        height: fit-content;
                        background-color: #0c43a7;
                        margin-right: 0.5vw;
                        margin-top: 10px;
                        padding: 3px;
                        cursor: pointer;
                    }
                    table {
                        border-spacing: 1rem;
                        font-size:3vh;
                        text-align:left;
                      }
                </style>
            </head>
            
            <body>
                <div class="header"><span id="database-name-span"></span></div>
                <div class="container">
                    <div class="collections">
                        <div class="heading">Collections</div>
                        <div>
                            <ul id="collection-list-ul">
                            </ul>
                        </div>
                    </div>
                    <div class="documents">
                        <div class="heading">Documents</div>
                        <ul id="document-list-ul"></ul>
                    </div>
                    <div class="viewer">
                        <div class="badges">
                        </div>
                        <div class="table">
                            <span class="heading" id="object_id"></span>
                            <table>
                                <tbody>
            
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <!--<div class="buttons-pane">
                    <button>next</button>
                    <button>prev</button>
                </div>-->
            </body>
            <script>
                const vscode = acquireVsCodeApi();
                let globalObj = {
                    document: {}
                }
            
                vscode.postMessage({
                    command: 'get-db-name',
                })
                vscode.postMessage({
                    command: 'get-collections',
                })
                window.addEventListener('message', event => {
            
                    const message = event.data; // The JSON data our extension sent
            
                    switch (message.command) {
                        case 'db-name':
                            const databaseNameSpan = document.querySelector('#database-name-span');
                            databaseNameSpan.innerHTML = message.dbName;
                            break;
                        case 'collections':
                            const collectionsUl = document.querySelector('#collection-list-ul');
                            message.collectionsList.forEach(collection => {
                                collectionsUl.insertAdjacentHTML('beforeend', '<li data-id="' + collection.name + '" class="col">' + collection.name + '</li>')
                            })
                            addClickEvents(document.querySelector('#collection-list-ul').querySelectorAll('li'), 'collections');
                            break;
                        case 'documents':
                            const documentsUl = document.querySelector('#document-list-ul');
                            removeAllChildren(documentsUl);
                            message.documentsList.forEach(document => {
                                documentsUl.insertAdjacentHTML('beforeend', '<li data-collection="' + message.collection + '" data-id="' + document._id + '" class="col"> Object_id(' + document._id.slice(0, 3) + '...' + document._id.slice(document._id.length - 3, document._id.length) + ')</li>')
                            });
                            addClickEvents(document.querySelector('#document-list-ul').querySelectorAll('li'), 'documents')
                            break;
                        case 'single-document':
                            const tBody = document.querySelector
                                ('tbody');
                            const objectClickedId = document.querySelector('#object_id');
                            objectClickedId.innerHTML ='Object_Id('+message.document._id+')';
                            globalObj.document = message.document;
                            generateTable(globalObj.document)  
                            break;
                    }
                });
                function removeAllChildren(htmlObject) {
                    htmlObject.innerHTML = ""
                }
                function generateTable(object) {
                    let tbody = document.querySelector('tbody');
                    createAllBadges();
                    removeAllChildren(tbody)
                    let keys = Object.getOwnPropertyNames(object);
                    keys.forEach(key => {
                        generateTr(tbody, key, object)
                    });
                }
                function generateBadge(key) {
                    let span = document.createElement('span');
                    span.classList.add("badgeSpan");
                    span.setAttribute('data-id', key);
                    span.innerHTML = key;
                    span.addEventListener('click', function (e) {
                        let globalObjKeys = Object.getOwnPropertyNames(globalObj);
                        let indexToStart = globalObjKeys.indexOf(e.target.dataset.id);
                        for (let index = indexToStart + 1; index < globalObjKeys.length; index++) {
                            delete globalObj[globalObjKeys[index]];
                        }
                        generateTable(globalObj[e.target.dataset.id])
                    });
                    return span;
                }
                function generateTr(body, key, object) {
                    if (typeof object[key] === 'object' && !Array.isArray(object[key])) {
                        if (Object.getOwnPropertyNames(object[key]).length) {
                            body.insertAdjacentElement('beforeend', generateTrObjectType(key, object, false));
                        } else {
                            body.insertAdjacentHTML('beforeend', '<tr class="trBorderBottom"><td><span>' + key + '<span> :</td><td><span>' + '{}' + '</span></td><td class="datatype"><span>type:' + typeof object[key] + '</span></td></tr>')
                        }
                    } else if (typeof object[key] === 'object' && Array.isArray(object[key])) {
                        if(object[key].length){
                            body.insertAdjacentElement('beforeend', generateTrObjectType(key, object, true));
                        }else{
                            body.insertAdjacentHTML('beforeend', '<tr class="trBorderBottom"><td><span>' + key + '<span> :</td><td><span>' + '[]' + '</span></td><td class="datatype"><span>type:array</span></td></tr>')
                        }
                        
                    } else {
                        body.insertAdjacentHTML('beforeend', '<tr class="trBorderBottom"><td><span>' + key + '<span> :</td><td><span>' + object[key] + '</span></td><td class="datatype"><span>type:' + typeof object[key] + '</span></td></tr>')
                    }
                }
                function createAllBadges() {
                    let badgesDiv = document.querySelector('.badges');
                    let globalObjKeys = Object.getOwnPropertyNames(globalObj);
                    removeAllChildren(badgesDiv)
                    globalObjKeys.forEach(key => {
                        badgesDiv.insertAdjacentElement('beforeend', generateBadge(key));
                    });
                }
                function generateTd(key, object, isType, isKey, isArray) {
                    let td = document.createElement('td');
                    let keySpan = document.createElement('span');
                    if (isKey) {
                     
                        keySpan.classList.add("objectSpan");
                        keySpan.addEventListener('click', (e) => {
                            let globalObjKeys = Object.getOwnPropertyNames(globalObj);
                            let spanId =e.target.dataset.id;
                            if (spanId[0] === '#' &&spanId[spanId.length - 1] === '#') {
                                let sliceId = spanId.slice(1,spanId.length-1);              
                                globalObj[spanId] = globalObj[globalObjKeys[globalObjKeys.length - 1]][sliceId];
                                generateTable(globalObj[spanId]);
                            } else {
                                globalObj[spanId] = globalObj[globalObjKeys[globalObjKeys.length - 1]][spanId];
                                generateTable(globalObj[spanId]);
                            }
            
                        })
                        // if(parseInt(key))
                        keySpan.setAttribute('data-id', isNaN(key) ? key : '#' + key + '#');
                        keySpan.innerHTML = key + ' :';
                    } else if (isType) {
                        td.classList.add('datatype');
                        if (isArray) {
                            keySpan.innerHTML = ' type:array';
                        } else {
                            keySpan.innerHTML = ' type:object';
                        }
                    } else {
                        if (isArray) {
                            keySpan.innerHTML = '[...]';
                        } else {
                            keySpan.innerHTML = '{...}';
                        }
                    }
                    td.appendChild(keySpan)
                    return td;
                }
                function generateTrObjectType(key, object, isArray) {
                    let tr = document.createElement('tr');
                    tr.classList.add('trBorderBottom');
                    let keytd = generateTd(key, object, false, true, isArray);
                    let text = generateTd(key, object, false, false, isArray);
                    let type = generateTd(key, object, true, false, isArray);
                    tr.appendChild(keytd);
                    tr.appendChild(text);
                    tr.appendChild(type);
                    return tr;
                }
                function addClickEvents(list, type) {
                    if (type === 'collections') {
                        list.forEach(li => {
                            li.addEventListener('click', function (e) {
                                vscode.postMessage({
                                    command: 'get-documents',
                                    collectionName: li.dataset.id
                                })
                            })
                        })
                    } else if (type === 'documents') {
                        list.forEach(li => {
                            li.addEventListener('click', function (e) {
                                vscode.postMessage({
                                    command: 'get-document',
                                    documentId: li.dataset.id,
                                    collection: li.dataset.collection
                                })
                            })
                        })
                    }
                }
            </script>
            
            </html>`; 
                 
            
            

        }).catch(err => {
            console.log(err);
        });
    }
    private showInputSelection() {
        return new Promise((resolve, reject) => {
            vscode.window.showQuickPick(['local', 'mongodb atlas', 'mlab']).then(option => {
                if (option) {
                    vscode.window.showInputBox({ placeHolder: 'Enter database name' }).then((name) => {
                        if (option && name) {
                            switch (option) {
                                case 'local':
                                    this.databaseLink = "mongodb://localhost:27017/";
                                    this.databaseType = option;
                                    this.databaseName = name;
                                    break;

                                default:
                                    break;
                            }
                        }
                        resolve();
                    });

                } else {
                    reject({});
                }
            });
        });
    }
}