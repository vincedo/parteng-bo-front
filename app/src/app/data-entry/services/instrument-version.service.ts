import { Injectable } from '@angular/core';
import { HalApiService } from '@app/core/services/hal-api.service';
import { Project } from '@app/project/models';
import { forkJoin, Observable } from 'rxjs';
import { Attribute } from '../models/attribute.model';
import { InstrumentVersion } from '../models/instrument-version.model';
import { AttributeService } from './attribute.service';
import { SettingsService } from './settings.service';

@Injectable({ providedIn: 'root' })
export class InstrumentVersionService {
  constructor(
    private halApiService: HalApiService,
    private settingsService: SettingsService,
    private attributeService: AttributeService
  ) {}

  newInstrumentVersion(project: Project, effectiveDate: Date, attributes: Attribute[]): InstrumentVersion {
    const instrumentVersion = new InstrumentVersion();
    instrumentVersion.status = this.settingsService.get<number>('STATUS_ACTIVE')!;
    instrumentVersion.creationProjectId = project.id;
    instrumentVersion.effectiveDate = effectiveDate;
    instrumentVersion.attributes = attributes;
    // TODO: improve
    instrumentVersion.attributes.forEach((attribute) => {
      delete attribute.id;
    });
    return instrumentVersion;
  }

  addInstrumentVersion(instrumentVersion: InstrumentVersion): Observable<InstrumentVersion> {
    return this.halApiService.postOne$<InstrumentVersion>('/instrument-versions', {}, instrumentVersion);
  }

  updateInstrumentVersion(instrumentVersion: InstrumentVersion): Observable<any> {
    return forkJoin([
      this.halApiService.putOne$<InstrumentVersion>(
        `/instrument-versions/${instrumentVersion.id}`,
        {},
        instrumentVersion
      ),
      ...instrumentVersion.attributes.map((attribute) => this.attributeService.updateAttribute(attribute)),
    ]);
  }

  deleteInstrumentVersion(instrumentVersion: InstrumentVersion): Observable<any> {
    return this.halApiService.deleteOne$<InstrumentVersion>(`/instrument-versions/${instrumentVersion.id}`);
  }
}
