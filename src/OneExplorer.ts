/*
 * Copyright (c) 2022 Samsung Electronics Co., Ltd. All Rights Reserved
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as fs from 'fs';
import * as ini from 'ini';
import * as path from 'path';
import {TextEncoder} from 'util';
import * as vscode from 'vscode';

import {CfgEditorPanel} from './CfgEditor/CfgEditorPanel';
import {ToolArgs} from './Project/ToolArgs';
import {ToolRunner} from './Project/ToolRunner';
import {obtainWorkspaceRoot} from './Utils/Helpers';
import {Logger} from './Utils/Logger';

/**
 * Read an ini file
 * @param filePath
 * @returns `object` if file read is successful, or `null` if file open has failed
 *
 */
function readIni(filePath: string): object|null {
  let configRaw: string;
  try {
    configRaw = fs.readFileSync(filePath, 'utf-8');
  } catch (e) {
    console.error(e);
    return null;
  }

  // TODO check if toString() is required
  return ini.parse(configRaw.toString());
}


/**
 * The term is unique for OneExplorer.
 * It may not correspond to which of other modules.
 */
enum NodeType {
  /**
   * A base model from which ONE imports 'circle'.
   * (.onnx, .tflite, .tf, ..)
   */
  baseModel,

  /**
   * All intermediate model files transformed(compiled/quantized/optimized) from a 'base model'.
   * (.circle, .tvn, ...)
   */
  derivedModel,

  /**
   * A directory which contains any baseModel.
   */
  directory,

  /**
   * An ONE configuration file for onecc.
   * Which imports a targetted 'baseModel' (NOTE baseModel:config has 1:N relationship)
   */
  config,
}

function nodeTypeToStr(t: NodeType): string {
  return NodeType[t];
}

class Node {
  type: NodeType;
  childNodes: Node[];
  uri: vscode.Uri;

  constructor(type: NodeType, childNodes: Node[], uri: vscode.Uri) {
    this.type = type;
    this.childNodes = childNodes;
    this.uri = uri;
  }

  get path(): string {
    return this.uri.fsPath;
  }

  get parent(): string {
    return path.dirname(this.uri.fsPath);
  }

  get name(): string {
    return path.parse(this.uri.fsPath).base;
  }

  get ext(): string {
    return path.extname(this.uri.fsPath);
  }
}

/**
 * Create `ParsedConfig` for the given uri, when it satisfies:
 * (1) the uri can be parsed as ini object
 * (2) it contains a base model (one-import-*)
 * (3) the base model exists in the filesystem
 * @param uri
 * @returns
 */
function parseConfig(uri: vscode.Uri):
    {baseModels: vscode.Uri[]|null, derivedModels: vscode.Uri[]|null} {
  // Parse the ini file
  const iniObj = readIni(uri.fsPath);
  if (iniObj === null) {
    console.error(`Cannot open ${uri.fsPath}`);
    return {baseModels: null, derivedModels: null};
  }

  /**
   * Find base models written in the ini object and return the absolute path.
   *
   * NOTE
   * onecc doesn't support a configuration with multiple base models.
   * Explorer shows the config node below multiple base models though, while showing error on
   * console.
   */
  const findBaseModels = (iniObj: object): vscode.Uri[]|null => {
    const baseModels = ['tflite','pb','onnx']
    .filter(ext=>iniObj[`one-import-${ext}` as keyof typeof iniObj] ?.['input_path'] !== undefined)
    .map(ext => iniObj[`one-import-${ext}` as keyof typeof iniObj] ?.['input_path'])
    .map(relpath=>path.join(path.dirname(uri.fsPath),relpath))
    .map(abspath=>vscode.Uri.file(abspath));

    if (baseModels.length > 1) {
      // TODO Display this config with warning mark on the icon to notify user that it contains an
      // error
      console.warn(`Warning: There are multiple input models in the configuration. (path: ${uri})`);
    }

    if (baseModels.length === 0) {
      // TODO Display orphan configs somewhere
      console.warn(`Warning: There is no input model in the configuration. (path: ${uri})`);
    }

    return baseModels;
  };

  /**
   * Find derived models written in the ini object and return the absolute path.
   */
  const findDerivedModels = (iniObj: object): vscode.Uri[]|null => {
    const derivedModelLocator = [
      {section: 'one-import-tf', key: 'output_path'},
      {section: 'one-import-tflite', key: 'output_path'},
      {section: 'one-import-onnx', key: 'output_path'},
      {section: 'one-import-bcq', key: 'output_path'},
      {section: 'one-optimize', key: 'input_path'},
      {section: 'one-optimize', key: 'output_path'},
      {section: 'one-quantize', key: 'input_path'},
      {section: 'one-quantize', key: 'output_path'},
      {
        section: 'one-codegen',
        key: 'command',
        filt: (str: string): string[] => {
          return str.split(' ').filter(
              e => path.extname(e) === '.tvn' || path.extname(e) === '.circle');
        }
      },
    ];

    let derivedModels: string[] = [];
    for (let loc of derivedModelLocator) {
      let confSection = iniObj[loc.section as keyof typeof iniObj];
      let confKey = confSection ?.[loc.key as keyof typeof iniObj];
      if (confKey) {
        const greppedModels = loc.filt ? loc.filt(confKey) : [confKey];
        for (let model of greppedModels) {
          if (derivedModels.includes(model) === false) {
            derivedModels.push(model);
          }
        }
      }
    }

    return derivedModels.map(relpath => path.join(path.dirname(uri.fsPath), relpath))
        .map(abspath => vscode.Uri.file(abspath));
  };

  return {baseModels: findBaseModels(iniObj), derivedModels: findDerivedModels(iniObj)};
}

