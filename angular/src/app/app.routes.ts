import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home.component';
import { RegistrationComponent } from './pages/registration.component';
import { Registration2Component } from './pages/registration-2.component';
import { Registration3Component } from './pages/registration-3.component';
import { ProfileComponent } from './pages/profile.component';
import { WeatherComponent } from './pages/weather.component';
import { ContactUsComponent } from './pages/contact-us.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Accessible Web Content' },
  { path: 'registration', component: RegistrationComponent, title: 'Single Column Registration — Accessible Web Content' },
  { path: 'registration-2', component: Registration2Component, title: 'Wizard Registration — Accessible Web Content' },
  { path: 'registration-3', component: Registration3Component, title: 'Dialog Registration — Accessible Web Content' },
  { path: 'profile', component: ProfileComponent, title: 'Profile — Accessible Web Content' },
  { path: 'weather', component: WeatherComponent, title: 'Weather — Accessible Web Content' },
  { path: 'contact-us', component: ContactUsComponent, title: 'Contact Us — Accessible Web Content' },
  // { path: 'registration-native', loadComponent: () => import('./pages/registration-native.component').then(m => m.RegistrationNativeComponent) },
];
