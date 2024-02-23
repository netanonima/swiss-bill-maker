import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { SwissBillMakerComponent } from './swiss-bill-maker/swiss-bill-maker.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SwissBillFormComponent } from './swiss-bill-form/swiss-bill-form.component';
import {MatInputModule} from "@angular/material/input";
import {ReactiveFormsModule} from "@angular/forms";
import {MatSelectModule} from "@angular/material/select";
import { SwissBillPdfViewerComponent } from './swiss-bill-pdf-viewer/swiss-bill-pdf-viewer.component';

@NgModule({
  declarations: [
    AppComponent,
    SwissBillMakerComponent,
    SwissBillFormComponent,
    SwissBillPdfViewerComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSelectModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
