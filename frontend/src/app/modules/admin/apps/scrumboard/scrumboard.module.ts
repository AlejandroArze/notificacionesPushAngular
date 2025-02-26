import { NgModule } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ScrumboardBoardComponent } from './board/board.component';

@NgModule({
  declarations: [
    ScrumboardBoardComponent,
    // ...
  ],
  imports: [
    MatSnackBarModule,
    // ...
  ],
})
export class ScrumboardModule { } 