import { Component, ViewChild, Input } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Article, ArticleListConfig, ArticlesService } from '../../core';
import { environment } from './../../../environments/environment';
import { PaginationPropertySort } from '../../core/interface/pagination';
import { BehaviorSubject } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ErrorHandlerService } from '../../core/services/error-handler.service';

import { ArticlesDataSource } from '../../core/services/articles.datasource';

import { MatPaginator } from '@angular/material';

@Component({
    selector: 'app-article-list',
    styleUrls: ['article-list.component.css'],
    templateUrl: './article-list.component.html'
})
export class ArticleListComponent {
    dataSource: ArticlesDataSource;
    @ViewChild(MatPaginator, {static:false}) paginator: MatPaginator;

    private articlesSubject = new BehaviorSubject<Article[]>([]);

    private loadingSubject = new BehaviorSubject<boolean>(false);

    public total = 0;

    constructor(
        private articlesService: ArticlesService,
        private errorHandlerService: ErrorHandlerService
    ) { }

    @Input() limit: number;
    @Input()
    set config(config: ArticleListConfig) {
        if (config) {
            this.query = config;
            this.currentPage = 1;
            this.runQuery();
        }
    }

    query: ArticleListConfig;
    results: Article[];
    loading = false;
    currentPage = 1;
    totalPages: Array<number> = [1];

    setPageTo(pageNumber) {
        this.currentPage = pageNumber;
        this.runQuery();
    }

    runQuery() {
        this.loading = true;
        this.results = [];

        // Create limit and offset filter (if necessary)
        if (this.limit) {
            this.query.filters.limit = this.limit;
            this.query.filters.offset = (this.limit * (this.currentPage - 1));
        }

        this.articlesService.query(this.query)
            .subscribe(data => {
                this.loading = false;
                this.results = data.articles;

                // Used from http://www.jstips.co/en/create-range-0...n-easily-using-one-line/
                this.totalPages = Array.from(new Array(Math.ceil(data.articlesCount / this.limit)), (val, index) => index + 1);
            },
                error => {
                    // this.errorService.dialogConfig = { ...this.dialogConfig };
                    this.errorHandlerService.handleTextError(error);
                }
            );
    }

    loadArticles(
        filter: string,
        sortProperty: string,
        sortDirection: string,
        pageIndex: number,
        pageSize: number) {

        this.loadingSubject.next(true);

        const sort = new PaginationPropertySort();
        sort.property = sortProperty;
        sort.direction = sortDirection;

        this.articlesService.findArticlesWithSortAndFilter(filter, sort,
            pageIndex, pageSize).pipe(
                catchError(() => of([])),
                finalize(() => this.loadingSubject.next(false))
            )
            .subscribe(response => {
                this.articlesSubject.next(response.content);
                this.total = response.totalElements;
            },
                error => {
                    // this.errorService.dialogConfig = { ...this.dialogConfig };
                    this.errorHandlerService.handleError(error);
                }
            );
    }

}
