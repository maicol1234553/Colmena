import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

export const TOKEN_KEY = 'evieland.token';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem(TOKEN_KEY);
  const isApiRequest =
    req.url.startsWith('/api') || req.url.startsWith(environment.apiUrl);

  if (token && isApiRequest) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};