export class OneNode extends vscode.TreeItem {
  constructor(
      public readonly label: string,
      public readonly collapsibleState: vscode.TreeItemCollapsibleState,
      public readonly node: Node,
  ) {
    super(label, collapsibleState);

    this.tooltip = `${this.node.path}`;

    if (node.type === NodeType.config) {
      this.iconPath = new vscode.ThemeIcon('gear');
    } else if (node.type === NodeType.directory) {
      this.iconPath = vscode.ThemeIcon.Folder;
    } else if (node.type === NodeType.baseModel) {
      this.iconPath = vscode.ThemeIcon.File;
    } else if (node.type === NodeType.derivedModel) {
      this.iconPath = vscode.ThemeIcon.File;
    }

    // To show contextual menu on items in OneExplorer,
    // we have to use "when" clause under "view/item/context" under "menus".
    // We first try to use the following:
    //    "when": "view == OneExplorerView && resourceExtname == .cfg"
    //
    // However, resourceExtname returns info of vscode Explorer view (not of OneExplorer).
    //    "when": "view == OneExplorerView && viewItem == config"
    this.contextValue = nodeTypeToStr(node.type);
  }
}

export class OneTreeDataProvider implements vscode.TreeDataProvider<OneNode> {
  private _onDidChangeTreeData: vscode.EventEmitter<OneNode|undefined|void> =
      new vscode.EventEmitter<OneNode|undefined|void>();
  readonly onDidChangeTreeData: vscode.Event<OneNode|undefined|void> =
      this._onDidChangeTreeData.event;

  // TODO(dayo) Get the ext list(cfg,tflite..) from backend
  private fileWatcher =
      vscode.workspace.createFileSystemWatcher(`**/*.{cfg,tflite,onnx,circle,tvn}`);

