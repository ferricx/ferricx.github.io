import { Component, inject } from '@angular/core';
import { Router, NavigationEnd, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { PopoverTipComponent } from './components/popover-tip/popover-tip.component';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, PopoverTipComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly theme = inject(ThemeService);

  constructor() {
    const router = inject(Router);
    router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        if (document.startViewTransition) {
          document.startViewTransition();
        }
      });
  }
}
