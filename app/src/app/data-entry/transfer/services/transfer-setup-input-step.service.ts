import { Injectable } from '@angular/core';
import { RestService } from '@app/core/services';
import { HALResource } from '@app/shared/models';
import { PartengApiService, SerializerService } from '@app/shared/services';
import { Observable } from 'rxjs';
import { TransferSetupInputStep, TransferSetupInputStepDto } from '../models';

@Injectable({ providedIn: 'root' })
class TransferSetupInputStepSerializerService extends SerializerService<
  TransferSetupInputStep,
  TransferSetupInputStepDto
> {
  fromDto(dto: HALResource<TransferSetupInputStepDto>): TransferSetupInputStep {
    return new TransferSetupInputStep(dto);
  }

  toDto(entity: TransferSetupInputStep): any {
    return {
      ...this.getDtoBaseProps(entity),
      // @TODO
    };
  }
}

@Injectable({ providedIn: 'root' })
export class TransferSetupInputStepService extends PartengApiService<
  TransferSetupInputStep,
  HALResource<TransferSetupInputStepDto>
> {
  constructor(rest: RestService, serializer: TransferSetupInputStepSerializerService) {
    super(rest, serializer, '/setup-transfer-input-steps', 'setup_transfer_input_steps');
  }

  getAll$(): Observable<TransferSetupInputStep[]> {
    return this.getCollection$();
  }
}
