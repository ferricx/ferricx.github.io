import { Component } from '@angular/core';
import { TabNavigationComponent } from './components/tab-navigation/tab-navigation.component';
import { PopoverTipComponent } from './components/popover-tip/popover-tip.component';

@Component({
  selector: 'app-root',
  imports: [TabNavigationComponent, PopoverTipComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
