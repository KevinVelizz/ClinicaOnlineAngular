import { Routes } from '@angular/router';

export const routes: Routes = [

    {
        path: "splash", loadComponent: () =>
            import('../app/components/splash-art/splash-art.component').then(
                (m) => m.SplashArtComponent
            ),
    },

    {
        path: "login", loadComponent: () =>
            import('../app/components/login/login.component').then(
                (m) => m.LoginComponent
            ),
    },

    {
        path: "register", loadComponent: () =>
            import('../app/components/register/register.component').then(
                (m) => m.RegisterComponent
            ),
    },

    {
        path: '',
        redirectTo: 'splash',
        pathMatch: 'full',
    },
];
