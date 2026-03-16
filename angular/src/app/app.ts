import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { PopoverTipComponent } from './components/popover-tip/popover-tip.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, PopoverTipComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
