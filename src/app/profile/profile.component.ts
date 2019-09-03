import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Event, NavigationEnd } from '@angular/router';

import { Profile } from '../core';

import { User } from '../core/models/user';

import { UsersService } from '../core/services/users.service';

import { concatMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  public href = '';
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UsersService
  ) {

    this.href = window.location.pathname;
    this.href = this.href.replace('/articles', '');
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        // console.log("this.href=" + this.href);
        // console.log("this.router.url=" + this.router.url);
        if (this.router.url.includes('/profile') && (!this.router.url.includes('/favorites'))) {
          if (this.href !== this.router.url) {
            window.location.reload();
          }
        }
      }
    });

  }

  profile: Profile;
  currentUser: User;
  isUser: boolean;

  ngOnInit() {

    this.route.data.pipe(
      concatMap((data: { profile: Profile }) => {
        this.profile = data.profile;
        // Load the current user's data.
        return this.userService.currentUser.pipe(tap(
          (userData: User) => {
            this.currentUser = userData;
            this.isUser = (this.currentUser.userName === this.profile.userName);
          }
        ));
      })
    ).subscribe();
    /*
        this.router.navigate(['/profile', this.currentUser.userName])
        .then(() => {window.location.reload(); });
    */

  }

  onToggleFollowing(following: boolean) {
    this.profile.following = following;
  }

}
