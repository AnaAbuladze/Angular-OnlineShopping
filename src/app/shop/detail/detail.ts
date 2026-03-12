import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { ActivatedRoute, Params, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { ApiProduct } from '../../services/api-product';
import { ApiArea } from '../../services/api-area';
import { SignIn } from '../../sign-in/sign-in';
import { ApiCart } from '../../services/api-cart';
import { Product } from '../../interfaces/product';
import { ToolsService } from '../../services/tool';

@Component({
  selector: 'app-detail',
  imports: [CommonModule, SignIn, FormsModule],
  templateUrl: './detail.html',
  styleUrl: './detail.css',
  providers: [CookieService],
})

export class Detail implements OnInit {

  constructor(
    private actR: ActivatedRoute,
    private prodService: ApiProduct,
    private apiArea: ApiArea,
    private _cookie: CookieService,
    public router: Router,
    private apiCart: ApiCart,
    private tool: ToolsService,
    private cdr: ChangeDetectorRef
  ) { }
  public prodID!: string;
  public prodINFO: any;
  public mainImage!: string;
  public allImages!: string[];
  public starNum!: number;
  public prodQuant: number = 1;
  public isLoading: boolean = true;
  public showAuthError: boolean = false;
  public activeTab: string = 'details';
  public reviews: any[] = [];
  public newReview = { rating: 0, comment: '' };
  public hoverStar: number = 0;
  public submitting: boolean = false;
  public toastMessage: string = '';
  public toastVisible: boolean = false;
  ngOnInit(): void {

    this.actR.params.subscribe((data: Params) => {
      this.prodID = data['id'];
      this.getFullInfoProduct(this.prodID);
      this.loadReviews();
    });
  }
  getFullInfoProduct(pageID: string): void {
    this.isLoading = true;
    const cacheKey = `product_${pageID}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const data: Product = JSON.parse(cached);
      this.prodINFO = data;
      this.mainImage = data.images[0];
      this.allImages = data.images;
      this.starNum = Math.round(data.rating);
      this.isLoading = false;
      this.cdr.detectChanges();
    }
    else {
      this.prodService.getProductDetailInfo(pageID).subscribe({
        next: (data: Product) => {
          localStorage.setItem(cacheKey, JSON.stringify(data));
          this.prodINFO = data;
          this.mainImage = data.images[0];
          this.allImages = data.images;
          this.starNum = Math.round(data.rating);
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
    }
  }
  loadReviews(): void {
    const saved = localStorage.getItem(`reviews_${this.prodID}`);
    this.reviews = saved ? JSON.parse(saved) : [];
  }
  submitReview(): void {
    const token = this._cookie.get('user');
    if (!token) {
      this.toastMessage = 'Please login first';
      this.showToast();
      this.showAuthError = true;
      return;
    }
    if (!this.newReview.rating || !this.newReview.comment.trim()) return;
    this.submitting = true;
    this.prodService.rateProduct({
      productId: this.prodID,
      rate: this.newReview.rating
    }).subscribe({
      next: () => {
        const review = {
          author: 'User',
          rating: this.newReview.rating,
          quote: this.newReview.comment.trim(),
          date: new Date().toLocaleDateString()
        };
        const key = `reviews_${this.prodID}`;
        const existing = localStorage.getItem(key);
        const all = existing ? JSON.parse(existing) : [];
        all.unshift(review);
        localStorage.setItem(key, JSON.stringify(all));
        this.reviews.unshift(review);
        this.newReview = { rating: 0, comment: '' };
        this.submitting = false;
        this.toastMessage = 'Review submitted successfully';
        this.showToast();
      }
    });
  }
  setTab(tab: string): void {
    this.activeTab = tab;
  }
  zoomImg(img: string): void {
    this.mainImage = img;
  }
  increase(): void {
    this.prodQuant++;
  }
  decrease(): void {
    if (this.prodQuant > 1) {
      this.prodQuant--;
    }
  }
  private showToast(): void {
    this.toastVisible = true;
    setTimeout(() => {
      this.toastVisible = false;
    }, 2500);
  }
  cartBTN(id: string): void {
    if (!this._cookie.get('user')) {
      this.toastMessage = 'Please login first';
      this.showToast();
      this.showAuthError = true;
      return;
    }
    const prodInfoCart = {
      id,
      quantity: this.prodQuant
    };
    this.apiArea.profileInfo().subscribe((data: any) => {
      const cart$ = data.cartID
        ? this.apiCart.addtoCart(prodInfoCart)
        : this.apiCart.createCart(prodInfoCart);
      cart$.subscribe(() => {
        this.toastMessage = 'Product added successfully';
        this.showToast();
      });
    });
  }
}