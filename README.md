# Guía paso a paso para desarrollar una aplicación de Catálogo de Productos con Angular

Esta guía te mostrará cómo crear desde cero esta aplicación CRUD de productos usando Angular y Angular Material, explicando el contenido y propósito de cada archivo clave.

---

## 1. Crear el proyecto Angular

```sh
ng new simple-products-frontend --style=scss --routing
cd simple-products-frontend
```

Esto crea la estructura base del proyecto, usando SCSS para estilos y habilitando el sistema de rutas.

## 2. Instalar Angular Material

```sh
ng add @angular/material
```

Selecciona un tema (por ejemplo, "Azure Blue") y acepta las opciones recomendadas. Angular Material provee componentes visuales modernos.

## 3. Crear la estructura de carpetas

Dentro de `src/app/`, crea:

- `products/`: Contendrá el modelo, servicio y componentes relacionados a productos.
- `shared/`: Para componentes reutilizables, como diálogos de confirmación.

---

## 4. Crear los componentes y archivos principales

### 4.1. Comandos para generar los componentes y archivos principales

- Crear el tipo de dato con información que gestionaremos de los productos:

  ```sh
  ng generate interface products/product
  ```

- Crear el servicio para tener acceso a la información:

  ```sh
  ng generate service products/product
  ```

- Crear los componentes (gráficos) de la aplicación:

  ```sh
  ng generate component products/product-list
  ng generate component products/product-form
  ng generate component shared/confirm-dialog
  ```

---

### 4.2. Modelo de Producto

Define la estructura de los objetos producto en la aplicación.

**Archivo:** `src/app/products/product.ts`

```ts
export interface Product {
  id?: number;          // Identificador único del producto (opcional)
  name: string;         // Nombre del producto
  description: string;  // Descripción breve
  price: number;        // Precio
  quantity: number;     // Cantidad disponible
}
```

---

### 4.3. Servicio de Productos

Este servicio gestiona los productos en memoria (o desde un servicio web) y expone métodos CRUD usando RxJS.

**Archivo:** `src/app/products/product.service.ts`

```ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product } from './product';
import { Observable, of, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductService {
  / private apiUrl = 'http://localhost:8080/api/products';

  // Datos mock para usar antes de conectar el backend (opcional, útil para probar la UI)
  private mockProducts: Product[] = [
    { id: 1, name: 'Laptop', description: 'Gaming Laptop alta gama', price: 1200, quantity: 5 },
    { id: 2, name: 'Teclado Mecánico', description: 'Teclado retroiluminado', price: 80, quantity: 15 },
    { id: 3, name: 'Ratón Inalámbrico', description: 'Ratón ergonómico', price: 35, quantity: 20 }
  ];
  private nextMockId = 4;

  constructor(private http: HttpClient) { }

  // Obtener todos los productos
  getAllProducts(): Observable<Product[]> {
    return of(this.mockProducts);
    // return this.http.get<Product[]>(this.apiUrl); // Descomentar para llamar al backend
  }

  getProductById(id: number): Observable<Product> {
    const product = this.mockProducts.find(p => p.id === id);
    return product ? of(product) : throwError(() => new Error('Product not found'));
    // return this.http.get<Product>(`<span class="math-inline">\{this\.apiUrl\}/</span>{id}`); // Descomentar para llamar al backend
  }

  // Crear un nuevo producto
  createProduct(product: Product): Observable<Product> {
    const newProduct = { ...product, id: this.nextMockId++ }; 
    this.mockProducts.push(newProduct); 
    return of(newProduct); 
    // return this.http.post<Product>(this.apiUrl, product); // Descomentar para llamar al backend
  }

  // Actualizar un producto existente
  updateProduct(product: Product): Observable<Product> {
    const index = this.mockProducts.findIndex(p => p.id === product.id);
    if (index > -1) {
      this.mockProducts[index] = product;
      return of(product);
    } 
    return throwError(() => new Error('Product not found for update'));
    // return this.http.put<Product>(`{this.apiUrl}/{product.id}`, product); // Descomentar para llamar al backend
  }

  // Eliminar un producto
  deleteProduct(id: number): Observable<void> {
    this.mockProducts = this.mockProducts.filter(p => p.id !== id);
    return of(undefined);
    // return this.http.delete<void>(`{this.apiUrl}/{id}`); // Descomentar para llamar al backend
  }
}
```

---

### 4.4. Listado de Productos

#### `src/app/products/product-list.component.ts`

```ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from '../product';
import { ProductService } from '../product.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-product-list',
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    MatDialogModule,
    CurrencyPipe
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit {
  displayedColumns: string[] = ['name', 'description', 'price', 'quantity', 'actions'];
  dataSource = new MatTableDataSource<Product>();

  constructor(
    private productService: ProductService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    // Cuando el componente se inicializa, carga la lista de productos
    this.loadProducts();
  }

  // Método para cargar los productos desde el servicio
  loadProducts(): void {
    this.productService.getAllProducts().subscribe(
      products => {
        // Asigna los productos al dataSource de la tabla
        this.dataSource.data = products;
        console.log('Productos cargados:', products); // Para depuración
      },
      error => {
        // Manejo básico de errores al cargar productos
        console.error('Error al cargar productos:', error);
        this.snackBar.open('Error al cargar la lista de productos', 'Cerrar', {
          duration: 5000, // Mostrar por 5 segundos
          panelClass: ['error-snackbar'] // Clase CSS opcional para estilo de error
        });
      }
    );
  }

  // Navegar al formulario de edición
  editProduct(product: Product): void {
    // Usa el Router para navegar a la ruta de edición con el ID del producto
    this.router.navigate(['/products', 'edit', product.id]);
  }

  // Eliminar un producto (mostrará un diálogo de confirmación)
  deleteProduct(product: Product): void {
    // Abrir el diálogo de confirmación
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px', // Ancho del diálogo
      data: { // Datos que se pasan al componente del diálogo
        message: `¿Estás seguro de que quieres eliminar el producto "${product.name}"?`,
        buttonText: { // Texto personalizado para los botones
          ok: 'Eliminar',
          cancel: 'Cancelar'
        },
        buttonColor: { // Color personalizado para el botón OK (usa colores de Material: primary, accent, warn)
          ok: 'warn'
        }
      }
    });

    // Suscribirse al evento afterClosed para saber qué botón presionó el usuario
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) { // Si el usuario confirmó la eliminación
        if (product.id !== undefined) { // Asegurarse de que el producto tiene un ID
          this.productService.deleteProduct(product.id).subscribe(
            () => {
              // Mostrar notificación de éxito
              this.snackBar.open('Producto eliminado correctamente', 'Cerrar', {
                duration: 3000,
              });
              // Recargar la lista de productos después de eliminar
              this.loadProducts();
            },
            error => {
              // Manejo de errores al eliminar
              console.error('Error al eliminar', error);
              this.snackBar.open('Error al eliminar el producto', 'Cerrar', {
                duration: 5000,
                panelClass: ['error-snackbar']
              });
            }
          );
        }
      }
    });
  }
}}
```

#### `src/app/products/product-list.component.html`

```html
<div class="product-list-container">
  <mat-card>
    <mat-card-title>
      Listado de Productos
    </mat-card-title>
    <mat-card-content>
      <table mat-table [dataSource]="dataSource" class="mat-elevation-z8">

        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef> Nombre </th>
          <td mat-cell *matCellDef="let element"> {{element.name}} </td>
        </ng-container>

        <ng-container matColumnDef="description">
          <th mat-header-cell *matHeaderCellDef> Descripción </th>
          <td mat-cell *matCellDef="let element"> {{element.description}} </td>
        </ng-container>

        <ng-container matColumnDef="price">
          <th mat-header-cell *matHeaderCellDef> Precio </th>
          <td mat-cell *matCellDef="let element"> {{element.price | currency}} </td>
        </ng-container>

        <ng-container matColumnDef="quantity">
          <th mat-header-cell *matHeaderCellDef> Stock </th>
          <td mat-cell *matCellDef="let element"> {{element.quantity}} </td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef> Acciones </th>
          <td mat-cell *matCellDef="let element">
            <button mat-icon-button color="primary" (click)="editProduct(element)" aria-label="Editar producto">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button color="warn" (click)="deleteProduct(element)" aria-label="Eliminar producto">
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
    </mat-card-content>
  </mat-card>
</div>
```

#### `src/app/products/product-list.component.scss`

```scss
.product-list-container {
  padding: 20px; // Espacio alrededor de la tarjeta
}

mat-card-title {
  display: flex; // Permite alinear elementos en la misma línea
  justify-content: space-between; // Empuja el título y el botón a los extremos
  align-items: center; // Centra verticalmente
  margin-bottom: 20px; // Espacio debajo del título/botón
}

.mat-elevation-z8 {
  width: 100%; // Asegura que la tabla ocupe todo el ancho disponible
}

// Opcional: Estilo para la notificación de error
.error-snackbar {
  background-color: #f44336; // Rojo Material
  color: white;
}
```

---

### 4.5. Formulario de Producto

#### `src/app/products/product-form.component.ts`

```ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Product } from '../product';
import { ProductService } from '../product.service';

@Component({
  selector: 'app-product-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
    RouterLink
  ],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss'
})
export class ProductFormComponent implements OnInit {
  // Declaración del grupo de formulario reactivo
  productForm!: FormGroup;
  // Propiedades para manejar el estado de edición/creación
  productId: number | null = null; // Almacena el ID si estamos editando
  isEditing = false; // Bandera para saber si es modo edición

  constructor(
    private fb: FormBuilder, // Inyecta FormBuilder para crear el formulario fácilmente
    private productService: ProductService, // Inyecta el servicio
    private route: ActivatedRoute, // Inyecta ActivatedRoute para leer parámetros de la URL
    private router: Router, // Inyecta Router para navegar después de guardar
    private snackBar: MatSnackBar // Inyecta MatSnackBar para notificaciones
  ) { }

  ngOnInit(): void {
    // Inicializa el formulario reactivo con sus controles y validadores
    this.productForm = this.fb.group({
      // El ID se incluye, pero será nulo al crear. Validators no aplica a ID.
      id: [null],
      // Campo Nombre: valor inicial '', requerido
      name: ['', Validators.required],
      // Campo Descripción: valor inicial '', requerido
      description: ['', Validators.required],
      // Campo Precio: valor inicial 0, requerido y mínimo 0
      price: [0, [Validators.required, Validators.min(0)]],
      // Campo Stock: valor inicial 0, requerido y mínimo 0
      quantity: [0, [Validators.required, Validators.min(0)]]
    });

    // Suscribirse a los parámetros de ruta para detectar si hay un ID (modo edición)
    this.route.paramMap.subscribe(params => {
      const id = params.get('id'); // Obtiene el parámetro 'id' de la URL
      if (id) {
        this.productId = +id; // Convierte el string ID a número
        this.isEditing = true; // Activa la bandera de edición
        this.loadProduct(this.productId); // Carga los datos del producto
      }
    });
  }

  // Cargar datos de un producto existente (solo en modo edición)
  loadProduct(id: number): void {
    this.productService.getProductById(id).subscribe(
      product => {
        // Usa patchValue para llenar el formulario con los datos del producto
        this.productForm.patchValue(product);
        console.log('Producto cargado para edición:', product); // Para depuración
      },
      error => {
        console.error('Error al cargar producto para edición:', error);
        this.snackBar.open('Error al cargar el producto para editar', 'Cerrar', { duration: 5000 });
        this.router.navigate(['/products']); // Redirigir si hay error (ej. ID no existe)
      }
    );
  }

  // Manejador del envío del formulario
  onSubmit(): void {
    if (this.productForm.valid) { // Verifica si el formulario es válido (cumple los Validators)
      // Obtiene el valor del formulario como un objeto Product
      const product: Product = this.productForm.value;

      if (this.isEditing) {
        // Si estamos editando, llama al servicio para actualizar
        this.productService.updateProduct(product).subscribe(
          () => {
            this.snackBar.open('Producto actualizado correctamente', 'Cerrar', { duration: 3000 });
            this.router.navigate(['/products']); // Navega de vuelta a la lista
          },
          error => {
            console.error('Error al actualizar producto:', error);
            this.snackBar.open('Error al actualizar el producto', 'Cerrar', { duration: 5000 });
          }
        );
      } else {
        // Si no estamos editando, llama al servicio para crear
        // Quitamos el ID si existe, ya que el backend asignará uno nuevo al crear
        const productToCreate = { ...product, id: undefined };
        this.productService.createProduct(productToCreate).subscribe(
          () => {
            this.snackBar.open('Producto creado correctamente', 'Cerrar', { duration: 3000 });
            this.router.navigate(['/products']); // Navega de vuelta a la lista
          },
          error => {
            console.error('Error al crear producto:', error);
            this.snackBar.open('Error al crear el producto', 'Cerrar', { duration: 5000 });
          }
        );
      }
    } else {
      // Si el formulario no es válido, muestra un mensaje
      this.snackBar.open('Por favor, completa todos los campos requeridos correctamente', 'Cerrar', { duration: 5000 });
    }
  }

  // Getters para acceder fácilmente a los controles del formulario en el template (buena práctica)
  get name() { return this.productForm.get('name'); }
  get description() { return this.productForm.get('description'); }
  get price() { return this.productForm.get('price'); }
  get quantity() { return this.productForm.get('quantity'); }
}
```

#### `src/app/products/product-form.component.html`

