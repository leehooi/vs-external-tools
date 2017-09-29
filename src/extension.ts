'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as process from 'child_process'
import * as path from 'path'
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "vs-external-tools" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let commands = vscode.extensions.getExtension('lihui.vs-external-tools').packageJSON.contributes.commands;
    for(let command of commands){
        let disposable = vscode.commands.registerCommand(command.command, () => {
            // The code you place here will be executed every time your command is executed
            executeCommand(vscode.workspace.getConfiguration(command.command));
        });

        context.subscriptions.push(disposable);
    }
}

function executeCommand(config:vscode.WorkspaceConfiguration) {
    let command = config.get<string>('command');
    let args = config.get<string[]>('args', []);
    let cwd = config.get<string>('cwd');
    
    if(!command){
        return ;
    }

    let macro = {
        ItemPath: getActiveFilePath(),
        ItemDir: getActiveFileDirectory(),
        ItemFileName: getActiveFileName(),
        ItemExt: getActiveFileExtension(),
        ProjectDir: getWorkspaceRootPath()
    };

    let replacedArgs = args.map((arg) => {
        return replaceWithMacro(arg, macro);
    });

    let replacedCwd = replaceWithMacro(cwd, macro) || macro.ProjectDir || macro.ItemDir;
    try {
        process.spawn(command, replacedArgs, {
            cwd: replacedCwd
        });
    } catch (err) {
        console.log(err);
    }
}

function getActiveFilePath(): string {
    return vscode.window.activeTextEditor.document.fileName;
}

function getActiveFileDirectory(): string {
    return path.dirname(vscode.window.activeTextEditor.document.fileName);
}

function getActiveFileName(): string {
    return path.basename(vscode.window.activeTextEditor.document.fileName, getActiveFileExtension());
}

function getActiveFileExtension(): string {
    return path.extname(vscode.window.activeTextEditor.document.fileName);
}

function getWorkspaceRootPath(): string {
    if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
        return vscode.workspace.workspaceFolders[0].uri.fsPath;
    }
    return undefined;
}

function replaceWithMacro(input: string, macro: any) {
    if(!input){
        return undefined;
    }
    let replaced = input;
    for (let key in macro) {
        replaced = replaced.replace(`$(${key})`, macro[key]);
    }
    return replaced;
}

// this method is called when your extension is deactivated
export function deactivate() {
}