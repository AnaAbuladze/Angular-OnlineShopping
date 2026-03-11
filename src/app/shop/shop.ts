import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Product } from '../interfaces/product';
import { ApiProduct } from '../services/api-product';
import { AllProductArea } from '../interfaces/all-product';
import { FilteredProducts } from '../interfaces/filtered';
import { SideBar } from '../side-bar/side-bar';
import { CarouselComponent } from "./shop-banner/shop-banner";
import { Footer } from "../footer/footer";

@Component({
  selector: 'app-shop',
  imports: [RouterModule, FormsModule, SideBar,  CarouselComponent, Footer],
  templateUrl: './shop.html',
  styleUrl: './shop.css',
})
export class Shop implements OnInit {
  constructor(private prodService: ApiProduct) {}
  protected categories: any;
  public currentCategory: any;
  public productList: Product[] = [];
  public pageList: number[] = [];
  public currentPage: number = 1;
  public pageSize: any = 15;
  public totalSize!: any;
  public isCategoryShown: boolean = false;
  public hasFiltered: boolean = false;
  public isLoading: boolean = true;
  public altImage: string =
    'https://media.istockphoto.com/id/1396814518/vector/image-coming-soon-no-photo-no-thumbnail-image-available-vector-illustration.jpg?s=612x612&w=0&k=20&c=hnh2OZgQGhf0b46-J2z7aHbIWwq8HNlSDaNp2wn_iko=';

  ngOnInit(): void {
    this.showProducts(this.currentPage, this.pageSize);
    this.getCategoriesList();
  }

  pagination(data: FilteredProducts | AllProductArea) {
    this.pageList = [];
    this.productList = data.products;
    let pages = Math.ceil(data.total / this.pageSize);
    for (let i = 1; i <= pages; i++) {
      this.pageList.push(i);
    }
  }

 showProducts(page: number | string = 1, size: number = this.pageSize) {
  this.isCategoryShown = false;
  this.hasFiltered = false;
  this.currentPage = +page;
  this.isLoading = true; 

  const cacheKey = `shopProducts_page${page}_size${size}`;
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    const data: AllProductArea = JSON.parse(cached);
    this.productList = data.products;
    this.totalSize = data.total;
    this.pagination(data);
    this.isLoading = false;  
  } else {
    this.prodService.getCardsOnShopPage(page, size).subscribe((data: AllProductArea) => {
      localStorage.setItem(cacheKey, JSON.stringify(data));
      this.productList = data.products;
      this.totalSize = data.total;
      this.pagination(data);
      this.isLoading = false;  
    });
  }
}

  search(search: string) {
    this.hasFiltered = true;
    this.prodService
      .getSearchedData(search, this.pageSize)
      .subscribe((data: FilteredProducts) => {
        this.productList = data.products;
        this.pagination(data);
      });
  }

  filterProducts(info: any) {
    this.hasFiltered = true;
    this.prodService
      .filterData(
        (info.search = ''),
        info.rating,
        (info.min = '1'),
        (info.max = '999'),
        info.type,
        info.sort,
        this.pageSize
      )
      .subscribe((data: FilteredProducts) => {
        this.productList = data.products;
        this.pagination(data);
      });
  }

  switchBrands(dataOfBrand: AllProductArea) {
    this.hasFiltered = true;
    this.productList = dataOfBrand.products;
    this.pageList = [1];
  }

  changePageSize() {
    this.currentPage = 1;
    let pageArea = this.pageSize == '' ? this.totalSize : this.pageSize;
    if (!this.isCategoryShown) {
      this.showProducts(this.currentPage, pageArea);
    } else {
      this.showByCategory(this.currentCategory, this.currentPage);
    }
  }

  prevPage() {
    this.currentPage--;
    if (!this.isCategoryShown) {
      this.showProducts(this.currentPage, this.pageSize);
    } else {
      this.showByCategory(this.currentCategory, this.currentPage);
    }
  }

  nextPage() {
    this.currentPage++;
    if (!this.isCategoryShown) {
      this.showProducts(this.currentPage, this.pageSize);
    } else {
      this.showByCategory(this.currentCategory, this.currentPage);
    }
  }

  getCategoriesList() {
    this.prodService.getCategories().subscribe((list: any) => {
      this.categories = list;
    });
  }

  showByCategory(category: string, pageNum: any) {
    this.isCategoryShown = true;
    this.currentCategory = category;
    this.currentPage = pageNum;
    this.prodService
      .getListByCategory(category, this.currentPage, this.pageSize)
      .subscribe((data: any) => {
        this.productList = data.products;
        this.pagination(data);
      });
  }
}