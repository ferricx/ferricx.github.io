import { AfterViewInit, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CarouselComponent } from '../components/carousel/carousel.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CarouselComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements AfterViewInit {
  @ViewChild('pageHeading') private pageHeading!: ElementRef<HTMLHeadingElement>;
  private readonly router = inject(Router);

  ngAfterViewInit(): void {
    if ((this.router.lastSuccessfulNavigation()?.id ?? 1) > 1) {
      this.pageHeading.nativeElement.focus();
    }
  }
}
