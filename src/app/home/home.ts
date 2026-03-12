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
export class Home {
  constructor(private service: ApiProduct) {}

 
}