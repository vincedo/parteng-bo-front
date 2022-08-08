/**
 * @file
 * Service to store and retrieve arbitrary config data.
 *
 * Supported sources:
 *   - app data
 *   - @TODO hardcoded config from "environment" file
 *   - @TODO backend config fetched dynamically
 */
import { Injectable } from '@angular/core';
import { InstrumentType } from '@app/data-entry/models';
import { PersonQuality } from '@app/data-entry/models/person-quality.model';
import { OwnershipType, TransferCategory, TransferType } from '@app/data-entry/transfer/models';
import { FundType, LegalEntityType, ProjectTemplate2, StandardFolder2, World } from '@app/project/models';

import { EnvironmentInfo } from '../models/environment-info';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private _envInfo!: EnvironmentInfo;

  /**
   * Cached, shared data used throughout the app.
   * Contains mostly static list of values such as allLegalEntityTypes, allFundTypes...
   * The upside of cached data is it's available synchronously, as opposed to NgRx Store async data.
   */
  private _cachedData: Map<string, unknown> = new Map();

  constructor() {}

  setEnvironmentInfo(info: EnvironmentInfo): void {
    this._envInfo = info;
  }

  getEnvironmentInfo(): EnvironmentInfo {
    return this._envInfo;
  }

  saveInCache<T>(key: string, value: T): void {
    this._cachedData.set(key, value);
  }

  saveMultiInCache(data: { [k: string]: unknown }): void {
    for (const key of Object.keys(data)) {
      this.saveInCache(key, data[key]);
    }
  }

  getFromCache<T>(key: string): T {
    if (!this._cachedData.has(key)) {
      throw new Error(`No "${key}" data found in cache.`);
    }
    return this._cachedData.get(key) as T;
  }

  getAllProjectTemplates() {
    return this.getFromCache<ProjectTemplate2[]>('allTemplates');
  }

  getAllStandardFolders() {
    return this.getFromCache<StandardFolder2[]>('allStandardFolders');
  }

  getAllWorlds() {
    return this.getFromCache<World[]>('allWorlds');
  }

  getAllLegalEntityTypes() {
    return this.getFromCache<LegalEntityType[]>('allLegalEntityTypes');
  }

  getAllFundTypes() {
    return this.getFromCache<FundType[]>('allFundTypes');
  }

  getAllPersonQualities() {
    return this.getFromCache<PersonQuality[]>('allPersonQualities');
  }

  getAllTransferTypes() {
    return this.getFromCache<TransferType[]>('allTransferTypes');
  }

  getAllTransferCategories() {
    return this.getFromCache<TransferCategory[]>('allTransferCategories');
  }

  getAllInstrumentTypes() {
    return this.getFromCache<InstrumentType[]>('allInstrumentTypes');
  }

  getAllOwnershipTypes() {
    return this.getFromCache<OwnershipType[]>('allOwnershipTypes');
  }
}
