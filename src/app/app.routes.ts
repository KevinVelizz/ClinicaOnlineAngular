import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin.guard';
import { authGuard } from './guards/auth.guard';
import { mailVerificadoGuard } from './guards/mail-verificado.guard';

export const routes: Routes = [

    {
        path: "login", loadComponent: () =>
            import('../app/components/login/login.component').then(
                (m) => m.LoginComponent
            ),
        canActivate: [authGuard]
    },


    {
        path: "register", loadComponent: () =>
            import('../app/components/register/register.component').then(
                (m) => m.RegisterComponent
            ),
        canActivate: [authGuard]
    },

    {
        path: "modal", loadComponent: () =>
            import('../app/components/modal-comentario/modal-comentario.component').then(
                (m) => m.ModalComentarioComponent
            ),
    },


    {
        path: "bienvenida", loadComponent: () =>
            import('../app/components/bienvenida/bienvenida.component').then(
                (m) => m.BienvenidaComponent
            ),
    },

    {
        path: "administrar", loadComponent: () =>
            import('../app/components/seccion-usuarios/seccion-usuarios.component').then(
                (m) => m.SeccionUsuariosComponent
            ),
        canActivate: [adminGuard]
    },

    {
        path: "misTurnos", loadComponent: () =>
            import('../app/components/mis-turnos/mis-turnos.component').then(
                (m) => m.MisTurnosComponent
            ),
    },

    {
        path: "solicitarTurno", loadComponent: () =>
            import('../app/components/solicitar-turno/solicitar-turno.component').then(
                (m) => m.SolicitarTurnoComponent
            ),
    },

    {
        path: "estadisticas", loadComponent: () =>
            import('../app/components/estadisticas/estadisticas.component').then(
                (m) => m.EstadisticasComponent
            ),
    },

    {
        path: "miPerfil", loadComponent: () =>
            import('../app/components/mi-perfil/mi-perfil.component').then(
                (m) => m.MiPerfilComponent
            ),
    },

    {
        path: "seccionPacientes", loadComponent: () =>
            import('../app/components/seccion-pacientes/seccion-pacientes.component').then(
                (m) => m.SeccionPacientesComponent
            ),
    },

    {
        path: "espera", loadComponent: () =>
            import('../app/components/espera/espera.component').then(
                (m) => m.EsperaComponent
            ),
        canDeactivate: [mailVerificadoGuard], canActivate: [authGuard]
    },

    {
        path: '',
        redirectTo: 'bienvenida',
        pathMatch: 'full',
    },
];
