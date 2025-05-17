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
