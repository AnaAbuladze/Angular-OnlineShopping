import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiArea } from '../services/api-area';
import { ApiCart } from '../services/api-cart';
import { ApiProduct } from '../services/api-product';
import { CookieService } from 'ngx-cookie-service';
import { ToolsService } from '../services/tool';
import { forkJoin, Subject, of } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './profile-page.html',
  styleUrls: ['./profile-page.css'],
})
export class ProfilePage implements OnInit {
  public userData: any = null;
  public cartList: any[] = [];
  public total: number = 0;
  public cartSMS: boolean = false;
  public isProfileInfoShown: boolean = false;
  public isLoading: boolean = true;

  public altImage: string =
    'https://media.istockphoto.com/id/1396814518/vector/image-coming-soon-no-photo-no-thumbnail-image-available-vector-illustration.jpg?s=612x612&w=0&k=20&c=hnh2OZgQGhf0b46-J2z7aHbIWwq8HNlSDaNp2wn_iko=';

  private quantitySubject = new Subject<{ item: any; newQty: number }>();

  @ViewChild('settings') public settings!: ElementRef;

  public activeModal: 'info' | 'password' | 'delete' | null = null;
  public submitting: boolean = false;
  public modalSuccess: string = '';
  public modalError: string = '';
  public settingsOpen: boolean = false;

  public profileForm: any = {
    firstName: '',
    lastName: '',
    age: null,
    address: '',
    phone: '',
    zipcode: '',
    avatar: '',
    gender: 'MALE',
  };

  public passwordForm: any = {
    oldPassword: '',
    newPassword: '',
    repeatNewPassword: '',
  };

  constructor(
    private api: ApiArea,
    private cartServ: ApiCart,
    private prodServ: ApiProduct,
    private cookie: CookieService,
    private router: Router,
    private tool: ToolsService
  ) {}

  ngOnInit(): void {
    const token = this.cookie.get('user');
    if (token) {
      this.loadAll();
    } else {
      this.router.navigate(['/']);
    }

    this.tool.isSignedIn.subscribe((loggedIn: boolean) => {
      if (!loggedIn && this.userData) {
        this.userData = null;
        this.cartList = [];
        this.total = 0;
        this.router.navigate(['/']);
      }
    });

    this.quantitySubject.pipe(debounceTime(300)).subscribe(({ item, newQty }) => {
      this.cartServ.addtoCart({ id: item._id, quantity: newQty }).subscribe({
        next: () => {
          item.quantity = newQty;
          this.recalcTotal();
        },
        error: (err) => console.error('Quantity update failed', err),
      });
    });
  }

