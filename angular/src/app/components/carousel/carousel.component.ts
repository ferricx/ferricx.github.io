import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  QueryList,
  ViewChild,
  ViewChildren,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

export interface CarouselSlide {
  heading: string;
  description: string;
  route: string;
  linkLabel: string;
}

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.css',
})
export class CarouselComponent implements AfterViewInit, OnDestroy {
  readonly slides: CarouselSlide[] = [
    {
      heading: 'Single Column Registration',
      description:
        'A focused, vertical form layout designed for straightforward data-entry tasks like account registration. Fields are presented one after another for a clear, linear experience.',
      route: '/registration',
      linkLabel: 'Open now',
    },
    {
      heading: 'Wizard (Multi-step) Registration',
      description:
        'Breaks a long form into labelled steps, reducing cognitive load and letting users track their progress as they move through each stage of registration.',
      route: '/registration-2',
      linkLabel: 'Open now',
    },
    {
      heading: 'Dialog Registration',
      description:
        'Presents a registration form inside a modal dialog, keeping the user in context while capturing supplemental information without navigating away.',
      route: '/registration-3',
      linkLabel: 'Open now',
    },
    {
      heading: 'Profile',
      description:
        'An editable profile page combining theme customisation controls with persistent user settings. Demonstrates inline editing and accessible toggle patterns.',
      route: '/profile',
      linkLabel: 'Open now',
    },
    {
      heading: 'Weather',
      description:
        'A weather dashboard that fetches and displays live forecast data. Demonstrates async data patterns, loading states, and accessible data presentation.',
      route: '/weather',
      linkLabel: 'Open now',
    },
    {
      heading: 'Contact Us',
      description:
        'A contact details page with address information, a map link, and organized email contacts using a description list.',
      route: '/contact-us',
      linkLabel: 'Open now',
    },
  ];

  readonly currentIndex = signal(0);
  readonly total = this.slides.length;

  @ViewChild('trackWrapper') private trackWrapper!: ElementRef<HTMLElement>;
  @ViewChildren('headingEl') headingElements!: QueryList<ElementRef<HTMLHeadingElement>>;
  @ViewChildren('dotEl') dotElements!: QueryList<ElementRef<HTMLButtonElement>>;

  private readonly onScrollEnd = () => {
    const el = this.trackWrapper.nativeElement;
    const index = Math.round(el.scrollLeft / el.offsetWidth);
    this.currentIndex.set(index);
    // Keep focus only when it is already on a navigation control (dot or prev/next button).
    // If focus is on slide content (e.g. a link on the now-hidden slide) or outside the
    // component entirely, move it to the incoming slide's heading.
    const active = document.activeElement as HTMLElement | null;
    const isNavControl =
      active?.closest('.carousel-btn') != null ||
      this.dotElements.toArray().some(d => d.nativeElement === active);
    if (!isNavControl) {
      this.headingElements.toArray()[index]?.nativeElement.focus();
    }
  };

  ngAfterViewInit(): void {
    this.trackWrapper.nativeElement.addEventListener('scrollend', this.onScrollEnd);
  }

  ngOnDestroy(): void {
    this.trackWrapper.nativeElement.removeEventListener('scrollend', this.onScrollEnd);
  }

  goTo(index: number): void {
    const el = this.trackWrapper.nativeElement;
    this.currentIndex.set(index);
    el.scrollTo({ left: index * el.offsetWidth, behavior: 'smooth' });
  }

  prev(): void {
    this.goTo((this.currentIndex() - 1 + this.total) % this.total);
  }

  next(): void {
    this.goTo((this.currentIndex() + 1) % this.total);
  }

  onDotKeydown(event: KeyboardEvent, index: number): void {
    let target: number | null = null;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      target = (index - 1 + this.total) % this.total;
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      target = (index + 1) % this.total;
    } else if (event.key === 'Home') {
      target = 0;
    } else if (event.key === 'End') {
      target = this.total - 1;
    }
    if (target !== null) {
      event.preventDefault();
      this.goTo(target);
      this.dotElements.toArray()[target]?.nativeElement.focus();
    }
  }
}
