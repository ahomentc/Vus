import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainPlatformComponent } from './components/main-platform/main-platform.component';
import { NavigationComponent } from './components/main-platform/navigation/navigation.component';
import { SignInComponent } from './components/main-platform/sign-in/sign-in.component';
import { UserEnvironmentComponent } from './components/main-platform/user-environment/user-environment.component';
import { UserGroupComponent } from './components/main-platform/user-group/user-group.component';
import { MainLobbyComponent } from './components/main-platform/main-lobby/main-lobby.component';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SuggestionContainerComponent } from './components/main-platform/main-lobby/suggestion-container/suggestion-container.component';
import { RecommendationComponent } from './components/main-platform/main-lobby/recommendation/recommendation.component';
import { SignUpComponent } from './components/main-platform/sign-up/sign-up.component';
import { FirstPageComponent } from './components/main-platform/first-page/first-page.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CustomNgMaterialModule } from './common/custom-ng-material-module';

@NgModule({
  declarations: [
    AppComponent,
    MainPlatformComponent,
    NavigationComponent,
    SignInComponent,
    UserEnvironmentComponent,
    UserGroupComponent,
    MainLobbyComponent,
    SuggestionContainerComponent,
    RecommendationComponent,
    SignUpComponent,
    FirstPageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    BrowserAnimationsModule,
    CustomNgMaterialModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
