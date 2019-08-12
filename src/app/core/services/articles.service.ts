import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';

import { ApiService } from './api.service';

import { Component, Input } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { ArticleListConfig } from '../../core';
import { Article } from '../models/article.model';
import { environment } from './../../../environments/environment';
import { PaginationPropertySort } from '../interface/pagination';

import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ArticlesService {
	test = new Subject();

	simpleObservable = new Observable((observer) => {

		observer.next('test');
		observer.complete();
	})

	//	articles: Article[];
	articles = new BehaviorSubject<Article[]>([]);
	
	constructor(
		private http: HttpClient,
		private apiService: ApiService
	) {
	}

	getArticles(): Observable<Article[]> {
		//return of(this.articles);
		return this.articles;
	}

	query(config: ArticleListConfig): Observable<{ articles: Article[], articlesCount: number }> {
		// Convert any filters over to Angular's URLSearchParams
		const params = {};

		Object.keys(config.filters)
			.forEach((key) => {
				params[key] = config.filters[key];
			});

		return this.apiService
			.get(
				'/articles' + ((config.type === 'feed') ? '/feed' : ''),
				new HttpParams({ fromObject: params })
			);
	}

	get(id): Observable<Article> {
		return this.apiService.get('/articles/' + id)
			.pipe(map(data => data.article));
	}

	destroy(id) {
		return this.apiService.delete('/articles/' + id);
	}

	save(article): Observable<Article> {
		// If we're updating an existing article
		if (article.id) {
			const jsonString = JSON.stringify(article);
			return this.apiService.post('/articles/' + article.id, jsonString)
				.pipe(map(data => data.article));

			// Otherwise, create a new article
		} else {
			return this.apiService.post('/articles', article)
				.pipe(map(data => data.article));
		}
	}

	favorite(id): Observable<Article> {
		return this.apiService.post('/articles/' + id + '/favorite');
	}

	unfavorite(id): Observable<Article> {
		return this.apiService.delete('/articles/' + id + '/favorite');
	}

	deleteTag(tag, id): Observable<Article> {
		if(tag!='')
			return this.apiService.delete('/tags/' + tag + '/' + id);
		else
			return this.apiService.delete('/tags/' + id);
	}

	findArticlesWithSortAndFilter(

		filter = '', sort: PaginationPropertySort,
		pageNumber = 0, pageSize = 3, config:ArticleListConfig): Observable<any> {
		//let apiUrl = this.createCompleteRoute('articles', environment.api_url);
		let apiUrl = this.createCompleteRoute('articles' + ((config.type === 'feed') ? '/feed' : ''), environment.api_url);
		const paramsx: any = { page: pageNumber, size: pageSize };
		if (sort != null) {
			paramsx.sort = sort.property + ',' + sort.direction;
		}
		// const sortTest = 'firstName' + '\&' + 'firstName.dir=desc';
		// const sortTestEncoded = encodeURIComponent(sortTest);
		let sortTest = sort.direction;
		if (sort.property !== '') {
			sortTest = sort.property + ',' + sort.direction;
		}
		let search: string;
		if (filter !== '') {
			apiUrl = this.createCompleteRoute('/articles/search', environment.api_url);
			// search = 'firstName==' + filter + '* or ' + 'lastName==' + filter + '*';
			// search = 'lastName==' + filter + '*';
			search = 'firstName==' + filter + '* or ' + 'lastName==' + filter + '* or ' + 'company==' + filter + '*';
		}
		
		let test = config.toString();

		const paramsy = {};

		Object.keys(config.filters)
			.forEach((key) => {
				paramsy[key] = config.filters[key];
			});

		let params = new HttpParams( {fromObject: paramsy} );

		params = params.set('search', search);
		params = params.set('sort', sortTest);
		params = params.set('page', pageNumber.toString());
		params = params.set('size', pageSize.toString());

		return this.http.get(apiUrl, { params })

			.pipe(
				// map(res => res['content']
				map(res => res),
				//tap(data => { this.setArticles(data['content']) })
				tap(data => { this.articles.next(data['content']) })

				);

	}

	setArticles(arg0: any): any {
		this.articles = arg0;
	}

	private createCompleteRoute = (route: string, envAddress: string) => {
		return `${envAddress}/${route}`;
	}
}
