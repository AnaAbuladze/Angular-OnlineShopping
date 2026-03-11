import { Routes } from '@angular/router';
import { Home } from './home/home';
import { ProfilePage } from './profile-page/profile-page';
import { Cart } from './cart/cart';
import { Shop } from './shop/shop';
import { Detail } from './shop/detail/detail';

export const routes: Routes = [
    {path:"",component:Home},
    {path:"profile",component:ProfilePage},
    {path:"cart",component:Cart},
    {path:"shop",component:Shop},
    {path: "details/:id", component: Detail},

];