  constructor(private workspaceRoot: vscode.Uri) {
    const fileWatchersEvents =
        [this.fileWatcher.onDidCreate, this.fileWatcher.onDidChange, this.fileWatcher.onDidDelete];

    for (let event of fileWatchersEvents) {
      event(() => this._onDidChangeTreeData.fire());
    }
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  /**
   * Create ONE configuration file for a base model
   * Input box is prefilled as <base model's name>.cfg
   * The operation will be cancelled if the file already exists.
   *
   * @param oneNode A base model to create configuration
   */
  createCfg(oneNode: OneNode): void {
    const dirName = path.parse(oneNode.node.path).dir;
    const modelName = path.parse(oneNode.node.path).name;
    const extName = path.parse(oneNode.node.path).ext.slice(1);

    const encoder = new TextEncoder;
    // TODO(dayo) Auto-configure more fields
    const content = encoder.encode(`
[onecc]
one-import-${extName}=True
[one-import-${extName}]
input_path=${modelName}.${extName}
`);

    vscode.window
        .showInputBox({
          title: `Create ONE configuration of '${modelName}.${extName}' :`,
          placeHolder: `${modelName}.cfg`,
          value: `${modelName}.cfg`
        })
        .then(value => {
          const cfgPath = `${dirName}/${value}`;
          try {
            if (fs.existsSync(cfgPath)) {
              vscode.window.showInformationMessage(`Cancelled: Path already exists (${cfgPath})`);
              return;
            }
          } catch (err) {
            console.error(err);
            return;
          }

          vscode.workspace.fs.writeFile(vscode.Uri.file(cfgPath), content);
        });
  }

  getTreeItem(element: OneNode): vscode.TreeItem {
    return element;
  }

  getChildren(element?: OneNode): OneNode[]|Thenable<OneNode[]> {
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage('Cannot find workspace root');
      return Promise.resolve([]);
    }

    if (element) {
      return Promise.resolve(this.getNode(element.node));
    } else {
      return Promise.resolve(this.getNode(this.getTree(this.workspaceRoot)));
    }
  }

  private getNode(node: Node): OneNode[] {
    const toOneNode = (node: Node): OneNode => {
      if (node.type === NodeType.directory) {
        return new OneNode(node.name, vscode.TreeItemCollapsibleState.Expanded, node);
      } else if (node.type === NodeType.derivedModel) {
        return new OneNode(node.name, vscode.TreeItemCollapsibleState.None, node);
      } else if (node.type === NodeType.baseModel) {
        return new OneNode(
            node.name,
            (node.childNodes.length > 0) ? vscode.TreeItemCollapsibleState.Collapsed :
                                           vscode.TreeItemCollapsibleState.None,
            node);
      } else {  // (node.type == NodeType.config)
        let oneNode = new OneNode(
            node.name,
            (node.childNodes.length > 0) ? vscode.TreeItemCollapsibleState.Collapsed :
                                           vscode.TreeItemCollapsibleState.None,
            node);
        oneNode.command = {
          command: 'onevscode.open-cfg',
          title: 'Open File',
          arguments: [oneNode.node]
        };
        return oneNode;
      }
    };

    return node.childNodes.map(node => toOneNode(node));
  }

  private getTree(rootPath: vscode.Uri): Node {
    const node = new Node(NodeType.directory, [], rootPath);

    this.searchNode(node);
    return node;
  }

  /**
   * Construct a tree under the given node
   * @returns void
   */
  private searchNode(node: Node) {
    const files = fs.readdirSync(node.path);

    for (const fname of files) {
      const fpath = path.join(node.path, fname);
      const fstat = fs.statSync(fpath);

      if (fstat.isDirectory()) {
        const childNode = new Node(NodeType.directory, [], vscode.Uri.file(fpath));

        this.searchNode(childNode);
        if (childNode.childNodes.length > 0) {
          node.childNodes.push(childNode);
        }
      } else if (
          fstat.isFile() &&
          (fname.endsWith('.pb') || fname.endsWith('.tflite') || fname.endsWith('.onnx'))) {
        const childNode = new Node(NodeType.baseModel, [], vscode.Uri.file(fpath));

        this.searchPairConfig(childNode);

        node.childNodes.push(childNode);
      }
    }
  }

  /**
   * compare paths by normalization
   * NOTE that '~'(home) is not supported
   * TODO(dayo) support '~'
   * TODO(dayo) extract file-relative functions as another module
   */
  private comparePath(path0: string, path1: string): boolean {
    const absPath0 = path.resolve(path.normalize(path0));
    const absPath1 = path.resolve(path.normalize(path1));
    return absPath0 === absPath1;
  }

