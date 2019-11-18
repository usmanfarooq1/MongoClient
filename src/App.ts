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
            mainPanel.webview.html = `<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Mongo Client</title>
                    <style>
                    h1{
                        color: red;
                    }
                    </style>
                </head>
                <body>
                <h1 id="lines-of-code-counter">0</h1>
asdasdsadasddddasaaaaaaaaaasssssssssssssssss
                <script>
                const vscode = acquireVsCodeApi();
                    const counter = document.getElementById('lines-of-code-counter');
            
                    vscode.postMessage({
                        command: 'alert',
                        
                    })
                    window.addEventListener('message', event => {

                        const message = event.data; // The JSON data our extension sent
            
                        switch (message.command) {
                            case 'alert':
                                counter.textContent = message.data;
                                break;
                        }
                    });
                </script>
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