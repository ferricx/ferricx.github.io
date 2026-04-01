import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home.component';
import { RegistrationComponent } from './pages/registration.component';
import { Registration2Component } from './pages/registration-2.component';
import { Registration3Component } from './pages/registration-3.component';
import { ProfileComponent } from './pages/profile.component';
import { WeatherComponent } from './pages/weather.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'registration', component: RegistrationComponent },
  { path: 'registration-2', component: Registration2Component },
  { path: 'registration-3', component: Registration3Component },
  { path: 'profile', component: ProfileComponent },
  { path: 'weather', component: WeatherComponent },
  // { path: 'registration-native', loadComponent: () => import('./pages/registration-native.component').then(m => m.RegistrationNativeComponent) },
];
