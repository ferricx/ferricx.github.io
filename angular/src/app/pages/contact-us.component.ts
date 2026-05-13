import { AfterViewInit, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { openMap, MAPS_FALLBACK_URL } from '../utils/open-map';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.css',
})
export class ContactUsComponent implements AfterViewInit {
  @ViewChild('pageHeading') private pageHeading!: ElementRef<HTMLHeadingElement>;
  private readonly router = inject(Router);

  readonly mapsFallbackUrl = MAPS_FALLBACK_URL;
  readonly openMap = openMap;

  ngAfterViewInit(): void {
    if ((this.router.lastSuccessfulNavigation()?.id ?? 1) > 1) {
      this.pageHeading.nativeElement.focus();
    }
  }
}
