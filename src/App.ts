import * as vscode from 'vscode';
import { DB_THREAD, DB_ACTIONS, processToBeCreated, GUI_THREAD, GUI_ACTIONS } from './ext_consts';
import { Database } from "./Database";

export class App {
    private databaseName: string = '';
    private databaseLink: string = '';
    private databaseType: string = '';

    constructor() {

    }
    public Init(): void {
        this.showInputSelection().then(() => {
            const db = new Database(this.databaseName, this.databaseType);
            const mainPanel = vscode.window.createWebviewPanel('MongoClient', this.databaseName, vscode.ViewColumn.One, { enableScripts: true });

            mainPanel.webview.onDidReceiveMessage(message => {
                if (message.command === 'alert') {
                    db.getCollections().then((collections: any) => {
                        mainPanel.webview.postMessage({ command: 'alert', data: collections[0].name });
                    }).catch((error:any) => {
                        console.log('Error', error);
                    });
                }
            });
            mainPanel.webview.html = `
            <!DOCTYPE html>
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
                    html {
                        background-color: #595959;
                        color: white;
                    }
                    .container {
                        display: grid;
                        grid-gap: 3px;
                        grid-template-columns: repeat(12, 1fr);
                        grid-template-rows: repeat(12, 1fr);
                        height: 100vh;
                    }
                    .center {
                        display: grid;
                        justify-content: center;
                        align-content: center;
                    }
                    .centerButtons {
                        display: grid;
                        grid-template-columns: repeat(2,100px);
                        grid-template-rows: 1fr;
                        justify-content: center;
                        /* align-content: center; */
                    }
                    .centerButtons>button{
                        height: 50px;
                        margin-right: 5px;
                        background-color:#0c43a7 ;
                        color: white;
                        font-weight: bolder;
                        user-select: none;
                    }
                    .title {
                        font-size: 25px;
                        font-weight: bolder;
                    }
            
                    .header {
                        font-weight: bolder;
                        font-size: 40px;
                        background-color: #0d0d0d;
                        grid-column: 1/-1;
                        grid-row: 1/2;
                        position: sticky;
                        top: 0;
                    }
                    .collections {
                        grid-column: 1/3;
                        grid-row: 2/-1;
                        background-color: #404040;
                    }
                    .documents {
                        grid-column: 3/5;
                        grid-row: 2/-1;
                        background-color: #404040;
                    }
                    .badges {
                        grid-column: 5/-1;
                        grid-row: 2/3;
                        background-color: #404040;
                    }
                    .viewer {
                        grid-column: 5/-1;
                        grid-row: 3/-2;
                        background-color: #404040;
                    }
                    .button-pane {
                        grid-column: 5/-1;
                        grid-row: -2/-1;
                        background-color: #404040;
                    }
                    ul {
                        list-style-type: none;
                        padding-inline-start: 0px;
                    }
                    li {
                        background-color: #262626;
                        width: 100%;
                        height: 30px;
                        text-align: center;
                        margin-bottom: 3px;
                        user-select: none;
                    }
                    .fontSize20 {
                        font-size: 20px;
                    }
                    .badgeSpan {
                        border-radius: 5px;
                        user-select: none;
                        width: fit-content;
                        height: fit-content;
                        background-color: #0c43a7;
                        font-size: 16px;
                        margin-right: 3px;
                        margin-top: 10px;
                        padding: 3px;
                    }
                    .badges-center {
                        margin-top: 1.5%;
                    }
                    li:hover {
                        cursor: pointer;
                        user-select: none;
                        background-color: #0d0d0d;
                        color: #88aff7;
                    }
                    .marginRight10 {
                        margin-right: 10px;
                    }
                    /* td {
                        padding-right: 25px;
                    } */
                    .tableStyle{
                        border-spacing: 25px;
                        /* border-bottom: 3px solid #595959; */
                    }
                    .datatype {
                        font-style: italic;
                        color: violet;
                        user-select: none;
                    }
                    .trBorderBottom{
                        border-bottom: 3px solid #595959;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header center"><span id = "database-name-span"></span></div>
                    <div class="collections">
                        <div class="center title"><span>Collections</span></div>
                        <div class="collection-list">
                            <ul id="collection-list-ul" class="fontSize20">
                               
                            </ul>
                        </div>
                    </div>
                    <div class="documents">
                        <div class="center title">
                            <span>Documents</span>
                        </div>
                        <div class="document-list">
                            <ul id="document-list" class="fontSize20">
                                
                            </ul>
                        </div>
                    </div>
                    <div class="badges">
                        <div class="badges-center">
                            <span class="badgeSpan">syed</span>
                            <span class="badgeSpan">usman</span>
                            <span class="badgeSpan">farooq</span>
                        </div>
                    </div>
                    <div class="viewer">
                        <div class="center title">
                            <span>DOCUMENT ID</span>
                        </div>
                        <div class="marginRight10 fontSize20">
                            <table class="tableStyle">
                                <tbody style="width: 100%;">
                                    <tr class="trBorderBottom">
                                        <td><span>usman<span> :</td>
                                        <td><span>"farooq"</span></td>
                                        <td class="datatype"><span>type:string</span></td>
                                    </tr>
                                    <tr class="trBorderBottom">
                                        <td><span>usman<span> :</td>
                                        <td><span>"farooq"</span></td>
                                        <td class="datatype"><span>type:string</span></td>
                                    </tr>
                                    <tr class="trBorderBottom">
                                        <td><span>usman<span> :</td>
                                        <td><span>"farooq"</span></td>
                                        <td class="datatype"><span>type:string</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="button-pane">
                        <div class="centerButtons">
                            <button class="fontSize20">Prev</button>
                            <button class="fontSize20">Next</button>
                        </div>
                    </div>
                </div>
            </body>
            
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