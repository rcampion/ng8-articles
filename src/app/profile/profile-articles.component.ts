import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatSort, MatPaginator } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';

import { Article } from '../core/models/article.model';
import { ArticlesDataSource } from '../core/services/articles.datasource';
import { ArticlesService } from '../core/services/articles.service';

import { ArticleListConfig, Profile } from '../core';

import { ErrorHandlerService } from '../core/services/error-handler.service';

@Component({
	selector: 'app-profile-articles',
	templateUrl: './profile-articles.component.html'
})
export class ProfileArticlesComponent implements OnInit {
	query: ArticleListConfig;

	profile: Profile;
	articlesListConfig: ArticleListConfig = {
		type: 'all',
		filters: {}
	};

	dataSource: ArticlesDataSource;
	sortProperty = '';
	@ViewChild(MatSort, { static: false }) sort: MatSort;
	@ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;

	@Input()
	set config(config: ArticleListConfig) {

		if (config) {
			this.query = config;
			//this.currentPage = 1;
			this.loadArticlesPage();
		}

	}

	constructor(
		private repository: ArticlesService,
		private errorService: ErrorHandlerService,
		private route: ActivatedRoute,
		private router: Router
	) { }



	ngOnInit() {

		this.route.parent.data.subscribe(
			(data: { profile: Profile }) => {
				this.profile = data.profile;
				this.articlesListConfig = {
					type: 'all',
					filters: {}
				}; // Only method I found to refresh article load on swap
				this.articlesListConfig.filters.author = this.profile.userName;
				this.query = this.articlesListConfig;
			}
		);

		this.dataSource = new ArticlesDataSource(this.repository, this.errorService);

		this.dataSource.loadArticles('', 'asc', 0, 6, this.query);
	}

	loadArticlesPage() {
		if (this.dataSource) {


			this.articlesListConfig.filters.author = this.profile.userName;

			this.query = this.articlesListConfig;

			this.dataSource.loadArticles(

				//this.input.nativeElement.value,
				this.sortProperty,
				this.sort.direction,
				this.paginator.pageIndex,
				this.paginator.pageSize,
				this.query);
		}
	}
}
