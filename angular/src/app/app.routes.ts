import { Routes } from '@angular/router';
import { TabNavigationComponent } from './components/tab-navigation/tab-navigation.component';
import { ProfileComponent } from './pages/profile.component';

export const routes: Routes = [
  { path: '', component: TabNavigationComponent },
  { path: 'profile', component: ProfileComponent },
];
