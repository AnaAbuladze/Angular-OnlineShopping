import {
  Component,
  OnInit,
  OnDestroy,
  NgZone,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Slide {
  eyebrow: string;
  title: string[];
  desc: string;
  primaryBtn: string;
  secondaryBtn: string;
  bgUrl: string;
  accentColor: string;
  progressColor: string;
  theme: 'blue' | 'purple' | 'orange';
}

@Component({
  selector: 'app-shop-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './shop-banner.html',
  styleUrls: ['./shop-banner.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarouselComponent implements OnInit, OnDestroy {
  readonly DURATION = 3000;

  slides: Slide[] = [
    {
      eyebrow: 'New · MacBook Air',
      title: ['Impossibly', 'Light. M5', 'Mighty.'],
      desc: 'The worlds best consumer laptop just got even better. M5 chip. All-day battery. Starts at $1,099.',
      primaryBtn: 'Pre-order',
      secondaryBtn: 'Learn more',
      bgUrl: 'https://www.apple.com/v/home/cm/images/promos/macbook-air-m5/promo_macbook_air_m5_preorder__bpanndgew0s2_large_2x.jpg',
      accentColor: '#7eb3ff',
      progressColor: '#0071e3',
      theme: 'blue',
    },
    {
      eyebrow: 'Galaxy · S26 Ultra',
      title: ['AI Phone.', 'Pro Camera.', 'Zero Limits.'],
      desc: 'The Galaxy S26 Ultra redefines what a smartphone can do. Galaxy AI built in. Titanium frame. 200MP camera system.',
      primaryBtn: 'Buy Now',
      secondaryBtn: 'Compare',
      bgUrl: 'https://image-us.samsung.com/us/smartphones/galaxy-s26-ultra/gallery/SCOMMRCL-207-M3-Global-Group-Image-800x600.jpg?$product-details-jpg$',
      accentColor: '#a78bfa',
      progressColor: '#7c3aed',
      theme: 'purple',
    },
    {
      eyebrow: 'New · Apple Watch Series 11',
      title: ['Health.', 'Smarter.', 'On Your', 'Wrist.'],
      desc: 'Advanced health sensors. Thinner design. Brighter display. Apple Watch Series 11 — your most capable companion yet.',
      primaryBtn: 'Shop Now',
      secondaryBtn: 'Learn more',
      bgUrl: 'https://www.apple.com/v/home/cm/images/promos/apple-watch-series-11/promo_apple_watch_series_11__b63hxviqvonm_large_2x.jpg',
      accentColor: '#fb923c',
      progressColor: '#ea580c',
      theme: 'orange',
    },
    {
  eyebrow: 'New · Lenovo ThinkPad X1 Carbon',
  title: ['Built for', 'Those Who', 'Mean Business.'],
  desc: 'Ultra-lightweight. Military-grade durability. Intel Core Ultra 7 inside. The ThinkPad X1 Carbon Gen 13 — engineered for peak performance.',
  primaryBtn: 'Shop Now',
  secondaryBtn: 'Learn more',
  bgUrl: 'https://p3-ofp.static.pub/ShareResource/na/landing-pages/new-arrival/product-cards/lenovo-thinkpad-x9-plus-accessories-xl.jpg',
  accentColor: '#eebcc6',
  progressColor: '#9b8286',
  theme: 'red' as any,
},
  ];

  current = signal(0);
  progressWidth = signal(0);
  isAnimating = signal(false);

  currentSlide = computed(() => this.slides[this.current()]);

  private autoTimer: ReturnType<typeof setTimeout> | null = null;
  private progressInterval: ReturnType<typeof setInterval> | null = null;
  private pausedRemaining = 0;
  private pausedWidth = 0;
  private intervalStart = 0;
  private isPaused = false;
  private touchStartX = 0;

  constructor(private cdr: ChangeDetectorRef, private ngZone: NgZone) {}

  ngOnInit(): void {
   
    this.startAutoPlay(this.DURATION);
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  goTo(index: number): void {
    if (this.isAnimating()) return;
    this.isAnimating.set(true);
    this.clearTimers();
    this.current.set((index + this.slides.length) % this.slides.length);
    this.progressWidth.set(0);
    this.cdr.markForCheck();

    setTimeout(() => {
      this.isAnimating.set(false);
      if (!this.isPaused) this.startAutoPlay(this.DURATION);
      this.cdr.markForCheck();
    }, 100);
  }

  prev(): void { this.goTo(this.current() - 1); }
  next(): void { this.goTo(this.current() + 1); }

  onMouseEnter(): void {
    if (this.isPaused) return;
    this.isPaused = true;
    const elapsed = Date.now() - this.intervalStart;
    this.pausedRemaining = Math.max(0, this.DURATION - elapsed);
    this.pausedWidth = this.progressWidth();
    this.clearTimers();
  }

  onMouseLeave(): void {
    if (!this.isPaused) return;
    this.isPaused = false;
    this.startAutoPlay(this.pausedRemaining, this.pausedWidth);
  }

  onTouchStart(e: TouchEvent): void {
    this.touchStartX = e.touches[0].clientX;
  }

  onTouchEnd(e: TouchEvent): void {
    const diff = this.touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) this.goTo(this.current() + (diff > 0 ? 1 : -1));
  }

  counterText(): string {
    return `0${this.current() + 1} / 0${this.slides.length}`;
  }

  private startAutoPlay(duration: number, startWidth = 0): void {
    this.clearTimers();
    this.progressWidth.set(startWidth);
    this.intervalStart = Date.now();

    this.ngZone.runOutsideAngular(() => {
      const step = 100 / (duration / 50);

      this.progressInterval = setInterval(() => {
        const next = Math.min(this.progressWidth() + step, 100);
        this.progressWidth.set(next);
        this.cdr.markForCheck();
      }, 50);

      this.autoTimer = setTimeout(() => {
        this.ngZone.run(() => this.goTo(this.current() + 1));
      }, duration);
    });
  }

  private clearTimers(): void {
    if (this.autoTimer)        { clearTimeout(this.autoTimer);          this.autoTimer = null; }
    if (this.progressInterval) { clearInterval(this.progressInterval);  this.progressInterval = null; }
  }
}