import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
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

  readonly mapsFallbackUrl = MAPS_FALLBACK_URL;
  readonly openMap = openMap;

  ngAfterViewInit(): void {
    this.pageHeading.nativeElement.focus();
  }
}
