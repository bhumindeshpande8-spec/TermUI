// ─────────────────────────────────────────────────────
// Sprint 1.5 Showcase — Main Entry Point
// ─────────────────────────────────────────────────────
//
// Run with:  npx tsx src/index.ts
//
// Demonstrates all Sprint 1.5 widgets:
//   Tree, JSONView, DiffView
//   StreamingText, ChatMessage, ToolCall
//   MultiProgress, CommandPalette
//   VirtualList (virtualization)
//
// Controls:
//   1-4       Switch tabs
//   q/Ctrl+C  Quit
//   Tab       Cycle focus within current tab
//   Other     Forward to focused widget
//

import { App } from '@termuijs/core';
import { Box, Text, Widget } from '@termuijs/widgets';
import type { Screen, KeyEvent } from '@termuijs/core';

import { WidgetsTab } from './tabs/widgets-tab.js';
import { AITab } from './tabs/ai-tab.js';
import { FeedbackTab } from './tabs/feedback-tab.js';
import { EnvTab } from './tabs/env-tab.js';

// ── Tab labels ─────────────────────────────────────────

const TAB_LABELS = ['[1] Widgets', '[2] AI', '[3] Feedback', '[4] Environment'];

// ── Root Widget ───────────────────────────────────────

class Sprint15App extends Widget {
    private _tabBar: Box;
    private _tabLabels: Text[] = [];
    private _tabPanels: Widget[] = [];
    private _activeTab = 0;
    private _statusBar: Text;

    private _widgetsTab: WidgetsTab;
    private _aiTab: AITab;
    private _feedbackTab: FeedbackTab;
    private _envTab: EnvTab;

    constructor() {
        super({ flexDirection: 'column' });

        // ── Title bar ──────────────────────────────────
        const titleBar = new Box({ flexDirection: 'row', height: 1 });
        titleBar.addChild(new Text(' ⚡ Sprint 1.5 Showcase ', {
            bold: true,
            fg: { type: 'named', name: 'cyan' },
            height: 1,
        }));
        titleBar.addChild(new Text('— Tree · JSONView · DiffView · StreamingText · ChatMessage · ToolCall · MultiProgress · CommandPalette', {
            height: 1,
            fg: { type: 'named', name: 'brightBlack' },
            italic: true,
        }));

        // ── Tab bar ────────────────────────────────────
        this._tabBar = new Box({ flexDirection: 'row', height: 1, gap: 1 });
        for (let i = 0; i < TAB_LABELS.length; i++) {
            const active = i === 0;
            const label = new Text(
                active ? ` ${TAB_LABELS[i]} ` : `  ${TAB_LABELS[i]}  `,
                {
                    height: 1,
                    fg: active
                        ? { type: 'named', name: 'cyan' }
                        : { type: 'named', name: 'brightBlack' },
                    bold: active,
                    underline: active,
                },
            );
            this._tabLabels.push(label);
            this._tabBar.addChild(label);
        }

        // ── Separator ──────────────────────────────────
        const separator = new Text('─'.repeat(120), {
            height: 1,
            fg: { type: 'named', name: 'brightBlack' },
        });

        // ── Tab panels ─────────────────────────────────
        this._widgetsTab  = new WidgetsTab();
        this._aiTab       = new AITab();
        this._feedbackTab = new FeedbackTab();
        this._envTab      = new EnvTab();

        this._tabPanels = [
            this._widgetsTab,
            this._aiTab,
            this._feedbackTab,
            this._envTab,
        ];

        // ── Status bar ─────────────────────────────────
        this._statusBar = new Text(
            '  1-4 Tabs  •  Tab Focus  •  q Quit  │  Active: Widgets',
            { height: 1, fg: { type: 'named', name: 'brightBlack' } },
        );

        // ── Build widget tree ───────────────────────────
        this.addChild(titleBar);
        this.addChild(this._tabBar);
        this.addChild(separator);
        this.addChild(this._tabPanels[0]);  // Show first tab
        this.addChild(this._statusBar);
    }

    handleKey(event: KeyEvent): boolean {
        // Quit
        if (event.key === 'q' || (event.ctrl && event.key === 'c')) {
            return false;
        }

        // Tab switching: 1-4
        const num = parseInt(event.key);
        if (num >= 1 && num <= 4) {
            this._switchTab(num - 1);
            return true;
        }

        // Forward interactive keys to the active tab
        const key = event.key;
        switch (this._activeTab) {
            case 0:
                this._widgetsTab.handleKey(key);
                break;
            case 1:
                this._aiTab.handleKey(key);
                break;
            case 2:
                this._feedbackTab.handleKey(key);
                break;
            case 3:
                this._envTab.handleKey(key);
                break;
        }

        return true;
    }

    private _switchTab(index: number): void {
        if (index === this._activeTab || index < 0 || index >= this._tabPanels.length) return;

        // Remove current panel
        this.removeChild(this._tabPanels[this._activeTab]);
        this.removeChild(this._statusBar);

        // Update tab bar highlights
        for (let i = 0; i < TAB_LABELS.length; i++) {
            const active = i === index;
            this._tabLabels[i].setContent(active ? ` ${TAB_LABELS[i]} ` : `  ${TAB_LABELS[i]}  `);
            this._tabLabels[i].setStyle({
                fg: active
                    ? { type: 'named', name: 'cyan' }
                    : { type: 'named', name: 'brightBlack' },
                bold: active,
                underline: active,
            });
        }

        this._activeTab = index;

        // Insert new panel
        this.addChild(this._tabPanels[index]);
        this.addChild(this._statusBar);

        const tabNames = ['Widgets', 'AI', 'Feedback', 'Environment'];
        this._statusBar.setContent(
            `  1-4 Tabs  •  Tab Focus  •  q Quit  │  Active: ${tabNames[index]}`,
        );
    }

    protected _renderSelf(_screen: Screen): void { /* children handle rendering */ }
}

// ── Main ──────────────────────────────────────────────

async function main() {
    const showcase = new Sprint15App();

    const app = new App(showcase, {
        fullscreen: true,
        title: 'Sprint 1.5 Showcase',
        fps: 30,
    });

    // Keyboard handler
    app.events.on('key', (event) => {
        const shouldContinue = showcase.handleKey(event);
        if (!shouldContinue) app.exit(0);
        app.requestRender();
    });

    const exitCode = await app.mount();
    process.exit(exitCode);
}

main().catch((err) => {
    console.error('Sprint 1.5 Showcase error:', err);
    process.exit(1);
});
