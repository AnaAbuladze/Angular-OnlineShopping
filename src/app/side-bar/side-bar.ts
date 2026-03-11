import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiProduct } from '../services/api-product';
import { AllProductArea } from '../interfaces/all-product';

@Component({
  selector: 'app-side-bar',
  imports: [FormsModule],
  templateUrl: './side-bar.html',
  styleUrl: './side-bar.css',
})
export class SideBar implements OnInit {
  constructor(private ProductApi: ApiProduct) {}

  @Output() sendBrands: EventEmitter<AllProductArea> = new EventEmitter();
  @Output() sendAllProducts: EventEmitter<AllProductArea> = new EventEmitter();
  @Output() sendCategoryData: EventEmitter<AllProductArea> = new EventEmitter();
  @Output() sendFilterData: EventEmitter<Object> = new EventEmitter();
  @Output() sendSearchInfo: EventEmitter<string> = new EventEmitter();

  public searchText: string = '';
  public minPrice: string = '';
  public maxPrice: string = '';
  public rating!: number;
  public sort: string = '';
  public type: string = '';
  public activeBrand: string = 'All';
  protected brands: string[] = [];

  ngOnInit(): void {
    this.getBrandsList();
  }

  searchData() {
    this.sendSearchInfo.emit(this.searchText);
  }

  filterData() {
    this.sendFilterData.emit({
      search: this.searchText,
      min: this.minPrice,
      max: this.maxPrice,
      rating: this.rating,
      type: this.type,
      sort: this.sort,
    });
  }

  showAll() {
    this.activeBrand = 'All';
    this.ProductApi.getCardsOnShopPage(1, 15).subscribe((data: AllProductArea) => {
      this.sendAllProducts.emit(data);
    });
  }

  getBrandsList() {
    this.ProductApi.getBrands().subscribe((list: string[]) => {
      this.brands = list;
    });
  }

  getBrandData(brand: string) {
    this.activeBrand = brand;
    this.ProductApi.getExactBrandData(brand).subscribe((data: AllProductArea) => {
      this.sendBrands.emit(data);
    });
  }
}