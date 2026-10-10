import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

const TOKEN_KEY = 'evieland.token';

/** Verifica si el token JWT está expirado (decodifica el payload sin verificar firma) */
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

/** Limpia el token si existe y está expirado */
function cleanExpiredToken(): void {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token && isTokenExpired(token)) {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export const authGuard: CanActivateFn = () => {
  cleanExpiredToken();
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) return true;
  return inject(Router).createUrlTree(['/auth']);
};

export const guestGuard: CanActivateFn = () => {
  cleanExpiredToken();
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? inject(Router).createUrlTree(['/dashboard']) : true;
};
