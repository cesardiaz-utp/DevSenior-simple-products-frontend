import { Routes } from '@angular/router';
import { ProductFormComponent } from './products/product-form/product-form.component';
import { ProductListComponent } from './products/product-list/product-list.component';

export const routes: Routes = [
  { path: '', component: ProductListComponent },
  { path: 'new', component: ProductFormComponent },
  { path: 'edit/:id', component: ProductFormComponent }
];
