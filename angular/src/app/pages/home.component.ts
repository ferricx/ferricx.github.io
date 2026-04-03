import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements AfterViewInit {
  @ViewChild('pageHeading') private pageHeading!: ElementRef<HTMLHeadingElement>;

  ngAfterViewInit(): void {
    this.pageHeading.nativeElement.focus();
  }
}
