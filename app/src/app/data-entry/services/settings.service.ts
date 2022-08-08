import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  HALCollection,
  HALDeserializeFrom,
  HALResource,
  HALSerializerService,
} from '@app/core/services/hal-serializer.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export class Setting {
  @HALDeserializeFrom('name')
  name!: string;
  @HALDeserializeFrom('value')
  value!: unknown;
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  settings: Setting[] = [];

  constructor(private http: HttpClient, private serializerService: HALSerializerService) {}

  load$(): Observable<unknown> {
    return this.http.get<HALCollection>(`${environment.api.baseURL}/settings`).pipe(
      tap((halResponse: HALCollection) => {
        const halResources: HALResource[] = halResponse._embedded['settings'];
        this.settings = halResources.map((halResource) =>
          this.serializerService.deserialize<Setting>(halResource, Setting)
        );
      })
    );
  }

  get<T = unknown | undefined>(name: string): T | undefined {
    const setting = this.settings.find((s) => s.name === name);
    if (!setting) {
      // Maybe throw an error?
      console.warn(`SettingsService.get(), ${name} not found`);
      return undefined;
    }
    return setting.value as T;
  }
}
