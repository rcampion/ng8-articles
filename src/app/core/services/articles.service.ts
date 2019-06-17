import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';

import { ApiService } from './api.service';

import { Component, Input } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Article, ArticleListConfig } from '../../core';
import { environment } from './../../../environments/environment';
import { PaginationPage, PaginationPropertySort } from '../interface/pagination';


@Injectable()
export class ArticlesService {
    constructor(
        private http: HttpClient,
        private apiService: ApiService
    ) { }

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
            return this.apiService.post('/articles', article )
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
        return this.apiService.delete('/tags/' + tag + '/' + id);
    }

    findArticlesWithSortAndFilter(

        filter = '', sort: PaginationPropertySort,
        pageNumber = 0, pageSize = 3): Observable<any> {
        let apiUrl = this.createCompleteRoute('/articles', environment.api_url);
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
        return this.http.get(apiUrl, {
            params: new HttpParams()

                .set('search', search)

                .set('sort', sortTest)

                .set('page', pageNumber.toString())
                .set('size', pageSize.toString())

        }).pipe(
            // map(res => res['content']
            map(res => res),
            // catchError(error => { this.errorService.handleError(error); return Observable.throw(error.statusText); })
        );
    }

    private createCompleteRoute = (route: string, envAddress: string) => {
        return `${envAddress}/${route}`;
    }
}