```html
<div class="product-form-container">
  <mat-card>
    <mat-card-title>{{ isEditing ? 'Editar Producto' : 'Crear Nuevo Producto' }}</mat-card-title>
    <mat-card-content>
      <form [formGroup]="productForm" (ngSubmit)="onSubmit()" class="product-form">

        <mat-form-field appearance="outline"> <mat-label>Nombre</mat-label>
          <input matInput formControlName="name" required>
          <mat-error *ngIf="name?.invalid && (name?.dirty || name?.touched)">
            El nombre es requerido.
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Descripción</mat-label>
          <textarea matInput formControlName="description" required></textarea>
          <mat-error *ngIf="description?.invalid && (description?.dirty || description?.touched)">
            La descripción es requerida.
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Precio</mat-label>
          <input matInput formControlName="price" type="number" required min="0">
          <mat-error *ngIf="price?.invalid && (price?.dirty || price?.touched)">
            El precio es requerido y debe ser un número positivo.
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Stock</mat-label>
          <input matInput formControlName="quantity" type="number" required min="0">
          <mat-error *ngIf="quantity?.invalid && (quantity?.dirty || quantity?.touched)">
            El stock es requerido y debe ser un número positivo.
          </mat-error>
        </mat-form-field>

        <div class="form-actions">
          <button mat-raised-button color="primary" type="submit" [disabled]="productForm.invalid">
            {{ isEditing ? 'Actualizar Producto' : 'Crear Producto' }}
          </button>
          <button mat-button routerLink="/products">Cancelar</button>
        </div>
      </form>
    </mat-card-content>
  </mat-card>
</div>
```

#### `src/app/products/product-form.component.scss`

```scss
.product-form-container {
  padding: 20px; // Espacio alrededor de la tarjeta
  display: flex;
  justify-content: center; // Centra la tarjeta horizontalmente
}

mat-card {
  width: 100%; // La tarjeta ocupa el ancho completo por defecto
  max-width: 600px; // Limita el ancho máximo del formulario para mejor legibilidad
}

.product-form {
  display: flex;
  flex-direction: column; // Coloca los elementos en una columna
  gap: 15px; // Espacio entre los elementos del formulario
}

.form-actions {
  display: flex;
  gap: 10px; // Espacio entre los botones
  justify-content: flex-end; // Alinea los botones a la derecha
  margin-top: 20px; // Espacio encima de los botones
}

// Estilo para la notificación de error (reutilizar del componente lista o definir aquí)
.error-snackbar {
  background-color: #f44336;
  color: white;
}
```

---

### 4.6. Diálogo de Confirmación

#### `src/app/shared/confirm-dialog.component.ts`

```ts
import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss'
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title?: string; message: string; buttonText?: { ok: string; cancel: string }; buttonColor?: { ok: string } }
  ) { }

  // Método llamado al hacer clic en Cancelar
  onCancel(): void {
    this.dialogRef.close(false);
  }

  // Método llamado al hacer clic en Aceptar
  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
```

### `src/app/shared/confirm-dialog.component.html`

```html
<h2 mat-dialog-title>{{ data.title || 'Confirmar Acción' }}</h2>
<div mat-dialog-content>
  <p>{{ data.message }}</p>
</div>
<div mat-dialog-actions align="end">
  <button mat-button (click)="onCancel()">{{ data.buttonText?.cancel || 'Cancelar' }}</button>
  <button mat-raised-button color="{{ data.buttonColor?.ok || 'primary' }}" (click)="onConfirm()">{{
    data.buttonText?.ok || 'Aceptar' }}</button>
</div>
```

---

### 4.7. Componente principal de la aplicación

#### `src/app/app.component.ts`

```ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Simple Catálogo de Productos';
}
```

#### `src/app/app.component.html`

```html
<mat-toolbar color="primary">
  <span>{{ title }}</span>
  <span class="spacer"></span>
  <button mat-button routerLink="/products">
    <mat-icon>list</mat-icon>
    Productos
  </button>
  <button mat-button routerLink="/products/new">
    <mat-icon>add</mat-icon>
    Nuevo
  </button>
</mat-toolbar>

<router-outlet />
```

S### 4.8. Configuración y rutas de la aplicación

#### `src/app/app.config.ts`

```ts
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient()
  ]
};
```

#### `src/app/app.routes.ts`

```ts
import { Routes } from '@angular/router';
import { ProductListComponent } from './products/product-list.component';
import { ProductFormComponent } from './products/product-form.component';

export const routes: Routes = [
  { path: '', component: ProductListComponent },
  { path: 'new', component: ProductFormComponent },
  { path: 'edit/:id', component: ProductFormComponent }
];
```

---

## 5. Añadir estilos con SCSS

Personaliza los estilos en los archivos `.scss` de cada componente y en `src/styles.scss` para mejorar la apariencia de la aplicación.

---

## 6. Probar la aplicación

Ejecuta:

```sh
ng serve
```

Abre [http://localhost:4200](http://localhost:4200) en tu navegador para ver la aplicación en funcionamiento.

---

## Recursos útiles

- [Documentación Angular](https://angular.io/docs)
- [Angular Material](https://material.angular.io/)
- [RxJS](https://rxjs.dev/)

---
