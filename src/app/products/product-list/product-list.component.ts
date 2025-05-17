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
}
