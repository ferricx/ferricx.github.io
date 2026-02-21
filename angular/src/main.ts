import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import './app/components/form-group/form-group.js';
import './app/components/popover-tip/popover-tip.js';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
