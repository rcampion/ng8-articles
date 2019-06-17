import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import { Comment } from '../models';
import { map } from 'rxjs/operators';


@Injectable()
export class CommentsService {
    constructor(
        private apiService: ApiService
    ) { }

    addOld(slug, payload): Observable<Comment> {
        return this.apiService
            .post(
                `/articles/${slug}/comments`,
                { comment: { body: payload } }
            ).pipe(map(data => data.comment));
    }

    addJunk(slug, payload): Observable<Comment> {
        return this.apiService
            .post(
                `/articles/${slug}/comments`,
                { comment: { body: payload } }
            ).pipe(map(data => data.comment));
    }

    add(id, payload): Observable<Comment> {

        return this.apiService.post(`/articles/${id}/comments`, payload )
                .pipe(map(data => data.comment));

    }

    getAll(id): Observable<Comment[]> {
        return this.apiService.get(`/articles/${id}/comments`)
            .pipe(map(data => data.comments));
    }

    destroy(commentId, articleId) {
        return this.apiService
            .delete(`/articles/${articleId}/comments/${commentId}`);
    }

}
