import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainLobbyComponent } from './components/main-platform/main-lobby/main-lobby.component';
import { UserEnvironmentComponent } from './components/main-platform/user-environment/user-environment.component';
import { UserGroupComponent } from './components/main-platform/user-group/user-group.component';
import { SignInComponent } from './components/main-platform/sign-in/sign-in.component';
import { SignUpComponent } from './components/main-platform/sign-up/sign-up.component';
import { LandingPageComponent } from './components/main-platform/landing-page/landing-page.component';

const routes: Routes = [
  { path: '',   redirectTo: '/landing-page', pathMatch: 'full' },
  { path: 'lobby', component: MainLobbyComponent },
  { path: 'user-environment', component: UserEnvironmentComponent},
  { path: 'user-group', component: UserGroupComponent},
  { path: 'sign-in', component: SignInComponent},
  { path: 'sign-up', component: SignUpComponent},
  { path: 'landing-page', component: LandingPageComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