  /**
   * Search .cfg files in the same directory
   */
  private searchPairConfig(node: Node) {
    console.assert(node.type === NodeType.baseModel);

    const files = fs.readdirSync(node.parent);

    for (const fname of files) {
      const fpath = path.join(node.parent, fname);
      const fstat = fs.statSync(fpath);

      if (fstat.isFile() && fname.endsWith('.cfg')) {
        const {baseModels, derivedModels} = parseConfig(vscode.Uri.file(fpath));

        for (const baseModel in baseModels) {
          if (this.comparePath(baseModel, node.path)) {
            const pairNode = new Node(NodeType.config, [], vscode.Uri.file(fpath));
            derivedModels ?.forEach(
                               derivedModel => pairNode.childNodes.push(
                                   new Node(NodeType.derivedModel, [], derivedModel)));
            node.childNodes.push(pairNode);
            break;
          }
        }
      }
    }
  }
}

export class OneExplorer {
  // TODO Support multi-root workspace
  public workspaceRoot: vscode.Uri = vscode.Uri.file(obtainWorkspaceRoot());

  constructor(context: vscode.ExtensionContext, logger: Logger) {
    // NOTE: Fix `obtainWorksapceRoot` if non-null assertion is false
    const oneTreeDataProvider = new OneTreeDataProvider(this.workspaceRoot!);
    context.subscriptions.push(
        vscode.window.registerTreeDataProvider('OneExplorerView', oneTreeDataProvider));

    const subscribeCommands = (disposals: vscode.Disposable[]) => {
      for (const disposal of disposals) {
        context.subscriptions.push(disposal);
      }
    };

    subscribeCommands([
      vscode.commands.registerCommand('onevscode.open-cfg', (file) => this.openFile(file)),
      vscode.commands.registerCommand(
          'onevscode.refresh-one-explorer', () => oneTreeDataProvider.refresh()),
      vscode.commands.registerCommand(
          'onevscode.create-cfg', (oneNode: OneNode) => oneTreeDataProvider.createCfg(oneNode)),
      vscode.commands.registerCommand(
          'onevscode.run-cfg',
          (oneNode: OneNode) => {
            const oneccRunner = new OneccRunner(oneNode.node.uri, logger);
            oneccRunner.run();
          })
    ]);
  }

  private openFile(node: Node) {
    vscode.commands.executeCommand('vscode.openWith', node.uri, CfgEditorPanel.viewType);
  }
}

//
// menu handler
//

import {EventEmitter} from 'events';

class OneccRunner extends EventEmitter {
  private startRunningOnecc: string = 'START_RUNNING_ONECC';
  private finishedRunningOnecc: string = 'FINISHED_RUNNING_ONECC';

  constructor(private cfgUri: vscode.Uri, private logger: Logger) {
    super();
  }

  /**
   * Function called when onevscode.run-cfg is called (when user clicks 'Run' on cfg file).
   */
  public run() {
    const toolRunner = new ToolRunner(this.logger);

    this.on(this.startRunningOnecc, this.onStartRunningOnecc);
    this.on(this.finishedRunningOnecc, this.onFinishedRunningOnecc);

    const toolArgs = new ToolArgs('-C', this.cfgUri.fsPath);
    const cwd = path.dirname(this.cfgUri.fsPath);
    let oneccPath = toolRunner.getOneccPath();
    if (oneccPath === undefined) {
      throw new Error('Cannot find installed onecc');
    }

    const runnerPromise = toolRunner.getRunner('onecc', oneccPath, toolArgs, cwd);
    this.emit(this.startRunningOnecc, runnerPromise);
  }

  private onStartRunningOnecc(runnerPromise: Promise<string>) {
    const progressOption: vscode.ProgressOptions = {
      location: vscode.ProgressLocation.Notification,
      title: `Running: 'onecc --config ${this.cfgUri.fsPath}'`,
      cancellable: true
    };

    // Show progress UI
    vscode.window.withProgress(progressOption, (progress, token) => {
      token.onCancellationRequested(() => {
        vscode.window.showWarningMessage(`Error: NYI`);
      });

      const p = new Promise<void>(resolve => {
        runnerPromise
            .then(value => {
              resolve();
              this.emit(this.finishedRunningOnecc);
            })
            .catch(value => {
              vscode.window.showWarningMessage(
                  `Error occured while running: 'onecc --config ${this.cfgUri.fsPath}'`);
            });
      });

      return p;
    });
  }

  private onFinishedRunningOnecc() {
    vscode.window.showInformationMessage(`Successfully completed`);
  }
}
