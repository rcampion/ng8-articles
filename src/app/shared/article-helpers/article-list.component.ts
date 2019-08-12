import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef, Input } from '@angular/core';
import { MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Article } from '../../core/models/article.model';
import { ArticlesDataSource } from '../../core/services/articles.datasource';
import { ArticlesService } from '../../core/services/articles.service';

import { ArticleListConfig } from '../../core';

import { PaginationPage, PaginationPropertySort } from '../../core/interface/pagination';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { Router } from '@angular/router';

import { defaultItemsCountPerPage } from './../../common/constants';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, startWith, tap, delay } from 'rxjs/operators';
import { merge } from 'rxjs';
import { fromEvent } from 'rxjs';

@Component({
	selector: 'app-article-list',
	styleUrls: ['article-list.component.css'],
	templateUrl: './article-list.component.html'
})
export class ArticleListComponent implements OnInit, AfterViewInit {

	public displayedColumns = ['title', 'description', 'author', 'details'];

	dataSource: ArticlesDataSource;

	query: ArticleListConfig;
    results: Article[];
    loading = false;
    currentPage = 1;
    totalPages: Array<number> = [1];

	@ViewChild(MatSort, { static: false }) sort: MatSort;
	@ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
	@ViewChild('input', { static: false }) input: ElementRef;

	@Input() limit: number;
	
	@Input()
	set config(config: ArticleListConfig) {

		
		if (config) {
			           this.query = config;
			           //this.currentPage = 1;
			           this.loadArticlesPage();
		}

	}

	currentArticle: Article;

	articles: Article[];

	articlesLength = 0;

	sortProperty = '';

	private dialogConfig;

	// deleteContactDialogRef: MatDialogRef<ContactDeleteDialogComponent>;

	pageNumber: number;

	page: PaginationPage<any>;


	// tslint:disable-next-line:max-line-length
	constructor(private repository: ArticlesService, private errorService: ErrorHandlerService, private router: Router, private dialog: MatDialog, private changeDetectorRefs: ChangeDetectorRef) { }
	ngOnInit() {

		this.dataSource = new ArticlesDataSource(this.repository, this.errorService);

		this.dataSource.loadArticles('', 'asc', 0, 6,this.query);

		this.repository.getArticles()
			.subscribe((data) => this.setArticles(data));

		this.dialogConfig = {
			height: '200px',
			width: '400px',
			disableClose: true,
			data: {}
		};
	}

	ngAfterViewInit() {

		this.sort.sortChange.subscribe((event) => {
			this.paginator.pageIndex = 0;
			this.sortProperty = event.active;
		});
/*
		fromEvent(this.input.nativeElement, 'keyup')
			.pipe(
				debounceTime(150),
				distinctUntilChanged(),
				tap(() => {
					this.paginator.pageIndex = 0;

					this.loadArticlesPage();
				})
			)
			.subscribe();
*/
		merge(this.sort.sortChange, this.paginator.page)
			.pipe(
				tap(() => this.loadArticlesPage())
			)
			.subscribe(

				data => {
					console.log(data);
				}

			);

		//		this.repository.getArticles()
		//			.subscribe((data) => this.setArticles(data));
	}

	setArticles(data) {
		this.articles = data;
	}

	public redirectToAdd = () => {
		const url = `/article/create`;
		this.router.navigate([url]);
	}

	public redirectToDetails = (id: string) => {
		const url = `/article/${id}`;
		this.router.navigate([url]);
	}

	public redirectToUpdate = (id: string) => {
		const url = `/article/update/${id}`;
		this.router.navigate([url]);
	}
	/*
		public redirectToDelete = (id: string) => {
			this.dialogConfig.data = {
				id: id
			};
			const dialogRef = this.dialog.open(ContactDeleteDialogComponent, this.dialogConfig)
				.afterClosed().subscribe(result => {
					this.loadContactsPage();
				});
		}
	*/
	loadArticlesPage() {
		if(this.dataSource) {
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
