// ─────────────────────────────────────────────────────
// Widgets Tab — Tree, JSONView, DiffView
// ─────────────────────────────────────────────────────

import { Widget, Box, Text } from '@termuijs/widgets';
import { Tree, JSONView, DiffView } from '@termuijs/widgets';
import type { TreeNode, DiffLine } from '@termuijs/widgets';
import type { Screen } from '@termuijs/core';

// ── Tree data ──────────────────────────────────────────

const TREE_NODES: TreeNode[] = [
    {
        label: 'src',
        expanded: true,
        children: [
            {
                label: 'components',
                expanded: true,
                children: [
                    { label: 'Button.tsx' },
                    { label: 'Input.tsx' },
                ],
            },
            {
                label: 'utils',
                children: [
                    { label: 'helpers.ts' },
                    { label: 'types.ts' },
                ],
            },
            { label: 'index.ts' },
        ],
    },
    {
        label: 'tests',
        children: [
            {
                label: 'unit',
                children: [{ label: 'app.test.ts' }],
            },
        ],
    },
    { label: 'package.json' },
    { label: 'tsconfig.json' },
];

// ── JSON data ──────────────────────────────────────────

const JSON_DATA = {
    name: '@termuijs/widgets',
    version: '0.1.3',
    features: ['Tree', 'JSONView', 'DiffView'],
    config: { fps: 30, unicode: true, debug: false },
    stats: { widgets: 12, tests: 571, coverage: 94 },
};

// ── Diff data ──────────────────────────────────────────

const DIFF_LINES: DiffLine[] = [
    { type: 'context', content: 'export function greet(name: string) {', lineNo: 1 },
    { type: 'remove',  content: '  return `Hello ${name}`;', lineNo: 2 },
    { type: 'add',     content: '  return `Hello, ${name}!`;', lineNo: 2 },
    { type: 'context', content: '}', lineNo: 3 },
    { type: 'add',     content: '', lineNo: 4 },
    { type: 'add',     content: 'export function goodbye(name: string) {', lineNo: 5 },
    { type: 'add',     content: '  return `Goodbye, ${name}!`;', lineNo: 6 },
    { type: 'add',     content: '}', lineNo: 7 },
];

// ── Column focus type ─────────────────────────────────

type FocusedColumn = 'tree' | 'json' | 'diff';

// ── WidgetsTab ────────────────────────────────────────

export class WidgetsTab extends Widget {
    private _tree: Tree;
    private _jsonView: JSONView;
    private _diffView: DiffView;
    private _focusedColumn: FocusedColumn = 'tree';
    private _focusBar: Text;

    constructor() {
        super({ flexDirection: 'column', flexGrow: 1 });

        // Header
        const header = new Text('Widgets Tab — Tree  |  JSONView  |  DiffView', {
            bold: true,
            fg: { type: 'named', name: 'cyan' },
            height: 1,
        });

        // Focus indicator
        this._focusBar = new Text(
            '  Focus: [TREE]   Tab/Left/Right to switch  •  Up/Down Navigate  •  Space Toggle',
            { height: 1, fg: { type: 'named', name: 'yellow' }, bold: true },
        );

        // ── Three-column layout ────────────────────────
        const columns = new Box({ flexDirection: 'row', flexGrow: 1, gap: 1 });

        // Left: Tree
        const leftCol = new Box({ flexDirection: 'column', flexGrow: 1 });
        leftCol.addChild(new Text(' Tree — File Explorer', {
            height: 1,
            bold: true,
            fg: { type: 'named', name: 'green' },
        }));
        this._tree = new Tree(
            { nodes: TREE_NODES },
            { border: 'single', flexGrow: 1, height: 18 },
        );
        leftCol.addChild(this._tree);
        leftCol.addChild(new Text(' Up/Down move  Space/Enter expand', {
            height: 1, fg: { type: 'named', name: 'brightBlack' },
        }));

        // Middle: JSONView
        const midCol = new Box({ flexDirection: 'column', flexGrow: 1 });
        midCol.addChild(new Text(' JSONView — Syntax Colored', {
            height: 1,
            bold: true,
            fg: { type: 'named', name: 'magenta' },
        }));
        this._jsonView = new JSONView(
            { data: JSON_DATA },
            { border: 'single', flexGrow: 1, height: 18 },
        );
        midCol.addChild(this._jsonView);
        midCol.addChild(new Text(' Expand objects with Space/Enter', {
            height: 1, fg: { type: 'named', name: 'brightBlack' },
        }));

        // Right: DiffView
        const rightCol = new Box({ flexDirection: 'column', flexGrow: 1 });
        rightCol.addChild(new Text(' DiffView — Unified Diff', {
            height: 1,
            bold: true,
            fg: { type: 'named', name: 'yellow' },
        }));
        this._diffView = new DiffView(
            { lines: DIFF_LINES },
            { border: 'single', flexGrow: 1, height: 18 },
        );
        rightCol.addChild(this._diffView);
        rightCol.addChild(new Text(' Up/Down scroll  green=add  red=remove', {
            height: 1, fg: { type: 'named', name: 'brightBlack' },
        }));

        columns.addChild(leftCol);
        columns.addChild(midCol);
        columns.addChild(rightCol);

        this.addChild(header);
        this.addChild(this._focusBar);
        this.addChild(columns);

        // Start with tree focused
        this._tree.isFocused = true;
    }

    handleKey(key: string): void {
        // Tab / left / right to cycle column focus
        if (key === 'tab' || key === 'right') {
            this._cycleFocus(1);
            return;
        }
        if (key === 'left') {
            this._cycleFocus(-1);
            return;
        }

        // Forward to focused column
        switch (this._focusedColumn) {
            case 'tree':
                this._tree.handleKey(this._mapKey(key));
                break;
            case 'json':
                this._jsonView.handleKey(this._mapKey(key));
                break;
            case 'diff':
                this._diffView.handleKey(this._mapKey(key));
                break;
        }
    }

    private _mapKey(key: string): string {
        // Map showcase key names to widget key names
        switch (key) {
            case 'up':    return 'ArrowUp';
            case 'down':  return 'ArrowDown';
            case 'left':  return 'ArrowLeft';
            case 'right': return 'ArrowRight';
            case 'space': return ' ';
            case 'enter': return 'Enter';
            case 'home':  return 'Home';
            case 'end':   return 'End';
            default:      return key;
        }
    }

    private _cycleFocus(direction: 1 | -1): void {
        const order: FocusedColumn[] = ['tree', 'json', 'diff'];
        const idx = order.indexOf(this._focusedColumn);
        const next = (idx + direction + order.length) % order.length;
        this._focusedColumn = order[next];

        // Update isFocused on widgets
        this._tree.isFocused = this._focusedColumn === 'tree';
        this._jsonView.isFocused = this._focusedColumn === 'json';
        this._diffView.isFocused = this._focusedColumn === 'diff';

        this._tree.markDirty();
        this._jsonView.markDirty();
        this._diffView.markDirty();

        const labels: Record<FocusedColumn, string> = {
            tree: 'TREE',
            json: 'JSONVIEW',
            diff: 'DIFFVIEW',
        };
        this._focusBar.setContent(
            `  Focus: [${labels[this._focusedColumn]}]   Tab/Left/Right to switch  •  Up/Down Navigate  •  Space Toggle`,
        );
    }

    protected _renderSelf(_screen: Screen): void { /* children handle rendering */ }
}
