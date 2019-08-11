import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { ArticleListConfig, TagsService } from '../core';
import { UsersService } from '../core/services/users.service';

@Component({
	selector: 'app-home-page',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

	constructor(
		private router: Router,
		private tagsService: TagsService,
		private userService: UsersService
	) { }

	isAuthenticated: boolean;
	listConfig: ArticleListConfig = {
		type: 'all',
		filters: {}
	};
	tags: Array<string> = [];
	tagsLoaded = false;

	ngOnInit() {


		if (this.userService.isUserAuthenticated()) {

			this.isAuthenticated = true;
            /*
                        // set the article list accordingly
                        if (this.isAuthenticated) {
                            this.setListTo('feed');
                        } else {
                            this.setListTo('all');
                        }
            */

			this.setListTo('all');
		}
		else {
			this.router.navigateByUrl('/login');
		}


		this.tagsService.getAll()
			.subscribe(tags => {
				this.tags = tags;
				this.tagsLoaded = true;
			});
	}

	setListTo(type: string = '', filters: Object = {}) {
		// If feed is requested but user is not authenticated, redirect to login
		if (type === 'feed' && !this.isAuthenticated) {
			this.router.navigateByUrl('/login');
			return;
		}

		// Otherwise, set the list object
		this.listConfig = { type: type, filters: filters };
	}

}
