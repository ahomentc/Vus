import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

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
    RecommendationComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
