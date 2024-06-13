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
        path: "bienvenida", loadComponent: () =>
            import('../app/components/bienvenida/bienvenida.component').then(
                (m) => m.BienvenidaComponent
            ),
    },

    {
        path: "usuarios", loadComponent: () =>
            import('../app/components/seccion-usuarios/seccion-usuarios.component').then(
                (m) => m.SeccionUsuariosComponent
            ),
    },

    {
        path: '',
        redirectTo: 'bievenida',
        pathMatch: 'full',
    },
];
