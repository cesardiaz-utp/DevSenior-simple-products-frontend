import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product } from './product';
import { Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  // private apiUrl = 'http://localhost:8080/api/products';

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
