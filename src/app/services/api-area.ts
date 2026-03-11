import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ApiArea {
  
  constructor(private http: HttpClient) { }

  signIn(body: any) {
    return this.http.post("https://api.everrest.educata.dev/auth/sign_in", body)
  }

  register(body: any){
    return this.http.post("https://api.everrest.educata.dev/auth/sign_up", body)
  }

  profileInfo() {
    return this.http.get("https://api.everrest.educata.dev/auth")
  }

  updateProfile(body: any) {
    return this.http.patch("https://api.everrest.educata.dev/auth/update", body)
  }

  getUserById(id: string) {
    return this.http.get(`https://api.everrest.educata.dev/auth/id/${id}`);
  }

  changePassword(body: { oldPassword: string; newPassword: string; repeatNewPassword: string }) {
    return this.http.patch('https://api.everrest.educata.dev/auth/change_password', body);
  }

  deleteAccount() {
    return this.http.delete('https://api.everrest.educata.dev/auth/delete');
  }

  getQuotes(page: number = 1, size: number = 20) {
    return this.http.get(
      `https://api.everrest.educata.dev/quote?page_index=${page}&page_size=${size}`
    );
  }
}