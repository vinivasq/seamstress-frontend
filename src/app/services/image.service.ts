import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  constructor(private client: HttpClient) {}

  async getImage(imageName: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'image/*',
    });

    return await firstValueFrom(
      this.client.get(`${environment.imageAPI}/${imageName}`, {
        responseType: 'blob',
        headers: headers,
      })
    );
  }
}
