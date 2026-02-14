// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

export class AamFixer implements vscode.CodeActionProvider {
    public static readonly providedCodeActionKinds = [
        vscode.CodeActionKind.QuickFix
    ];

    provideCodeActions(document: vscode.TextDocument, range: vscode.Range | vscode.Selection, context: vscode.CodeActionContext): vscode.CodeAction[] {
        const actions: vscode.CodeAction[] = [];

        context.diagnostics.forEach(diagnostic => {
            if (diagnostic.code === 'invalidKey') {
                actions.push(this.createFix(document, diagnostic, "Clean key (remove invalid characters)", /[a-zA-Z0-9_\s]/g));
            }
            if (diagnostic.code === 'invalidValue') {
                actions.push(this.createFix(document, diagnostic, "Clean value (remove invalid characters)", /[a-zA-Z0-9_\s"'#]/g));
            }
            if (diagnostic.code === 'missingEqual') {
                actions.push(this.createMissingEqualFix(document, diagnostic));
            }
        });

        return actions;
    }

    private createFix(document: vscode.TextDocument, diagnostic: vscode.Diagnostic, title: string, allowedPattern: RegExp): vscode.CodeAction {
        const fix = new vscode.CodeAction(title, vscode.CodeActionKind.QuickFix);
        fix.diagnostics = [diagnostic];
        fix.isPreferred = true;

        const edit = new vscode.WorkspaceEdit();
        const badText = document.getText(diagnostic.range);
        
        const fixedText = badText.match(allowedPattern)?.join('') || "";
        
        edit.replace(document.uri, diagnostic.range, fixedText);
        fix.edit = edit;
        return fix;
    }

    private createMissingEqualFix(document: vscode.TextDocument, diagnostic: vscode.Diagnostic): vscode.CodeAction {
            const fix = new vscode.CodeAction("Add '='", vscode.CodeActionKind.QuickFix);
            fix.diagnostics = [diagnostic];
            
            const edit = new vscode.WorkspaceEdit();
            const line = document.lineAt(diagnostic.range.start.line);
            const firstWordMatch = line.text.match(/^\s*([^\s=]+)/);
            if (firstWordMatch) {
                const pos = new vscode.Position(line.lineNumber, firstWordMatch[0].length);
                edit.insert(document.uri, pos, " = ");
            }
            
            fix.edit = edit;
            return fix;
        }
}

export function activate(context: vscode.ExtensionContext) {
    const diagnosticCollection = vscode.languages.createDiagnosticCollection('aam');
    context.subscriptions.push(diagnosticCollection);

    function updateDiagnostics(document: vscode.TextDocument) {
        if (document.languageId !== 'aam') {
            return;
        }

        const diagnostics: vscode.Diagnostic[] = [];

        for (let i = 0; i < document.lineCount; i++) {
    const line = document.lineAt(i);
    if (line.isEmptyOrWhitespace) {continue;}

    const text = line.text;

    const validPattern = /^\s*([a-zA-Z0-9_\s]+)\s*=\s*([a-zA-Z0-9_\s"'#]+)\s*$/;
    const match = validPattern.exec(text);

    if (match) {continue;}

    const equalIndex = text.indexOf('=');

    if (equalIndex === -1) {
        const diag = new vscode.Diagnostic(
            line.range,
            "Invalid format. Expected 'key=value'. Missing '='.",
            vscode.DiagnosticSeverity.Error
        );
        diag.code = 'missingEqual';
        diagnostics.push(diag);
    } else {
        const keyTrimmed = text.substring(0, equalIndex).trim();
        const valueTrimmed = text.substring(equalIndex + 1).trim();
        
        if (keyTrimmed.length === 0) {
            const diag = new vscode.Diagnostic(new vscode.Range(i, 0, i, equalIndex), "Missing key.", vscode.DiagnosticSeverity.Error);
            diag.code = 'missingKey';
            diagnostics.push(diag);
} else if (!/^[a-zA-Z0-9_\s]+$/.test(keyTrimmed)) {
    const keyStart = text.indexOf(keyTrimmed);
    const diag = new vscode.Diagnostic(new vscode.Range(i, keyStart, i, equalIndex), "Key contains invalid characters.", vscode.DiagnosticSeverity.Error);
    diag.code = 'invalidKey';
    diagnostics.push(diag);
}

if (valueTrimmed.length === 0) {
            const diag = new vscode.Diagnostic(new vscode.Range(i, equalIndex + 1, i, text.length), "Missing value.", vscode.DiagnosticSeverity.Error);
            diag.code = 'missingValue';
            diagnostics.push(diag);
        } else if (!/^[a-zA-Z0-9_\s"'#]+$/.test(valueTrimmed)) {
            const valStart = text.indexOf(valueTrimmed, equalIndex + 1);
            const diag = new vscode.Diagnostic(new vscode.Range(i, valStart, i, text.length), "Value contains invalid characters.", vscode.DiagnosticSeverity.Error);
            diag.code = 'invalidValue';
            diagnostics.push(diag);
        }
    }
}

        diagnosticCollection.set(document.uri, diagnostics);
    }

    // Trigger on changes and open
    if (vscode.window.activeTextEditor) {
        updateDiagnostics(vscode.window.activeTextEditor.document);
    }
    
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(editor => {
            updateDiagnostics(editor.document);
        }),
        vscode.workspace.onDidOpenTextDocument(doc => {
            updateDiagnostics(doc);
        }),
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor) {
                updateDiagnostics(editor.document);
            }
        })
    );
    context.subscriptions.push(
        vscode.languages.registerCodeActionsProvider('aam', new AamFixer(), {
            providedCodeActionKinds: AamFixer.providedCodeActionKinds
        })
    );
}


export function deactivate() {}
