
import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs';
import { Article } from '../models/article.model';
import { ArticlesService } from './articles.service';
import { BehaviorSubject } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { PaginationPropertySort } from '../interface/pagination';
import { ErrorHandlerService } from './error-handler.service';

export class ArticlesDataSource implements DataSource<Article> {

    private articlesSubject = new BehaviorSubject<Article[]>([]);

    private loadingSubject = new BehaviorSubject<boolean>(false);

    public loading$ = this.loadingSubject.asObservable();

	articles: Article[];
		
    public total = 0;

    constructor(private articlesService: ArticlesService,
        private errorService: ErrorHandlerService) {

    }

	getArticles(){
		return this.articles;
	}

    loadArticles(
        //filter: string,
        sortProperty: string,
        sortDirection: string,
        pageIndex: number,
        pageSize: number) {

        this.loadingSubject.next(true);

        const sort = new PaginationPropertySort();
        sort.property = sortProperty;
        sort.direction = sortDirection;
		const filter: string = '';

        this.articlesService.findArticlesWithSortAndFilter(filter, sort,
            pageIndex, pageSize).pipe(
                catchError(() => of([])),
                finalize(() =>
					this.loadingSubject.next(false))
            )
            .subscribe(response => {
				this.articlesSubject.next(response.content);
				this.articles = response.content;
                this.total = response.totalElements;
            },
                error => {
                    // this.errorService.dialogConfig = { ...this.dialogConfig };
                    this.errorService.handleError(error);
                }
            );
    }

    connect(collectionViewer: CollectionViewer): Observable<Article[]> {
        console.log('Connecting data source');
        return this.articlesSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.articlesSubject.complete();
        this.loadingSubject.complete();
    }

}

