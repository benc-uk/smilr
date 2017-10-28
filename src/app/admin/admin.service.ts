import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';

@Injectable()
export class AdminService {
  
  // Everyone is admin!!
  isAdmin = true;

  constructor() { }

}