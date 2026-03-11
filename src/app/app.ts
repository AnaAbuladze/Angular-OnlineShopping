import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Head } from "./head/head";
import { Navbar } from "./navbar/navbar";
import { Footer } from "./footer/footer";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Head, Navbar, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('onlineShopping');
}