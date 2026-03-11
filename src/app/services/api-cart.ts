import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root',
})
export class ApiCart {
  
  constructor(private http: HttpClient) { }

  getCart () {
    return this.http.get("https://api.everrest.educata.dev/shop/cart")
  }

  createCart(body: any) {
    return this.http.post("https://api.everrest.educata.dev/shop/cart/product", body)
  }

  addtoCart(body: any,) {
    return this.http.patch("https://api.everrest.educata.dev/shop/cart/product", body )
  }



  deleteProduct(body: any) {
    return this.http.delete("https://api.everrest.educata.dev/shop/cart/product", {body: body})
  }

  removeAll() {
    return this.http.delete("https://api.everrest.educata.dev/shop/cart")
  }

  checkOut() {
    return this.http.post("https://api.everrest.educata.dev/shop/cart/checkout", "")
  }
}
