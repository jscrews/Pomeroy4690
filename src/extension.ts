"use strict";
import * as vscode from "vscode";
import * as fs from "fs-extra";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "pomeroy4690" is now active!');
  var buildTargets = ["jsifts10", "acecsmll", "bldace"];
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
  let addBuildTarget = vscode.commands.registerCommand(
    "4690.addBuildTarget",
    () => {
      vscode.window
        .showInputBox({ prompt: "Enter the build target to add" })
        .then(value => {
          if (value) {
            buildTargets.push(value);
          }
        });
    }
  );
  let setup4690 = vscode.commands.registerCommand("4690.setup", async () => {
    var cwd = vscode.workspace.rootPath;
    var setupString =
      '{ \n  "configurations": [ \n    { \n      "name": "Win32", \n      "includePath": [ \n        "${workspaceFolder}/**", \n        "${workspaceFolder}/ace/rogue", \n        "C:/ibmcxxw/include", \n        "${workspaceFolder}/ace/include", \n        "${workspaceFolder}/ace/mgv/include", \n        "${workspaceFolder}/ace/mgv/commoncp", \n        "${workspaceFolder}/ace/trans", \n        "${workspaceFolder}/ace/bm", \n        "${workspaceFolder}/ace/ace", \n        "${workspaceFolder}/CUST/LVL/output/include/", \n        "${workspaceFolder}/CUST/LVL/output/include/nrsc", \n        "${workspaceFolder}/CUST/LVL/output/include/CUST", \n        "${workspaceFolder}/CUST/LVL/input/include/" \n      ], \n      "defines": ["_DEBUG", "UNICODE", "_UNICODE"], \n      "intelliSenseMode": "msvc-x64" \n    } \n  ], \n  "version": 4 \n} ';

    if (cwd && cwd[0].toLocaleLowerCase() === "d") {
      setupString = setupString.replace(/C:/, "D:");
    }
    var cust = "";
    var lvl = "";
    var os = "";
    var vers = [""];
    if (cwd) {
      vers = cwd.match(/V\dR\d/) || [""];
    }
    var version = vers[0];
    if (version == "") {
      vscode.window.showErrorMessage(
        "Something is wrong with you file structure could find out what version you are on."
      );
      return;
    }
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
      .showInputBox({ prompt: "Enter the level of the flat os" })
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
    lvl = lvl.toLocaleUpperCase();
    var bldLvl = lvl.substring(0, 4);
    console.log(bldLvl);
    os = os.toLocaleUpperCase();
    setupString = setupString.replace(/CUST/g, cust);
    setupString = setupString.replace(/LVL/g, lvl);
    fs.ensureDirSync(cwd + "\\.vscode");
    fs.writeFile(cwd + "\\.vscode\\c_cpp_properties.json", setupString, err => {
      if (err) {
        vscode.window.showErrorMessage("Something went wrong: " + err.message);
      }
    });
    var taskString = '{\n  "version": "2.0.0",\n  "tasks": [\n';
    var i;
    for (i = 0; i < buildTargets.length; i++) {
      taskString =
        taskString +
        '    {\n      "label": "make ' +
        buildTargets[i] +
        ' nt",\n      "type": "shell",\n      "command": "cd ' +
        cust +
        "\\\\" +
        lvl +
        " && acent " +
        bldLvl +
        " " +
        version +
        " && make " +
        buildTargets[i] +
        '"\n    },\n';
      taskString =
        taskString +
        '    {\n      "label": "make ' +
        buildTargets[i] +
        ' flat",\n      "type": "shell",\n      "command": "cd ' +
        cust +
        "\\\\" +
        lvl +
        " && aceflat " +
        bldLvl +
        " " +
        version +
        " " +
        os +
        " && make " +
        buildTargets[i];
      if (i == buildTargets.length) {
        taskString = taskString + '"\n    }\n';
      } else {
        taskString = taskString + '"\n    },\n';
      }
    }
    taskString = taskString + "  ]\n}";
    fs.writeFile(cwd + "\\.vscode\\tasks.json", taskString, err => {
      if (err) {
        vscode.window.showErrorMessage("Couldn't create tasks file!");
      }
    });
  });
  context.subscriptions.push(outputToInput);
  context.subscriptions.push(setup4690);
  context.subscriptions.push(addBuildTarget);
}
export function deactivate() {}
