import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { InventoryComponent } from 'app/modules/admin/apps/control/list/inventory.component';
import { InventoryService } from 'app/modules/admin/apps/control/list/inventory.service';
import { InventoryListComponent } from 'app/modules/admin/apps/control/list/list/inventory.component';

export default [
    {
        path      : '',
        pathMatch : 'full',
        redirectTo: 'inventory',
    },
    {
        path     : 'inventory',
        component: InventoryComponent,
        children : [
            {
                path     : '',
                component: InventoryListComponent,
                resolve  : {
                    brands    : () => inject(InventoryService).getBrands(),
                    categories: () => inject(InventoryService).getCategories(),
                    //products  : () => inject(InventoryService).getProducts(),
                    equipments  : () => inject(InventoryService).equipments$,
                    tags      : () => inject(InventoryService).getTags(),
                    vendors   : () => inject(InventoryService).getVendors(),
                },
            },
        ],
    },
] as Routes;