  loadAll(): void {
    this.isLoading = true;

    this.api.profileInfo().pipe(
      switchMap((profile: any) => {
        this.userData = profile;
        if (!profile.cartID) return of(null);
        return this.cartServ.getCart();
      }),
      switchMap((cartData: any) => {
        if (!cartData?.products?.length) return of({ cartItems: [], products: [] });
        const cartItems = cartData.products;
        const requests = cartItems.map((ci: any) => {
          const cached = localStorage.getItem(`product_${ci.productId}`);
          return cached
            ? of(JSON.parse(cached))
            : this.prodServ.getProductDetailInfo(ci.productId);
        });
        return forkJoin(requests).pipe(
          switchMap((products: any) => of({ cartItems, products }))
        );
      })
    ).subscribe({
      next: (result: any) => {
        if (result?.products?.length) {
          this.cartList = result.products.map((product: any, index: number) => ({
            ...product,
            quantity: result.cartItems[index].quantity,
          }));
          this.recalcTotal();
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Load failed', err);
        if (err.status === 401) {
          document.cookie = 'user=; Max-Age=0; path=/;';
          this.router.navigate(['/']);
        }
        this.isLoading = false;
      },
    });
  }

  toggleSettings(): void {
    this.settingsOpen = !this.settingsOpen;
  }

  closeDropdown(): void {
    this.settingsOpen = false;
  }

  showProfileInfo(): void {
    this.prefillProfileForm();
    this.openModal('info');
  }

  showChangePassword(): void {
    this.passwordForm = { oldPassword: '', newPassword: '', repeatNewPassword: '' };
    this.openModal('password');
  }

  showDeleteAccount(): void {
    this.openModal('delete');
  }

  openModal(type: 'info' | 'password' | 'delete'): void {
    this.activeModal = type;
    this.modalSuccess = '';
    this.modalError = '';
    this.settingsOpen = false;
  }

  closeModal(): void {
    this.activeModal = null;
    this.modalSuccess = '';
    this.modalError = '';
    this.submitting = false;
  }

  prefillProfileForm(): void {
    if (!this.userData) return;
    this.profileForm = {
      firstName: this.userData.firstName || '',
      lastName:  this.userData.lastName  || '',
      age:       this.userData.age       || null,
      address:   this.userData.address   || '',
      phone:     this.userData.phone     || '',
      zipcode:   this.userData.zipcode   || '',
      avatar:    this.userData.avatar    || '',
      gender:    this.userData.gender    || 'MALE',
    };
  }

  submitUpdateProfile(): void {
    this.submitting = true;
    this.modalError = '';

    const payload: any = {};
    Object.keys(this.profileForm).forEach((key) => {
      const val = this.profileForm[key];
      if (val !== '' && val !== null && val !== undefined) {
        payload[key] = val;
      }
    });

    this.api.updateProfile(payload).subscribe({
      next: (updated: any) => {
        this.submitting = false;
        this.userData = { ...this.userData, ...updated };
        this.tool.userNavbarInfo.next(this.userData);
        this.modalSuccess = 'Profile updated successfully!';
        setTimeout(() => this.closeModal(), 1800);
      },
      error: (err: any) => {
        this.submitting = false;
        this.modalError = err?.error?.error || 'Update failed. Please try again.';
      },
    });
  }

  submitChangePassword(): void {
    if (this.passwordForm.newPassword !== this.passwordForm.repeatNewPassword) {
      this.modalError = 'New passwords do not match.';
      return;
    }
    this.submitting = true;
    this.modalError = '';

    this.api.changePassword(this.passwordForm).subscribe({
      next: () => {
        this.submitting = false;
        this.modalSuccess = 'Password changed successfully!';
        setTimeout(() => this.closeModal(), 1800);
      },
      error: (err: any) => {
        this.submitting = false;
        this.modalError = err?.error?.error || 'Password change failed.';
      },
    });
  }

  confirmDelete(): void {
    this.submitting = true;
    this.modalError = '';

    this.api.deleteAccount().subscribe({
      next: () => {
        document.cookie = 'user=; Max-Age=0; path=/;';
        document.cookie = 'user=; Max-Age=0;';
        this.tool.isSignedIn.next(false);
        this.tool.userNavbarInfo.next(null);
        this.router.navigate(['/']);
      },
      error: (err: any) => {
        this.submitting = false;
        this.modalError = err?.error?.error || 'Delete failed. Please try again.';
      },
    });
  }

  closeProfileInfo(close: boolean): void {
    this.isProfileInfoShown = close;
  }

  cartListData(): void {
    this.cartList = [];
    this.total = 0;

    this.cartServ.getCart().subscribe((data: any) => {
      const cartItems: any[] = data.products;
      if (!cartItems?.length) return;

      const requests = cartItems.map((ci: any) => {
        const cached = localStorage.getItem(`product_${ci.productId}`);
        return cached
          ? of(JSON.parse(cached))
          : this.prodServ.getProductDetailInfo(ci.productId);
      });

      forkJoin(requests).subscribe((products: any[]) => {
        this.cartList = products.map((product: any, index: number) => ({
          ...product,
          quantity: cartItems[index].quantity,
        }));
        this.recalcTotal();
      });
    });
  }

  recalcTotal(): void {
    this.total = this.cartList.reduce(
      (sum: number, i: any) => sum + i.price.current * i.quantity,
      0
    );
  }

  updateQuantity(item: any, delta: number): void {
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    item.quantity = newQty;
    this.recalcTotal();
    this.quantitySubject.next({ item, newQty });
  }

  deleteItem(id: string): void {
    this.cartServ.deleteProduct({ id }).subscribe(() => this.cartListData());
  }

  removeAll(): void {
    this.cartServ.removeAll().subscribe(() => {
      this.cartList = [];
      this.total = 0;
    });
  }

  checkOut(): void {
    this.cartServ.checkOut().subscribe(() => {
      this.cartSMS = true;
      this.cartList = [];
      this.total = 0;
    });
  }

  logout(): void {
    document.cookie = 'user=; Max-Age=0; path=/;';
    document.cookie = 'user=; Max-Age=0;';
    this.tool.isSignedIn.next(false);
    this.tool.userNavbarInfo.next(null);
    this.router.navigate(['/']);
  }
}