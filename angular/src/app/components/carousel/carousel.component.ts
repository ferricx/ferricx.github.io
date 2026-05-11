import {
  Component,
  ElementRef,
  HostListener,
  QueryList,
  ViewChildren,
  signal,
  computed,
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
export class CarouselComponent {
  readonly slides: CarouselSlide[] = [
    {
      heading: 'Single Column Registration',
      description:
        'A focused, vertical form layout designed for straightforward data-entry tasks like account registration. Fields are presented one after another for a clear, linear experience.',
      route: '/registration',
      linkLabel: 'View Single Column Registration',
    },
    {
      heading: 'Wizard (Multi-step) Registration',
      description:
        'Breaks a long form into labelled steps, reducing cognitive load and letting users track their progress as they move through each stage of registration.',
      route: '/registration-2',
      linkLabel: 'View Wizard Registration',
    },
    {
      heading: 'Dialog Registration',
      description:
        'Presents a registration form inside a modal dialog, keeping the user in context while capturing supplemental information without navigating away.',
      route: '/registration-3',
      linkLabel: 'View Dialog Registration',
    },
    {
      heading: 'Profile',
      description:
        'An editable profile page combining theme customisation controls with persistent user settings. Demonstrates inline editing and accessible toggle patterns.',
      route: '/profile',
      linkLabel: 'View Profile',
    },
    {
      heading: 'Weather',
      description:
        'A weather dashboard that fetches and displays live forecast data. Demonstrates async data patterns, loading states, and accessible data presentation.',
      route: '/weather',
      linkLabel: 'View Weather',
    },
    {
      heading: 'Contact Us',
      description:
        'A contact form with accessible validation, character-count feedback, and a phone field pattern. Shows how to surface clear, helpful error messages to all users.',
      route: '/contact-us',
      linkLabel: 'View Contact Us',
    },
  ];

  readonly currentIndex = signal(0);
  readonly total = this.slides.length;

  readonly slideLabel = computed(
    () => `${this.currentIndex() + 1} of ${this.total}`
  );

  @ViewChildren('slideEl') slideElements!: QueryList<ElementRef<HTMLElement>>;

  goTo(index: number): void {
    this.currentIndex.set((index + this.total) % this.total);
  }

  prev(): void {
    this.goTo(this.currentIndex() - 1);
  }

  next(): void {
    this.goTo(this.currentIndex() + 1);
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.prev();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.next();
    }
  }
}
