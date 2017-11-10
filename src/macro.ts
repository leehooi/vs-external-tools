import * as vscode from 'vscode';
import * as path from 'path'
import * as clipboardy from 'clipboardy'

class Macro {
    ItemPath: string;
    ItemDir: string;
    ItemFileName: string;
    ItemExt: string;
    ProjectDir: string;
    Clipboard: string;

    replace(input: string) {
        if (!input) {
            return undefined;
        }
        let replaced = input;
        for (let key in this) {
            replaced = replaced.replace(`$(${key})`, this[key]);
        }
        return replaced;
    }
}

export function create(): Promise<Macro> {
    let macro = new Macro();
    return Promise.all([
        getActiveFilePath().then(value => { macro.ItemPath = value; }),
        getActiveFileDirectory().then(value => { macro.ItemDir = value; }),
        getActiveFileName().then(value => { macro.ItemFileName = value; }),
        getActiveFileExtension().then(value => { macro.ItemExt = value; }),
        getWorkspaceRootPath().then(value => { macro.ProjectDir = value; }),
        getClipboard().then(value => { macro.Clipboard = value; }),
    ]).then(() => {
        return macro;
    });
} 

function getActiveFilePath(): Promise<string> {
    return Promise.resolve(vscode.window.activeTextEditor.document.fileName);
}

function getActiveFileDirectory(): Promise<string> {
    return Promise.resolve(path.dirname(vscode.window.activeTextEditor.document.fileName));
}

function getActiveFileName(): Promise<string> {
    return getActiveFileExtension().then((ext) => {
        return path.basename(vscode.window.activeTextEditor.document.fileName, ext);
    });
}

function getActiveFileExtension(): Promise<string> {
    return Promise.resolve(path.extname(vscode.window.activeTextEditor.document.fileName));
}

function getWorkspaceRootPath(): Promise<string> {
    if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
        return Promise.resolve(vscode.workspace.workspaceFolders[0].uri.fsPath);
    }
    return Promise.resolve(undefined);
}

function getClipboard(): Promise<string>{
    return clipboardy.read();
}