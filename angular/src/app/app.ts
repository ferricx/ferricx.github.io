import { Component, inject } from '@angular/core';
import { Router, NavigationEnd, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { PopoverTipComponent } from './components/popover-tip/popover-tip.component';
import { ThemeService } from './services/theme.service';
import { routes } from './app.routes';

const routeOrder: Record<string, number> = {};
routes.forEach((r, i) => routeOrder['/' + (r.path ?? '')] = i);

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, PopoverTipComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly theme = inject(ThemeService);
  direction = 'forward';

  constructor() {
    const router = inject(Router);
    let prevIndex = routeOrder[router.url] ?? 0;

    router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        const nextIndex = routeOrder[e.urlAfterRedirects] ?? 0;
        this.direction = nextIndex >= prevIndex ? 'forward' : 'backward';
        prevIndex = nextIndex;

        setTimeout(() => {
          const h2 = Array.from(document.querySelectorAll<HTMLElement>('main h2'))
            .find(el => el.offsetParent !== null);
          if (h2) {
            h2.tabIndex = -1;
            h2.focus({ preventScroll: false });
          }
        }, 0);
      });
  }
}
