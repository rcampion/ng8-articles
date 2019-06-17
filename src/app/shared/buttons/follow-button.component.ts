import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { concatMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Profile, ProfilesService } from '../../core';
import { UsersService } from '../../core/services/users.service';

@Component({
    selector: 'app-follow-button',
    templateUrl: './follow-button.component.html'
})
export class FollowButtonComponent {
    constructor(
        private profilesService: ProfilesService,
        private router: Router,
        private userService: UsersService
    ) { }

    @Input() profile: Profile;
    @Output() toggle = new EventEmitter<boolean>();
    isSubmitting = false;

    toggleFollowing() {
        this.isSubmitting = true;
        // TODO: remove nested subscribes, use mergeMap

        if (this.userService.isUserAuthenticated()) {
            // Not authenticated? Push to login screen
            if (!this.userService.isUserAuthenticated()) {
                this.router.navigateByUrl('/login');
                return of(null);
            }

            // Follow this profile if we aren't already
            if (!this.profile.following) {

                return this.profilesService.follow(this.profile.userName).subscribe(
                        data => {
                            this.isSubmitting = false;
                            this.toggle.emit(true);
                        },
                        err => this.isSubmitting = false );
/*
                return this.profilesService.follow(this.profile.userName)
                    .pipe(tap(
                        data => {
                            this.isSubmitting = false;
                            this.toggle.emit(true);
                        },
                        err => this.isSubmitting = false
                    ));
*/




                // Otherwise, unfollow this profile
            } else {

                return this.profilesService.unfollow(this.profile.userName).subscribe(
                        data => {
                            this.isSubmitting = false;
                            this.toggle.emit(false);
                        },
                        err => this.isSubmitting = false );
                /*
                return this.profilesService.unfollow(this.profile.userName)
                    .pipe(tap(
                        data => {
                            this.isSubmitting = false;
                            this.toggle.emit(false);
                        },
                        err => this.isSubmitting = false
                    ));

                */
            }
        }
    }
}

