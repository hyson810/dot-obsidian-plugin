import { PluginSettingTab, Setting, App } from 'obsidian';
import DotPlugin from './main';
import { DEFAULT_COLORS } from './constants';
import type { PluginSettings } from './types';

export class DotSettingTab extends PluginSettingTab {
  constructor(app: App, private plugin: DotPlugin) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.addClass('square-settings-layout');

    containerEl.createEl('h2', { text: 'DOT 设置' });

    // Default view
    new Setting(containerEl)
      .setName('默认视图')
      .setDesc('启动时显示的视图')
      .addDropdown(dropdown => {
        dropdown
          .addOption('board', '主面板')
          .addOption('week', '周视图')
          .addOption('month', '月视图')
          .addOption('rank', '排行榜')
          .setValue(this.plugin.settings.defaultView)
          .onChange(async val => {
            this.plugin.settings.defaultView = val as PluginSettings['defaultView'];
            await this.plugin.saveSettings();
          });
      });

    // Grid columns
    new Setting(containerEl)
      .setName('网格列数')
      .setDesc('主面板每行显示的方块数量')
      .addDropdown(dropdown => {
        [3, 4, 5, 6].forEach(n => {
          dropdown.addOption(String(n), `${n} 列`);
        });
        dropdown.setValue(String(this.plugin.settings.gridCols));
        dropdown.onChange(async val => {
          this.plugin.settings.gridCols = Number(val) as 3 | 4 | 5 | 6;
          await this.plugin.saveSettings();
          this.plugin.updateLayout();
        });
      });

    // Accent color
    new Setting(containerEl)
      .setName('主题配色')
      .setDesc('选择插件的主色调');

    const colorContainer = containerEl.createDiv({ cls: 'square-settings-colors' });
    DEFAULT_COLORS.forEach(color => {
      const swatch = colorContainer.createEl('div', {
        cls: 'square-settings-color-swatch',
        attr: { style: `background: ${color}` },
      });
      swatch.addEventListener('click', async () => {
        this.plugin.settings.accentColor = color;
        await this.plugin.saveSettings();
        document.documentElement.style.setProperty('--dot-accent', color);
        colorContainer.querySelectorAll('.square-settings-color-swatch').forEach(el =>
          el.removeClass('is-selected')
        );
        swatch.addClass('is-selected');
      });
      if (color === this.plugin.settings.accentColor) {
        swatch.addClass('is-selected');
      }
    });

    // Behavior settings
    containerEl.createEl('h3', { text: '行为设置' });

    new Setting(containerEl)
      .setName('启动时打开 DOT')
      .setDesc('启动 Obsidian 时自动打开 DOT 面板')
      .addToggle(toggle =>
        toggle.setValue(this.plugin.settings.startOnLaunch).onChange(async val => {
          this.plugin.settings.startOnLaunch = val;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName('单击直接打卡')
      .setDesc('点击方块时直接打卡确认（跳过弹窗）')
      .addToggle(toggle =>
        toggle.setValue(this.plugin.settings.quickTap).onChange(async val => {
          this.plugin.settings.quickTap = val;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName('记录时添加时间戳')
      .setDesc('在打卡备注中自动添加当前时间')
      .addToggle(toggle =>
        toggle.setValue(this.plugin.settings.addTimestamp).onChange(async val => {
          this.plugin.settings.addTimestamp = val;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName('隐藏配置区块')
      .setDesc('在笔记中隐藏 ## 配置 区块的显示')
      .addToggle(toggle =>
        toggle.setValue(this.plugin.settings.useProperties).onChange(async val => {
          this.plugin.settings.useProperties = val;
          await this.plugin.saveSettings();
        })
      );

    // Data management
    containerEl.createEl('h3', { text: '数据管理' });

    new Setting(containerEl)
      .setName('重置布局')
      .setDesc('将所有方块恢复到默认网格排列')
      .addButton(btn =>
        btn.setButtonText('重置').onClick(async () => {
          await this.plugin.layoutService.resetLayout();
          this.plugin.refreshView();
        })
      );
  }
}
