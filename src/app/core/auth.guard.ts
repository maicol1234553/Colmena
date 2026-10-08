import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const token = localStorage.getItem('evieland.token');
  if (token) return true;
  return inject(Router).createUrlTree(['/auth']);
};

export const guestGuard: CanActivateFn = () => {
  const token = localStorage.getItem('evieland.token');
  return token ? inject(Router).createUrlTree(['/dashboard']) : true;
};
