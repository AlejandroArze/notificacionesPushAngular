import { Routes } from '@angular/router';
import { ScrumboardBoardsComponent } from './boards/boards.component';
import { ScrumboardBoardComponent } from './board/board.component';
import { CardDetailsComponent } from './card/details/card-details.component';

export default [
    {
        path: '',
        component: ScrumboardBoardsComponent,
        providers: []
    },
    {
        path: ':boardId',
        component: ScrumboardBoardComponent,
        providers: [],
        children: [
            {
                path: 'card/:cardId',
                component: CardDetailsComponent
            }
        ]
    }
] as Routes;
