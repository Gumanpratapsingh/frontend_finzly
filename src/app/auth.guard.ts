import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private http: HttpClient, private router: Router) {}

  canActivate(): Observable<boolean> {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return new Observable(observer => observer.next(false));
    }

    return this.http.get<boolean>('https://finzlyapp-production.up.railway.app/api/auth/validate-token', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).pipe(
      map((response: any) => {
        if (response) {
          return true;
        } else {
          this.router.navigate(['/login']);
          return false;
        }
      }),
      catchError(() => {
        this.router.navigate(['/login']);
        return new Observable<boolean>(observer => observer.next(false));
      })
    );
  }
}
