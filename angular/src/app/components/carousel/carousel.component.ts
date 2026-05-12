import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  QueryList,
  ViewChild,
  ViewChildren,
  inject,
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

  private readonly host = inject(ElementRef) as ElementRef<HTMLElement>;
  @ViewChild('trackWrapper') private trackWrapper!: ElementRef<HTMLElement>;
  @ViewChildren('headingEl') headingElements!: QueryList<ElementRef<HTMLHeadingElement>>;
  @ViewChildren('dotEl') dotElements!: QueryList<ElementRef<HTMLButtonElement>>;

  private readonly onScrollEnd = () => {
    const el = this.trackWrapper.nativeElement;
    const index = Math.round(el.scrollLeft / el.offsetWidth);
    this.currentIndex.set(index);
    // Only move focus to the heading if focus is not already on a control inside this component
    if (!this.host.nativeElement.contains(document.activeElement)) {
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
