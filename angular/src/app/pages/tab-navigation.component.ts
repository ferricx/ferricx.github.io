import { AfterViewInit, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TabItem, TabsComponent } from '../components/tabs/tabs.component';

const UNDERSTANDING = 'https://www.w3.org/WAI/WCAG22/Understanding/';
const APG = 'https://www.w3.org/WAI/ARIA/apg/';

@Component({
  selector: 'app-tab-navigation',
  standalone: true,
  imports: [TabsComponent],
  templateUrl: './tab-navigation.component.html',
  styleUrl: './tab-navigation.component.css',
})
export class TabNavigationComponent implements AfterViewInit {
  @ViewChild('pageHeading') private pageHeading!: ElementRef<HTMLHeadingElement>;
  private readonly router = inject(Router);

  readonly wcagTabs: TabItem[] = [
    {
      label: 'Text alternatives',
      links: [
        { label: 'Non-text Content', url: `${UNDERSTANDING}non-text-content.html` },
        { label: 'Audio-only and Video-only', url: `${UNDERSTANDING}audio-only-and-video-only-prerecorded.html` },
        { label: 'Captions (Prerecorded)', url: `${UNDERSTANDING}captions-prerecorded.html` },
        { label: 'Audio Description (Prerecorded)', url: `${UNDERSTANDING}audio-description-prerecorded.html` },
        { label: 'Captions (Live)', url: `${UNDERSTANDING}captions-live.html` },
      ],
    },
    {
      label: 'Keyboard',
      links: [
        { label: 'Keyboard', url: `${UNDERSTANDING}keyboard.html` },
        { label: 'No Keyboard Trap', url: `${UNDERSTANDING}no-keyboard-trap.html` },
        { label: 'Character Key Shortcuts', url: `${UNDERSTANDING}character-key-shortcuts.html` },
        { label: 'Focus Order', url: `${UNDERSTANDING}focus-order.html` },
        { label: 'Focus Visible', url: `${UNDERSTANDING}focus-visible.html` },
      ],
    },
    {
      label: 'Color and contrast',
      links: [
        { label: 'Use of Color', url: `${UNDERSTANDING}use-of-color.html` },
        { label: 'Contrast (Minimum)', url: `${UNDERSTANDING}contrast-minimum.html` },
        { label: 'Contrast (Enhanced)', url: `${UNDERSTANDING}contrast-enhanced.html` },
        { label: 'Non-text Contrast', url: `${UNDERSTANDING}non-text-contrast.html` },
        { label: 'Images of Text', url: `${UNDERSTANDING}images-of-text.html` },
      ],
    },
    {
      label: 'Forms',
      links: [
        { label: 'Error Identification', url: `${UNDERSTANDING}error-identification.html` },
        { label: 'Labels or Instructions', url: `${UNDERSTANDING}labels-or-instructions.html` },
        { label: 'Error Suggestion', url: `${UNDERSTANDING}error-suggestion.html` },
        { label: 'Error Prevention (Legal, Financial, Data)', url: `${UNDERSTANDING}error-prevention-legal-financial-data.html` },
        { label: 'Identify Input Purpose', url: `${UNDERSTANDING}identify-input-purpose.html` },
      ],
    },
    {
      label: 'Navigation',
      links: [
        { label: 'Bypass Blocks', url: `${UNDERSTANDING}bypass-blocks.html` },
        { label: 'Page Titled', url: `${UNDERSTANDING}page-titled.html` },
        { label: 'Multiple Ways', url: `${UNDERSTANDING}multiple-ways.html` },
        { label: 'Headings and Labels', url: `${UNDERSTANDING}headings-and-labels.html` },
        { label: 'Consistent Navigation', url: `${UNDERSTANDING}consistent-navigation.html` },
      ],
    },
  ];

  readonly apgTabs: TabItem[] = [
    {
      label: 'Composite widgets',
      links: [
        { label: 'Tabs', url: `${APG}patterns/tabs/` },
        { label: 'Accordion', url: `${APG}patterns/accordion/` },
        { label: 'Carousel', url: `${APG}patterns/carousel/` },
        { label: 'Combobox', url: `${APG}patterns/combobox/` },
        { label: 'Modal Dialog', url: `${APG}patterns/dialog-modal/` },
      ],
    },
    {
      label: 'Menus and disclosure',
      links: [
        { label: 'Menu and Menubar', url: `${APG}patterns/menubar/` },
        { label: 'Menu Button', url: `${APG}patterns/menu-button/` },
        { label: 'Disclosure', url: `${APG}patterns/disclosure/` },
        { label: 'Tree View', url: `${APG}patterns/treeview/` },
        { label: 'Toolbar', url: `${APG}patterns/toolbar/` },
      ],
    },
    {
      label: 'Selection',
      links: [
        { label: 'Checkbox', url: `${APG}patterns/checkbox/` },
        { label: 'Radio Group', url: `${APG}patterns/radio/` },
        { label: 'Listbox', url: `${APG}patterns/listbox/` },
        { label: 'Grid', url: `${APG}patterns/grid/` },
        { label: 'Switch', url: `${APG}patterns/switch/` },
      ],
    },
    {
      label: 'Feedback',
      links: [
        { label: 'Alert', url: `${APG}patterns/alert/` },
        { label: 'Alert and Message Dialogs', url: `${APG}patterns/alertdialog/` },
        { label: 'Meter', url: `${APG}patterns/meter/` },
        { label: 'Table', url: `${APG}patterns/table/` },
        { label: 'Tooltip', url: `${APG}patterns/tooltip/` },
      ],
    },
    {
      label: 'Practices',
      links: [
        { label: 'Names and Descriptions', url: `${APG}practices/names-and-descriptions/` },
        { label: 'Developing a Keyboard Interface', url: `${APG}practices/keyboard-interface/` },
        { label: 'Landmark Regions', url: `${APG}practices/landmark-regions/` },
        { label: 'Structural Roles', url: `${APG}practices/structural-roles/` },
        { label: 'Hiding Semantics', url: `${APG}practices/hiding-semantics/` },
      ],
    },
  ];

  ngAfterViewInit(): void {
    if ((this.router.lastSuccessfulNavigation()?.id ?? 1) > 1) {
      this.pageHeading.nativeElement.focus();
    }
  }
}
