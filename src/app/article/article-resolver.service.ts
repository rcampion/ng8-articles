import { Injectable, } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

import { Article, ArticlesService } from '../core';

import { UsersService } from '../core/services/users.service';

import { ErrorHandlerService } from '../core/services/error-handler.service';

import { catchError } from 'rxjs/operators';

@Injectable()
export class ArticleResolver implements Resolve<Article> {
  constructor(
    private articlesService: ArticlesService,
    private router: Router,
    private userService: UsersService,
    private errorHandlerService: ErrorHandlerService
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> {

    return this.articlesService.get(route.params['id'])
      .pipe(catchError(error => {
          this.errorHandlerService.handleError(error);
          this.router.navigateByUrl('/');
          return Observable.throw(error.statusText);
        }));
  }
}
