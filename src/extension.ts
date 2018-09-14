"use strict";
import * as vscode from "vscode";
import * as fs from "fs-extra";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "pomeroy4690" is now active!');

  let outputToInput = vscode.commands.registerCommand(
    "4690.OutputToInput",
    async () => {
      var currentlyOpenTabfilePath = "";
      if (vscode.window.activeTextEditor) {
        currentlyOpenTabfilePath =
          vscode.window.activeTextEditor.document.fileName;
      }
      var inputPath = currentlyOpenTabfilePath.replace("output", "input");
      try {
        await fs.copy(currentlyOpenTabfilePath, inputPath);
        vscode.workspace.openTextDocument(inputPath).then(doc => {
          vscode.window.showTextDocument(doc);
        });
        vscode.window.showInformationMessage(
          "Opened file you should be in input now"
        );
      } catch (err) {
        vscode.window.showWarningMessage("Couldn't open file!");
        return;
      }
    }
  );
  let setup4690 = vscode.commands.registerCommand("4690.setup", async () => {
    var cwd = vscode.workspace.rootPath;
    var setupString =
      '{ \n  "configurations": [ \n    { \n      "name": "Win32", \n      "includePath": [ \n        "${workspaceFolder}/**", \n        "${workspaceFolder}/ace/rogue", \n        "C:/ibmcxxw/include", \n        "${workspaceFolder}/ace/include", \n        "${workspaceFolder}/ace/mgv/include", \n        "${workspaceFolder}/ace/mgv/commoncp", \n        "${workspaceFolder}/ace/trans", \n        "${workspaceFolder}/ace/bm", \n        "${workspaceFolder}/ace/ace", \n        "${workspaceFolder}/CUST/LVL/output/include/", \n        "${workspaceFolder}/CUST/LVL/output/include/nrsc", \n        "${workspaceFolder}/CUST/LVL/output/include/CUST", \n        "${workspaceFolder}/CUST/LVL/input/include/" \n      ], \n      "defines": ["_DEBUG", "UNICODE", "_UNICODE"], \n      "intelliSenseMode": "msvc-x64" \n    } \n  ], \n  "version": 4 \n} ';
    let cust = "";
    let lvl = "";
    let os = "";
    await vscode.window
      .showInputBox({ prompt: "Enter the name of the customer folder" })
      .then(value => {
        if (value) {
          cust = value;
        }
      });
    await vscode.window
      .showInputBox({ prompt: "Enter the name of the level folder" })
      .then(value => {
        if (value) {
          lvl = value;
        }
      });
    await vscode.window
      .showInputBox({ prompt: "Enter the name of the flat os" })
      .then(value => {
        if (value) {
          os = value;
        }
      });

    if (cust === "" || lvl === "" || os === "") {
      vscode.window.showErrorMessage(
        "You must enter a customer, a level and a os"
      );
      return;
    }
    setupString = setupString.replace(/CUST/g, cust);
    setupString = setupString.replace(/LVL/g, lvl);
    fs.ensureDirSync(cwd + "\\.vscode");
    fs.writeFile(cwd + "\\.vscode\\c_cpp_properties.json", setupString, err => {
      if (err) {
        vscode.window.showErrorMessage("Something went wrong: " + err.message);
      }
    });
  });
  context.subscriptions.push(outputToInput);
  context.subscriptions.push(setup4690);
}
export function deactivate() {}
