import { Component, OnInit } from '@angular/core';
import { Banner } from "../banner/banner";
import { CommonModule } from '@angular/common';
import { Footer } from "../footer/footer";
import { ApiProduct } from '../services/api-product';
import { RouterModule } from '@angular/router';
import { Product } from '../interfaces/product';
import { AllProductArea } from '../interfaces/all-product';

@Component({
  selector: 'app-home',
  imports: [Banner, RouterModule, CommonModule, Footer],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  constructor(private service: ApiProduct) {}

  protected productList!: Product[];

  ngOnInit(): void {
    this.showCards();
  }

  showCards() {
    this.service.getCardsforHome().subscribe({
      next: (data: AllProductArea) => {
        this.productList = data.products;
      },
      error: (error) => {
        console.error('Failed to load home products:', error);
      },
    });
  }
}